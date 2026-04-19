import { streamText } from "ai";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { aiModel, etymologyPrompt, phrasePrompt } from "@/lib/ai";

export const runtime = "nodejs";

interface Body {
  kind: "etymology" | "phrase";
  front: string;
  back?: string;
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const front = (body.front || "").trim();
  const back = (body.back || "").trim();
  if (!front) {
    return NextResponse.json({ error: "front is required" }, { status: 400 });
  }
  if (body.kind !== "etymology" && body.kind !== "phrase") {
    return NextResponse.json({ error: "invalid kind" }, { status: 400 });
  }

  const prompt =
    body.kind === "etymology"
      ? etymologyPrompt(front, back)
      : phrasePrompt(front, back);

  try {
    const result = streamText({
      model: aiModel(),
      prompt,
      temperature: body.kind === "etymology" ? 0.5 : 0.8,
    });
    return result.toTextStreamResponse();
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
