"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { CommonplacePos } from "@/types";

function invalidateVocab() {
  revalidateTag("vocab-data", "max");
  revalidatePath("/");
  revalidatePath("/vocab/review");
  revalidatePath("/admin");
}

const KNOWN_POS: CommonplacePos[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
  "other",
];

export type AudioAction = "keep" | "set" | "clear";

export interface WordInput {
  front: string;
  back: string;
  pos: string;
  phrase: string;
  etymology: string;
  audioFront?: { action: AudioAction; base64?: string };
  audioPhrase?: { action: AudioAction; base64?: string };
}

interface Normalized {
  front: string;
  back: string;
  pos: CommonplacePos;
  phrase: string | null;
  etymology: string | null;
}

function normalize(input: WordInput): Normalized {
  const front = (input.front || "").trim();
  const back = (input.back || "").trim();
  const pos = KNOWN_POS.includes(input.pos as CommonplacePos)
    ? (input.pos as CommonplacePos)
    : "other";
  const phrase = (input.phrase || "").trim() || null;
  const etymology = (input.etymology || "").trim() || null;
  return { front, back, pos, phrase, etymology };
}

function audioBuffer(
  spec: WordInput["audioFront"],
): Uint8Array | null | undefined {
  if (!spec || spec.action === "keep") return undefined;
  if (spec.action === "clear") return null;
  if (!spec.base64) return undefined;
  return new Uint8Array(Buffer.from(spec.base64, "base64"));
}

async function assertAuth() {
  if (!(await isAuthed())) throw new Error("Unauthorized");
}

export async function createWord(input: WordInput) {
  await assertAuth();
  const n = normalize(input);
  if (!n.front) throw new Error("Front is required");

  const id = randomUUID();
  const af = audioBuffer(input.audioFront);
  const ap = audioBuffer(input.audioPhrase);

  await db().execute({
    sql: `INSERT INTO vocab (id, front, back, pos, phrase, etymology, audio_front, audio_phrase)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, n.front, n.back, n.pos, n.phrase, n.etymology, af ?? null, ap ?? null],
  });
  invalidateVocab();
  return { id };
}

export async function updateWord(id: string, input: WordInput) {
  await assertAuth();
  const n = normalize(input);
  if (!n.front) throw new Error("Front is required");

  const sets: string[] = [
    "front = ?",
    "back = ?",
    "pos = ?",
    "phrase = ?",
    "etymology = ?",
    "updated_at = unixepoch()",
  ];
  const args: Array<string | null | Uint8Array> = [
    n.front,
    n.back,
    n.pos,
    n.phrase,
    n.etymology,
  ];

  const af = audioBuffer(input.audioFront);
  if (af !== undefined) {
    sets.splice(sets.length - 1, 0, "audio_front = ?");
    args.push(af);
  }
  const ap = audioBuffer(input.audioPhrase);
  if (ap !== undefined) {
    sets.splice(sets.length - 1, 0, "audio_phrase = ?");
    args.push(ap);
  }

  args.push(id);

  await db().execute({
    sql: `UPDATE vocab SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
  invalidateVocab();
}

export async function deleteWord(id: string) {
  await assertAuth();
  await db().execute({
    sql: "DELETE FROM vocab WHERE id = ?",
    args: [id],
  });
  invalidateVocab();
}
