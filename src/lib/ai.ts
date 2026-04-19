import { google } from "@ai-sdk/google";

export const AI_MODEL = "gemini-2.5-flash";

export function aiModel() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return google(AI_MODEL);
}

export const etymologyPrompt = (front: string, back: string) =>
  `You are writing a concise etymology + synonyms note for a single English vocabulary entry. The note appears in a literary "commonplace book" for a Thai learner.

Word: ${front}
Thai meaning: ${back || "(not provided)"}

Return 2–4 short lines, plain text only. No markdown headers, no bullets, no preamble.
Lines should be labelled like:
Etymology: <one-line origin — Latin/Greek/Old English root + literal meaning>
Synonyms: <3–5 close synonyms, comma-separated>
Antonym: <1–2 opposites — OMIT this line if none are natural>
Related: <1–3 words that share the root or theme — OMIT if redundant with synonyms>

Keep each line under 90 characters. Output the note only.`;

export const phrasePrompt = (front: string, back: string) =>
  `Write one natural example sentence using the English word "${front}" (Thai meaning: ${back || "unknown"}).

Rules:
- 10–18 words total
- Must contain the exact word "${front}" (keep same form)
- Sentence should demonstrate the word's most typical usage
- Plain prose; no quotes, no preamble, no translation
- Output the sentence only.`;
