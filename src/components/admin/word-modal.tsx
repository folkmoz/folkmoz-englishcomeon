"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  CommonplacePos,
  SplitVariableResult,
} from "@/types";
import { AudioAction, createWord, updateWord, WordInput } from "@/lib/actions";
import { useTweaks } from "@/components/commonplace/shell";
import { AudioPreview } from "./audio-preview";

type GenKind = "etymology" | "phrase";
type AudioSlot = "front" | "phrase";

async function streamGenerate(
  kind: GenKind,
  front: string,
  back: string,
  onDelta: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/admin/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, front, back }),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Generation failed");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    onDelta(acc);
  }
}

async function generateTTS(text: string, voice: string): Promise<string> {
  const res = await fetch("/api/admin/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "TTS failed");
  return json.audio as string;
}

const POS_OPTS: CommonplacePos[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "preposition",
  "other",
];

interface Props {
  open: boolean;
  word: SplitVariableResult | null;
  onClose: () => void;
  onSaved: () => void;
}

interface AudioSlotState {
  action: AudioAction;
  base64?: string;
  url?: string;
}

const emptyForm = (): WordInput => ({
  front: "",
  back: "",
  pos: "noun",
  phrase: "",
  etymology: "",
});

function base64ToBlobUrl(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "audio/wav" }));
}

export function WordModal({ open, word, onClose, onSaved }: Props) {
  const [tweaks] = useTweaks();
  const voice = tweaks.ttsVoice ?? "Kore";
  const [form, setForm] = useState<WordInput>(emptyForm());
  const [audioFront, setAudioFront] = useState<AudioSlotState>({
    action: "keep",
  });
  const [audioPhrase, setAudioPhrase] = useState<AudioSlotState>({
    action: "keep",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [generating, setGenerating] = useState<GenKind | null>(null);
  const [ttsBusy, setTtsBusy] = useState<AudioSlot | null>(null);
  const genAbortRef = useRef<AbortController | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const setAudio = (slot: AudioSlot) =>
    slot === "front" ? setAudioFront : setAudioPhrase;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setGenerating(null);
    setTtsBusy(null);
    setForm(
      word
        ? {
            front: word.front,
            back: word.back,
            pos: word.pos,
            phrase: word.phrase || "",
            etymology: word.etymology || "",
          }
        : emptyForm(),
    );
    setAudioFront({ action: "keep" });
    setAudioPhrase({ action: "keep" });
    setTimeout(() => firstFieldRef.current?.focus(), 50);
  }, [open, word]);

  // Revoke blob URLs on unmount/change
  useEffect(() => {
    return () => {
      if (audioFront.url) URL.revokeObjectURL(audioFront.url);
      if (audioPhrase.url) URL.revokeObjectURL(audioPhrase.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const payload: WordInput = {
          ...form,
          audioFront: {
            action: audioFront.action,
            base64: audioFront.base64,
          },
          audioPhrase: {
            action: audioPhrase.action,
            base64: audioPhrase.base64,
          },
        };
        if (word) {
          await updateWord(word.id, payload);
        } else {
          await createWord(payload);
        }
        onSaved();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
      }
    });
  };

  const set = <K extends keyof WordInput>(k: K, v: WordInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const generate = async (kind: GenKind) => {
    if (!form.front.trim()) {
      setError("Enter the front word first.");
      return;
    }
    setError(null);
    genAbortRef.current?.abort();
    const ctrl = new AbortController();
    genAbortRef.current = ctrl;
    setGenerating(kind);
    const field: keyof WordInput = kind === "etymology" ? "etymology" : "phrase";
    setForm((f) => ({ ...f, [field]: "" }));
    try {
      await streamGenerate(
        kind,
        form.front,
        form.back,
        (text) => setForm((f) => ({ ...f, [field]: text })),
        ctrl.signal,
      );
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating((g) => (g === kind ? null : g));
      genAbortRef.current = null;
    }
  };

  const cancelGenerate = () => {
    genAbortRef.current?.abort();
    setGenerating(null);
  };

  const runAudioGen = async (slot: AudioSlot): Promise<boolean> => {
    const text = slot === "front" ? form.front.trim() : form.phrase.trim();
    if (!text) return false;
    const b64 = await generateTTS(text, voice);
    const url = base64ToBlobUrl(b64);
    setAudio(slot)((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { action: "set", base64: b64, url };
    });
    return true;
  };

  const generateAudio = async (slot: AudioSlot) => {
    const text = slot === "front" ? form.front.trim() : form.phrase.trim();
    if (!text) {
      setError(
        slot === "front"
          ? "Enter the front word first."
          : "Enter the phrase first.",
      );
      return;
    }
    setError(null);
    setTtsBusy(slot);
    try {
      await runAudioGen(slot);
    } catch (err) {
      setError(err instanceof Error ? err.message : "TTS failed");
    } finally {
      setTtsBusy(null);
    }
  };

  const generateBothAudio = async () => {
    if (!form.front.trim()) {
      setError("Enter the front word first.");
      return;
    }
    setError(null);
    setTtsBusy("front");
    try {
      const tasks: Promise<boolean>[] = [runAudioGen("front")];
      if (form.phrase.trim()) tasks.push(runAudioGen("phrase"));
      await Promise.all(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "TTS failed");
    } finally {
      setTtsBusy(null);
    }
  };

  const clearAudio = (slot: AudioSlot) => {
    setAudio(slot)((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { action: "clear" };
    });
  };

  const revertAudio = (slot: AudioSlot) => {
    setAudio(slot)((prev) => {
      if (prev.url) URL.revokeObjectURL(prev.url);
      return { action: "keep" };
    });
  };

  const existingAudioUrl = (slot: AudioSlot): string | null => {
    if (!word) return null;
    const has = slot === "front" ? word.hasAudioFront : word.hasAudioPhrase;
    if (!has) return null;
    return `/api/audio?id=${word.id}&kind=${slot}&v=${word.id}`;
  };

  const renderAudioControls = (slot: AudioSlot) => {
    const state = slot === "front" ? audioFront : audioPhrase;
    const existingUrl = existingAudioUrl(slot);
    const previewUrl = state.action === "set" ? state.url : null;
    const isCleared = state.action === "clear";
    const busy = ttsBusy === slot;

    return (
      <div className="audio-row">
        <button
          type="button"
          className="gen-btn"
          onClick={() => generateAudio(slot)}
          disabled={busy || pending}
        >
          {busy
            ? "…"
            : state.action === "set"
              ? "✦ Regenerate"
              : "✦ Generate audio"}
        </button>
        {previewUrl && (
          <>
            <AudioPreview src={previewUrl} />
            <button
              type="button"
              className="audio-link"
              onClick={() => revertAudio(slot)}
            >
              undo
            </button>
          </>
        )}
        {!previewUrl && existingUrl && !isCleared && (
          <>
            <AudioPreview src={existingUrl} />
            <button
              type="button"
              className="audio-link danger"
              onClick={() => clearAudio(slot)}
            >
              remove
            </button>
          </>
        )}
        {isCleared && (
          <>
            <span className="audio-status">— cleared on save —</span>
            <button
              type="button"
              className="audio-link"
              onClick={() => revertAudio(slot)}
            >
              undo
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <div className="eyebrow">
            {word ? "Edit Entry" : "New Entry"}
            <span className="modal-head-voice"> · voice: {voice}</span>
          </div>
          <div className="modal-head-actions">
            <button
              type="button"
              className="gen-btn"
              onClick={generateBothAudio}
              disabled={ttsBusy !== null || pending}
              title="Generate audio for front + phrase"
            >
              {ttsBusy ? "…" : "✦ Audio for both"}
            </button>
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Front (English)</label>
            <input
              ref={firstFieldRef}
              value={form.front}
              onChange={(e) => set("front", e.target.value)}
              required
              autoComplete="off"
            />
            {renderAudioControls("front")}
          </div>
          <div className="field">
            <label>Back (Thai)</label>
            <textarea
              value={form.back}
              onChange={(e) => set("back", e.target.value)}
              rows={2}
              className="thai"
            />
          </div>
          <div className="field">
            <label>Part of Speech</label>
            <div className="pos-picker">
              {POS_OPTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={"chip " + (form.pos === p ? "active" : "")}
                  onClick={() => set("pos", p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <div className="field-head">
              <label>Example Phrase</label>
              <button
                type="button"
                className="gen-btn"
                onClick={() =>
                  generating === "phrase"
                    ? cancelGenerate()
                    : generate("phrase")
                }
                disabled={pending || generating === "etymology"}
              >
                {generating === "phrase" ? "◼ Cancel" : "✦ Generate"}
              </button>
            </div>
            <textarea
              value={form.phrase}
              onChange={(e) => set("phrase", e.target.value)}
              rows={2}
              placeholder="Use the word in a sentence…"
            />
            {renderAudioControls("phrase")}
          </div>
          <div className="field">
            <div className="field-head">
              <label>Etymology / Synonyms / Related</label>
              <button
                type="button"
                className="gen-btn"
                onClick={() =>
                  generating === "etymology"
                    ? cancelGenerate()
                    : generate("etymology")
                }
                disabled={pending || generating === "phrase"}
              >
                {generating === "etymology" ? "◼ Cancel" : "✦ Generate"}
              </button>
            </div>
            <textarea
              value={form.etymology}
              onChange={(e) => set("etymology", e.target.value)}
              rows={4}
              placeholder="Origin, synonyms, antonyms, related words…"
            />
          </div>
          {error && <div className="admin-error">{error}</div>}
        </div>
        <div className="modal-foot">
          <button
            type="button"
            className="btn"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button type="submit" className="btn solid" disabled={pending}>
            {pending ? "Saving…" : word ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
