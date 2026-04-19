import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const kind = searchParams.get("kind");
  if (!id || (kind !== "front" && kind !== "phrase")) {
    return NextResponse.json({ error: "bad params" }, { status: 400 });
  }
  const col = kind === "front" ? "audio_front" : "audio_phrase";

  try {
    const result = await db().execute({
      sql: `SELECT ${col} AS audio FROM vocab WHERE id = ?`,
      args: [id],
    });
    const row = result.rows[0];
    const buf = row?.audio as ArrayBuffer | Uint8Array | null | undefined;
    if (!buf) {
      return new NextResponse(null, { status: 404 });
    }
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const body = new Blob([bytes.buffer as ArrayBuffer], { type: "audio/wav" });
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "db error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
