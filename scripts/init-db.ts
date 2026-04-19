import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");

  const client = createClient({ url, authToken });
  const dir = resolve(process.cwd(), "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    const statements = sql
      .split(/;\s*(?=\n|$)/)
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`→ applying ${file} (${statements.length} statement(s))`);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
  }
  console.log("✓ schema ready");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
