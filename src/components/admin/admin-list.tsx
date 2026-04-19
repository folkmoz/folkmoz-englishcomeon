"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { deleteWord } from "@/lib/actions";
import { SplitVariableResult } from "@/types";
import { WordModal } from "./word-modal";

interface Props {
  data: SplitVariableResult[];
  logoutAction: () => Promise<void>;
}

export function AdminList({ data, logoutAction }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SplitVariableResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, startDelete] = useTransition();

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter(
      (w) =>
        w.front.toLowerCase().includes(q) ||
        w.back.toLowerCase().includes(q) ||
        (w.phrase?.toLowerCase().includes(q) ?? false),
    );
  }, [data, query]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (w: SplitVariableResult) => {
    setEditing(w);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);
  const saved = () => {
    setModalOpen(false);
    router.refresh();
  };
  const removeWord = (w: SplitVariableResult) => {
    if (!confirm(`Delete "${w.front}"? This cannot be undone.`)) return;
    startDelete(async () => {
      await deleteWord(w.id);
      router.refresh();
    });
  };

  return (
    <div className="page">
      <div className="admin-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h2 className="admin-title">
            <em>Edit</em> the Lexicon
          </h2>
        </div>
        <div className="admin-head-actions">
          <Link href="/" className="btn">
            ← Back to Record
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="btn">
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <input
            placeholder="Search entries…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="button" className="btn solid" onClick={openCreate}>
          + New Entry
        </button>
      </div>

      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".08em",
          color: "var(--ink-3)",
          marginBottom: 14,
        }}
      >
        {filtered.length} of {data.length} entries
      </div>

      <div className="admin-rows">
        {filtered.map((w, i) => (
          <div key={w.id} className="admin-row">
            <span className="ix">{String(i + 1).padStart(3, "0")}</span>
            <div className="admin-word">
              <div className="word">{w.front}</div>
              <div className="trans">{w.back || "—"}</div>
              {w.phrase && <div className="admin-phrase">“{w.phrase}”</div>}
            </div>
            <span className={`pos ${w.pos}`}>{w.pos}</span>
            <div className="admin-row-actions">
              <button
                type="button"
                className="btn"
                onClick={() => openEdit(w)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn admin-btn-danger"
                onClick={() => removeWord(w)}
                disabled={deleting}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-empty">No entries match.</div>
        )}
      </div>

      <WordModal
        open={modalOpen}
        word={editing}
        onClose={closeModal}
        onSaved={saved}
      />
    </div>
  );
}
