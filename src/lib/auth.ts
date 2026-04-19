import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string | null {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16) return null;
  return s;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function makeToken(): string {
  const s = getSecret();
  if (!s) throw new Error("ADMIN_SECRET must be set (≥16 chars)");
  return sign("ok", s);
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const s = getSecret();
  if (!s) return false;
  return safeEqualHex(token, sign("ok", s));
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const c = store.get(ADMIN_COOKIE);
  return verifyToken(c?.value);
}

export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) {
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
}
