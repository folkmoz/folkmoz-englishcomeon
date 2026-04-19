import { db } from "@/lib/db";
import { CommonplacePos, SplitVariableResult } from "@/types";
import { unstable_cache } from "next/cache";

const KNOWN_POS: CommonplacePos[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
];

const resolvePos = (raw?: string | null): CommonplacePos => {
  if (!raw) return "other";
  const lower = raw.toLowerCase();
  return (KNOWN_POS.find((p) => p === lower) ?? "other") as CommonplacePos;
};

export const getAllVocab = unstable_cache(
  async (): Promise<SplitVariableResult[]> => {
    try {
      const result = await db().execute(
        `SELECT id, front, back, pos, phrase, etymology,
                (audio_front IS NOT NULL)  AS has_audio_front,
                (audio_phrase IS NOT NULL) AS has_audio_phrase
         FROM vocab
         ORDER BY front COLLATE NOCASE ASC`,
      );
      return result.rows.map((row) => ({
        id: String(row.id),
        front: String(row.front ?? ""),
        back: String(row.back ?? ""),
        pos: resolvePos(row.pos as string | null),
        phrase: (row.phrase as string | null) ?? null,
        etymology: (row.etymology as string | null) ?? null,
        hasAudioFront: Number(row.has_audio_front) === 1,
        hasAudioPhrase: Number(row.has_audio_phrase) === 1,
      }));
    } catch (error) {
      console.error("Failed to fetch vocab from Turso:", error);
      return [];
    }
  },
  ["vocab-data"],
  {
    revalidate: 3600,
    tags: ["vocab-data"],
  },
);
