import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken });

  await client.execute(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL DEFAULT (unixepoch()))",
  );

  const dir = resolve(process.cwd(), "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await client.execute("SELECT name FROM _migrations");
  const appliedSet = new Set(applied.rows.map((r) => String(r.name)));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`· skip ${file} (applied)`);
      continue;
    }
    const sql = readFileSync(join(dir, file), "utf8");
    const statements = sql
      .split(/;\s*(?=\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`→ applying ${file} (${statements.length} statement(s))`);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    await client.execute({
      sql: "INSERT INTO _migrations (name) VALUES (?)",
      args: [file],
    });
  }
  console.log("✓ schema ready");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
