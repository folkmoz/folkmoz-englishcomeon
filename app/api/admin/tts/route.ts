import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { generateSpeech } from "@/lib/tts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = (body.text || "").trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const wav = await generateSpeech(text);
    return NextResponse.json({
      audio: wav.toString("base64"),
      mimeType: "audio/wav",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
