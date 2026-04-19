import { generateObject } from "ai";
import { z } from "zod";
import { aiModel } from "@/lib/ai";
import { CommonplacePos } from "@/types";

export const POS_ENUM = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
] as const;

export const SuggestedWordSchema = z.object({
  front: z.string().describe("the English word or short phrase, lemma form"),
  back: z.string().describe("concise Thai translation, comma-separated nuances"),
  pos: z.enum(POS_ENUM),
  phrase: z
    .string()
    .describe("one natural 10-18 word English sentence using the front form"),
  etymology: z
    .string()
    .describe(
      "2-4 lines formatted as Etymology: … / Synonyms: … / Antonym: … / Related: … (drop lines that would be redundant)",
    ),
});

export const SuggestionListSchema = z.object({
  words: z.array(SuggestedWordSchema),
});

export type SuggestedWord = z.infer<typeof SuggestedWordSchema>;

export interface SuggestArgs {
  count: number;
  posFilter: CommonplacePos[] | "mixed";
  theme?: string;
  avoid: string[];
}

function buildPrompt({ count, posFilter, theme, avoid }: SuggestArgs): string {
  const posLine =
    posFilter === "mixed" || posFilter.length === 0
      ? "mixed — vary across noun / verb / adjective / adverb / phrase / preposition"
      : posFilter.join(" or ");
  const themeLine = theme?.trim()
    ? `- Theme / topic: ${theme.trim()}`
    : "- No theme constraint, but prefer practically useful words";

  // Sort avoid list for consistent prompt caching
  const avoidSorted = [...avoid].sort((a, b) => a.localeCompare(b));

  return `You are a vocabulary curator for an English-learning Thai speaker who keeps a personal commonplace book. Suggest ${count} NEW English vocabulary entries that will expand the collection.

REQUIREMENTS
- Part of speech: ${posLine}
${themeLine}
- Target level: CEFR B1–C1 (intermediate → upper-intermediate)
- Prefer useful, common-enough-to-encounter-regularly items
- For the "phrase" POS, pick widely-used idioms or multi-word expressions
- Words must NOT appear in the AVOID list (case-insensitive match on front)

FIELD RULES (per word)
- front: single lemma, lowercase unless proper noun; keep idioms as-is
- back: concise Thai translation (use Thai script). Comma-separate nuances, ≤ 60 chars
- pos: exactly one of noun | verb | adjective | adverb | phrase | preposition
- phrase: ONE natural English sentence (10–18 words) containing the exact front form; no quotes, no preamble
- etymology: 2–4 lines using this exact labelling, no markdown:
    Etymology: <origin — root + literal meaning, one line>
    Synonyms: <3–5 close synonyms, comma-separated>
    Antonym: <1–2 natural opposites — omit this line if none fit>
    Related: <1–3 words sharing the root or theme — omit if redundant with Synonyms>

AVOID (already in the collection, do not repeat):
${avoidSorted.join(", ")}

Return ONLY the structured data.`;
}

export async function suggestWords(args: SuggestArgs): Promise<SuggestedWord[]> {
  const { object } = await generateObject({
    model: aiModel(),
    schema: SuggestionListSchema,
    prompt: buildPrompt(args),
    temperature: 0.9,
  });
  return object.words;
}
