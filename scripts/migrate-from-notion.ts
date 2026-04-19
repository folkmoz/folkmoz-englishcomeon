import { Client as Notion } from "@notionhq/client";
import { createClient as createTurso } from "@libsql/client";

interface NotionRun {
  plain_text: string;
  annotations?: { underline?: boolean };
}

interface VocabRow {
  id: string;
  front: string;
  back: string;
  pos: string;
  phrase: string | null;
  phrase_html: string | null;
}

const KNOWN_POS = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
];

const resolvePos = (raw?: string): string => {
  if (!raw) return "other";
  const lower = raw.toLowerCase();
  return KNOWN_POS.includes(lower) ? lower : "other";
};

async function fetchFromNotion(): Promise<VocabRow[]> {
  const notion = new Notion({ auth: process.env.NOTION_API_KEY });
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) throw new Error("NOTION_DATABASE_ID not set");

  const all: VocabRow[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    const resp: any = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      sorts: [{ property: "Front", direction: "ascending" }],
      filter: { property: "Front", title: { is_not_empty: true } },
    });

    for (const page of resp.results) {
      const props = page.properties;
      const front = props.Front?.title?.[0]?.plain_text ?? "";
      if (!front) continue;
      const back = props.Back?.rich_text?.[0]?.plain_text ?? "";
      const posName = props["Part of Speech"]?.multi_select?.[0]?.name;
      const phraseRuns: NotionRun[] | undefined =
        props["Example Phrases"]?.rich_text;

      const phrase = phraseRuns?.length
        ? phraseRuns.map((r) => r.plain_text).join("")
        : null;
      const phrase_html = phraseRuns?.length
        ? `<pre class='whitespace-pre-wrap'>${phraseRuns
            .map((r) =>
              r.annotations?.underline
                ? `<u>${r.plain_text}</u>`
                : r.plain_text,
            )
            .join("")}</pre>`
        : null;

      all.push({
        id: page.id,
        front,
        back,
        pos: resolvePos(posName),
        phrase,
        phrase_html,
      });
    }

    hasMore = resp.has_more;
    cursor = resp.next_cursor ?? undefined;
  }

  return all;
}

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  if (!tursoUrl) throw new Error("TURSO_DATABASE_URL not set");
  if (!process.env.NOTION_API_KEY) throw new Error("NOTION_API_KEY not set");

  console.log("→ fetching from Notion…");
  const rows = await fetchFromNotion();
  console.log(`  pulled ${rows.length} entries`);

  const turso = createTurso({ url: tursoUrl, authToken: tursoToken });

  console.log("→ writing to Turso…");
  const stmts = rows.map((r) => ({
    sql: `INSERT INTO vocab (id, front, back, pos, phrase, phrase_html)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            front = excluded.front,
            back = excluded.back,
            pos = excluded.pos,
            phrase = excluded.phrase,
            phrase_html = excluded.phrase_html,
            updated_at = unixepoch()`,
    args: [r.id, r.front, r.back, r.pos, r.phrase, r.phrase_html],
  }));

  const chunkSize = 50;
  for (let i = 0; i < stmts.length; i += chunkSize) {
    await turso.batch(stmts.slice(i, i + chunkSize), "write");
    console.log(`  ${Math.min(i + chunkSize, stmts.length)}/${stmts.length}`);
  }

  console.log("✓ migration complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
