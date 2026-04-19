"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteWord } from "@/lib/actions";
import { useTweaks } from "@/components/commonplace/shell";
import { SplitVariableResult } from "@/types";
import { SuggestModal } from "./suggest-modal";
import { WordModal } from "./word-modal";

interface Props {
  data: SplitVariableResult[];
  logoutAction: () => Promise<void>;
}

interface BulkState {
  active: boolean;
  done: number;
  total: number;
  current: string;
  failed: number;
  cancelled: boolean;
}

const IDLE_BULK: BulkState = {
  active: false,
  done: 0,
  total: 0,
  current: "",
  failed: 0,
  cancelled: false,
};

export function AdminList({ data, logoutAction }: Props) {
  const router = useRouter();
  const [tweaks] = useTweaks();
  const voice = tweaks.ttsVoice ?? "Kore";
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SplitVariableResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [bulk, setBulk] = useState<BulkState>(IDLE_BULK);
  const cancelRef = useRef(false);

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

  const missingAudio = useMemo(() => {
    const tasks: Array<{ word: SplitVariableResult; kind: "front" | "phrase"; text: string }> = [];
    for (const w of filtered) {
      if (!w.hasAudioFront && w.front.trim()) {
        tasks.push({ word: w, kind: "front", text: w.front });
      }
      if (!w.hasAudioPhrase && w.phrase && w.phrase.trim()) {
        tasks.push({ word: w, kind: "phrase", text: w.phrase });
      }
    }
    return tasks;
  }, [filtered]);

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

  const fillMissingAudio = async () => {
    if (missingAudio.length === 0) return;
    const label = filtered.length === data.length ? "all" : "the filtered view";
    const msg = `Generate ${missingAudio.length} missing audio clip(s) for ${label}?\n\nVoice: ${voice}\nEstimated cost: ~$${(missingAudio.length * 0.005).toFixed(2)}`;
    if (!confirm(msg)) return;

    cancelRef.current = false;
    setBulk({
      active: true,
      done: 0,
      total: missingAudio.length,
      current: "",
      failed: 0,
      cancelled: false,
    });

    let done = 0;
    let failed = 0;
    for (const task of missingAudio) {
      if (cancelRef.current) break;
      setBulk((s) => ({
        ...s,
        current: `${task.word.front} · ${task.kind}`,
      }));
      try {
        const res = await fetch("/api/admin/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: task.text,
            voice,
            id: task.word.id,
            kind: task.kind,
          }),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        failed++;
      }
      done++;
      setBulk((s) => ({ ...s, done, failed }));
    }

    setBulk((s) => ({
      ...s,
      active: false,
      cancelled: cancelRef.current,
      current: "",
    }));
    router.refresh();
  };

  const cancelBulk = () => {
    cancelRef.current = true;
  };

  const clearBulk = () => setBulk(IDLE_BULK);

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
        <button
          type="button"
          className="btn"
          onClick={fillMissingAudio}
          disabled={bulk.active || missingAudio.length === 0}
          title={`Generate audio for all words missing it in the filtered view · voice: ${voice}`}
        >
          ♫ Fill missing ({missingAudio.length})
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => setSuggestOpen(true)}
        >
          ✦ Suggest
        </button>
        <button type="button" className="btn solid" onClick={openCreate}>
          + New Entry
        </button>
      </div>

      {(bulk.active || bulk.done > 0) && (
        <div className="bulk-status">
          <div className="bulk-status-bar">
            <div
              className="bulk-status-fill"
              style={{
                width: `${
                  bulk.total > 0 ? (bulk.done / bulk.total) * 100 : 0
                }%`,
              }}
            />
          </div>
          <div className="bulk-status-text">
            {bulk.active ? (
              <>
                <span>
                  Generating audio · <strong>{bulk.done}</strong>/{bulk.total}
                  {bulk.current && <> · {bulk.current}</>}
                  {bulk.failed > 0 && <> · {bulk.failed} failed</>}
                </span>
                <button
                  type="button"
                  className="audio-link danger"
                  onClick={cancelBulk}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span>
                  {bulk.cancelled ? "Cancelled" : "Done"} · {bulk.done}/
                  {bulk.total}
                  {bulk.failed > 0 && <> · {bulk.failed} failed</>}
                </span>
                <button
                  type="button"
                  className="audio-link"
                  onClick={clearBulk}
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
              <span
                className="admin-audio-flags"
                title="Audio: word · phrase"
              >
                <span className={w.hasAudioFront ? "on" : "off"}>W</span>
                <span className={w.hasAudioPhrase ? "on" : "off"}>P</span>
              </span>
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
      <SuggestModal
        open={suggestOpen}
        onClose={() => {
          setSuggestOpen(false);
          router.refresh();
        }}
        onAdded={() => router.refresh()}
      />
    </div>
  );
}
