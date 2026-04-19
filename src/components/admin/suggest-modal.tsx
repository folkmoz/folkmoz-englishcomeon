"use client";
import { useEffect, useState, useTransition } from "react";
import { createWord } from "@/lib/actions";
import { SuggestedWord } from "@/lib/suggest";
import { CommonplacePos } from "@/types";

const COUNT_OPTS = [3, 5, 10];
const POS_OPTS: CommonplacePos[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

type CardState = "idle" | "adding" | "added" | "error";

export function SuggestModal({ open, onClose, onAdded }: Props) {
  const [count, setCount] = useState<number>(5);
  const [posSelected, setPosSelected] = useState<Set<CommonplacePos>>(new Set());
  const [theme, setTheme] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [words, setWords] = useState<SuggestedWord[]>([]);
  const [states, setStates] = useState<Record<number, CardState>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setCount(5);
    setPosSelected(new Set());
    setTheme("");
    setWords([]);
    setStates({});
    setErrors({});
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const togglePos = (p: CommonplacePos) => {
    setPosSelected((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setStates({});
    setErrors({});
    setWords([]);
    try {
      const res = await fetch("/api/admin/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count,
          posFilter: posSelected.size === 0 ? "mixed" : Array.from(posSelected),
          theme,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      setWords(json.words as SuggestedWord[]);
      if (!json.words?.length) {
        setError("AI returned no new words. Try a different theme or POS mix.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const addOne = (idx: number) => {
    const w = words[idx];
    if (!w) return;
    setStates((s) => ({ ...s, [idx]: "adding" }));
    startTransition(async () => {
      try {
        await createWord({
          front: w.front,
          back: w.back,
          pos: w.pos,
          phrase: w.phrase,
          etymology: w.etymology,
        });
        setStates((s) => ({ ...s, [idx]: "added" }));
        onAdded();
      } catch (err) {
        setStates((s) => ({ ...s, [idx]: "error" }));
        setErrors((e) => ({
          ...e,
          [idx]: err instanceof Error ? err.message : "Failed",
        }));
      }
    });
  };

  const addAll = () => {
    words.forEach((_, i) => {
      if (!states[i] || states[i] === "idle") addOne(i);
    });
  };

  const anyAdded = Object.values(states).some((s) => s === "added");
  const anyPending = Object.values(states).some((s) => s === "adding");

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        className="modal suggest-modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) generate();
        }}
      >
        <div className="modal-head">
          <div className="eyebrow">✦ Suggest New Words</div>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>How many</label>
            <div className="pos-picker">
              {COUNT_OPTS.map((n) => (
                <button
                  type="button"
                  key={n}
                  className={"chip " + (count === n ? "active" : "")}
                  onClick={() => setCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>
              Parts of Speech{" "}
              <span className="suggest-hint">
                — leave empty for mixed
              </span>
            </label>
            <div className="pos-picker">
              {POS_OPTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={"chip " + (posSelected.has(p) ? "active" : "")}
                  onClick={() => togglePos(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>
              Theme{" "}
              <span className="suggest-hint">— optional</span>
            </label>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. business, emotions, daily routine…"
              maxLength={120}
            />
          </div>

          {error && <div className="admin-error">{error}</div>}

          {words.length > 0 && (
            <div className="suggest-results">
              <div className="suggest-results-head">
                <span className="eyebrow">
                  {words.length} suggestion{words.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  className="btn"
                  onClick={addAll}
                  disabled={anyPending}
                >
                  Add all
                </button>
              </div>
              <div className="suggest-cards">
                {words.map((w, i) => {
                  const state = states[i] || "idle";
                  return (
                    <div
                      key={i}
                      className={`suggest-card ${
                        state === "added" ? "added" : ""
                      }`}
                    >
                      <div className="suggest-card-head">
                        <span className="suggest-front">{w.front}</span>
                        <span className={`pos ${w.pos}`}>{w.pos}</span>
                        {state === "added" ? (
                          <span className="suggest-status ok">✓ Added</span>
                        ) : state === "error" ? (
                          <button
                            type="button"
                            className="gen-btn"
                            onClick={() => addOne(i)}
                          >
                            Retry
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="gen-btn"
                            onClick={() => addOne(i)}
                            disabled={state === "adding"}
                          >
                            {state === "adding" ? "…" : "+ Add"}
                          </button>
                        )}
                      </div>
                      <div className="suggest-back">{w.back}</div>
                      {w.phrase && (
                        <div className="suggest-phrase">“{w.phrase}”</div>
                      )}
                      {w.etymology && (
                        <pre className="suggest-ety">{w.etymology}</pre>
                      )}
                      {state === "error" && errors[i] && (
                        <div className="admin-error">{errors[i]}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={anyPending || loading}
          >
            {anyAdded ? "Done" : "Cancel"}
          </button>
          <button
            type="submit"
            className="btn solid"
            disabled={loading || anyPending}
          >
            {loading
              ? "Generating…"
              : words.length
                ? "Regenerate"
                : "Generate"}
          </button>
        </div>
      </form>
    </div>
  );
}
