import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { isAuthed } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSpeech } from "@/lib/tts";
import { TtsVoice } from "@/types";

export const runtime = "nodejs";

const ALLOWED_VOICES: TtsVoice[] = [
  "Kore",
  "Puck",
  "Aoede",
  "Charon",
  "Leda",
  "Zephyr",
];

interface Body {
  text?: string;
  voice?: string;
  id?: string;
  kind?: "front" | "phrase";
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const voice = ALLOWED_VOICES.includes(body.voice as TtsVoice)
    ? (body.voice as TtsVoice)
    : "Kore";

  const save =
    typeof body.id === "string" &&
    (body.kind === "front" || body.kind === "phrase")
      ? { id: body.id, kind: body.kind }
      : null;

  try {
    const wav = await generateSpeech(text, voice);

    if (save) {
      const col = save.kind === "front" ? "audio_front" : "audio_phrase";
      await db().execute({
        sql: `UPDATE vocab SET ${col} = ?, updated_at = unixepoch() WHERE id = ?`,
        args: [new Uint8Array(wav), save.id],
      });
      revalidateTag("vocab-data", "max");
      revalidatePath("/");
      revalidatePath("/vocab/review");
      revalidatePath("/admin");
      return NextResponse.json({ saved: true });
    }

    return NextResponse.json({
      audio: wav.toString("base64"),
      mimeType: "audio/wav",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
