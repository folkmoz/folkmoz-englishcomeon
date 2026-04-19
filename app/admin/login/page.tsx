import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import { loginAction } from "./actions";

interface SearchParams {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: SearchParams) {
  if (await isAuthed()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="admin-login">
      <form action={loginAction} className="admin-login-form">
        <div className="eyebrow">Admin</div>
        <h2>
          <em>Enter</em>
        </h2>
        <label>Password</label>
        <input
          type="password"
          name="password"
          autoFocus
          required
          autoComplete="current-password"
        />
        {error && <div className="admin-error">Incorrect password.</div>}
        <button type="submit" className="btn solid">
          Sign In
        </button>
      </form>
    </div>
  );
}
