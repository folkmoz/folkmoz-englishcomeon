import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  POS_ENUM,
  SuggestedWord,
  suggestWords,
} from "@/lib/suggest";
import { CommonplacePos } from "@/types";

export const runtime = "nodejs";
const MAX_COUNT = 10;
const MAX_RETRIES = 1;

interface Body {
  count?: number;
  posFilter?: CommonplacePos[] | "mixed";
  theme?: string;
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

  const count = Math.max(1, Math.min(MAX_COUNT, Number(body.count) || 5));
  const posFilter: CommonplacePos[] | "mixed" = Array.isArray(body.posFilter)
    ? body.posFilter.filter((p): p is CommonplacePos =>
        (POS_ENUM as readonly string[]).includes(p),
      )
    : "mixed";
  const theme = (body.theme ?? "").slice(0, 120);

  try {
    const existing = await db().execute("SELECT front FROM vocab");
    const existingSet = new Set(
      existing.rows.map((r) => String(r.front ?? "").toLowerCase().trim()),
    );

    const collected: SuggestedWord[] = [];
    const collectedKeys = new Set<string>();
    let retries = 0;

    while (collected.length < count && retries <= MAX_RETRIES) {
      const missing = count - collected.length;
      const avoid = [...existingSet, ...collectedKeys];
      const suggestions = await suggestWords({
        count: missing,
        posFilter,
        theme,
        avoid,
      });
      for (const w of suggestions) {
        const key = w.front.toLowerCase().trim();
        if (!key) continue;
        if (existingSet.has(key) || collectedKeys.has(key)) continue;
        collected.push(w);
        collectedKeys.add(key);
        if (collected.length >= count) break;
      }
      retries++;
    }

    return NextResponse.json({ words: collected.slice(0, count) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "suggest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
