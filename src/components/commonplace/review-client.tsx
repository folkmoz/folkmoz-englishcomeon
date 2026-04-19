"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CommonplaceSession, MasteryState, SplitVariableResult } from "@/types";
import { FlashFace } from "./flash-face";
import { Icon } from "./icons";
import { ProgressRing } from "./progress-ring";
import { useTweaks } from "./shell";
import { todayKey, useStored } from "./use-stored";

type FaceState = "front" | "back" | "phrase" | "notes";
type FuncMode = "study" | "test";

const FACE_CYCLE: FaceState[] = ["front", "back", "phrase", "notes"];

interface Props {
  data: SplitVariableResult[];
}

export function ReviewClient({ data }: Props) {
  const [tweaks] = useTweaks();
  const [mastery, setMastery] = useStored<Record<string, MasteryState>>(
    "mastery_v1",
    {}
  );
  const [order, setOrder] = useStored<string[]>(
    "review_order",
    data.map((d) => d.id)
  );
  const [reverse, setReverse] = useStored<boolean>("review_reverse", false);
  const [idx, setIdx] = useStored<number>("review_idx", 0);
  const [sessionState, setSessionState] = useStored<CommonplaceSession>(
    "session_v1",
    { touched: [], lastIdx: 0, date: null }
  );

  const [face, setFace] = useState<FaceState>("front");
  const [func, setFunc] = useState<FuncMode>("study");
  const [animation, setAnimation] = useState("");
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<"right" | "wrong" | null>(null);
  const [testFront, setTestFront] = useState<"en" | "th">("en");
  const [hydrated, setHydrated] = useState(false);
  const jumpConsumedRef = useRef(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const currentIds = new Set(data.map((d) => d.id));
    const allFromOrder = new Set(order);
    const missing = data
      .filter((d) => !allFromOrder.has(d.id))
      .map((d) => d.id);
    const existing = order.filter((id) => currentIds.has(id));
    if (missing.length || existing.length !== order.length) {
      setOrder([...existing, ...missing]);
    }
  }, [data, hydrated, order, setOrder]);

  useEffect(() => {
    if (!hydrated) return;
    if (sessionState.date && sessionState.date !== todayKey()) {
      setSessionState({
        touched: [],
        lastIdx: sessionState.lastIdx ?? 0,
        date: todayKey(),
      });
    }
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hydrated || jumpConsumedRef.current) return;
    jumpConsumedRef.current = true;
    try {
      const jumpId = sessionStorage.getItem("commonplace_jump_id");
      if (jumpId) {
        sessionStorage.removeItem("commonplace_jump_id");
        const i = order.indexOf(jumpId);
        if (i >= 0) setIdx(i);
      }
    } catch {}
  }, [hydrated, order, setIdx]);

  const safeIdx = Math.min(Math.max(idx, 0), Math.max(order.length - 1, 0));
  const word = useMemo(
    () => data.find((d) => d.id === order[safeIdx]) || data[0],
    [order, safeIdx, data]
  );

  const markTouched = useCallback(
    (id: string) => {
      const today = todayKey();
      setSessionState((prev) => {
        if (!prev.touched.includes(id)) {
          return {
            ...prev,
            touched: [...prev.touched, id],
            lastIdx: safeIdx,
            date: today,
          };
        }
        return { ...prev, lastIdx: safeIdx, date: today };
      });
    },
    [safeIdx, setSessionState]
  );

  useEffect(() => {
    if (hydrated && word) markTouched(word.id);
  }, [hydrated, word?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (func === "test") {
      setTestFront(Math.random() < 0.5 ? "en" : "th");
      setTestInput("");
      setTestResult(null);
    }
  }, [word?.id, func]);

  const animate = useCallback((dir: "next" | "prev", after: () => void) => {
    setAnimation(dir === "next" ? "slide-out-left" : "slide-out-right");
    setTimeout(() => {
      after();
      setFace("front");
      setAnimation(dir === "next" ? "slide-in-right" : "slide-in-left");
      setTimeout(() => setAnimation(""), 350);
    }, 350);
  }, []);

  const next = useCallback(
    () =>
      animate("next", () => setIdx((i) => Math.min(i + 1, order.length - 1))),
    [animate, order.length, setIdx]
  );
  const prev = useCallback(
    () => animate("prev", () => setIdx((i) => Math.max(i - 1, 0))),
    [animate, setIdx]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === " ") {
        e.preventDefault();
        setFace((f) => {
          const i = FACE_CYCLE.indexOf(f);
          return FACE_CYCLE[(i + 1) % FACE_CYCLE.length];
        });
      }
      if (e.key === "1") setFace("front");
      if (e.key === "2") setFace("back");
      if (e.key === "3") setFace("phrase");
      if (e.key === "4") setFace("notes");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const shuffle = () => {
    const arr = order.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setIdx(0);
  };
  const reset = () => {
    setOrder(data.map((d) => d.id));
    setIdx(0);
    setReverse(false);
  };
  const toggleReverse = () => {
    setOrder((o) => o.slice().reverse());
    setIdx((i) => order.length - 1 - i);
    setReverse((r) => !r);
  };

  const setMast = (state: MasteryState) => {
    if (!word) return;
    setMastery((m) => ({ ...m, [word.id]: state }));
    next();
  };

  const checkTest = () => {
    if (!word) return;
    const target = testFront === "en" ? word.back : word.front;
    const ok =
      testInput.trim().toLowerCase() === (target || "").trim().toLowerCase();
    setTestResult(ok ? "right" : "wrong");
    if (ok) setMastery((m) => ({ ...m, [word.id]: "learning" }));
  };

  const dailyDone = sessionState.touched.length;
  const dailyTarget = tweaks.dailyQuota || 20;
  const lastIdx = sessionState.lastIdx ?? 0;
  const showResume =
    lastIdx !== 0 && safeIdx === 0 && sessionState.touched.length === 0;

  if (!word) {
    return (
      <div className="review-stage">
        <div style={{ margin: "auto", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--serif-display)",
              fontStyle: "italic",
              fontSize: 32,
              color: "var(--ink-3)",
            }}>
            No entries recorded yet.
          </div>
        </div>
      </div>
    );
  }

  const currentMastery: MasteryState = (mastery[word.id] ||
    "new") as MasteryState;

  return (
    <div className="review-stage">
      <div className="review-top">
        <div className="left">
          {showResume ? (
            <div className="session-banner">
              <span className="dot" />
              <span className="text">
                Last session ended at{" "}
                <strong>
                  {lastIdx + 1}/{order.length}
                </strong>
                {sessionState.date && ` · ${sessionState.date}`}
              </span>
              <button className="resume" onClick={() => setIdx(lastIdx)}>
                Resume →
              </button>
            </div>
          ) : (
            <div className="session-banner">
              <span
                className="dot"
                style={{
                  background: "var(--accent-2)",
                  boxShadow: "0 0 0 4px rgba(90,107,58,.12)",
                }}
              />
              <span className="text">
                Today&apos;s stack ·{" "}
                <strong>{sessionState.touched.length}</strong> reviewed
              </span>
              {sessionState.touched.length > 0 && (
                <button
                  className="resume"
                  onClick={() => {
                    const last =
                      sessionState.touched[sessionState.touched.length - 1];
                    const i = order.indexOf(last);
                    if (i >= 0) setIdx(i);
                  }}>
                  Last word ↻
                </button>
              )}
            </div>
          )}
        </div>
        <div className="ring-center">
          <ProgressRing value={dailyDone} max={dailyTarget} />
          <div className="label">
            Daily Quota
            <strong>
              {dailyDone}
              <span style={{ color: "var(--ink-4)", fontSize: 14 }}>
                /{dailyTarget}
              </span>
            </strong>
          </div>
        </div>
        <div className="right">
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              color: "var(--ink-3)",
              letterSpacing: ".08em",
            }}>
            <span
              style={{
                fontFamily: "var(--serif-display)",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--ink)",
              }}>
              {safeIdx + 1}
            </span>
            <span style={{ margin: "0 6px" }}>/</span>
            {order.length}
            {reverse && <span style={{ marginLeft: 12 }}>· REVERSED</span>}
          </span>
        </div>
      </div>

      <div className="card-stage">
        <div className={`flash ${animation}`}>
          <FlashFace
            word={word}
            faceState={face}
            func={func}
            testInput={testInput}
            setTestInput={setTestInput}
            testResult={testResult}
            testFront={testFront}
            checkTest={checkTest}
            currentIdx={safeIdx}
            total={order.length}
            mastery={currentMastery}
          />
        </div>
      </div>

      <div>
        <div className="nav-arrows" style={{ marginBottom: 18 }}>
          <button className="arrow" onClick={prev} title="Previous (←)">
            {Icon.arrowL()}
          </button>
          <span className="keyhint">
            ← / → navigate · space cycles · 1 2 3 4
          </span>
          <button className="arrow" onClick={next} title="Next (→)">
            {Icon.arrowR()}
          </button>
        </div>
        <div className="controls-strip">
          <div className="control-group">
            <span className="label">Display</span>
            <div className="face-toggle">
              <button
                className={"opt " + (face === "front" ? "active" : "")}
                onClick={() => setFace("front")}>
                Front
              </button>
              <button
                className={"opt " + (face === "back" ? "active" : "")}
                onClick={() => setFace("back")}>
                Back
              </button>
              <button
                className={"opt " + (face === "phrase" ? "active" : "")}
                onClick={() => setFace("phrase")}>
                Phrase
              </button>
              <button
                className={"opt " + (face === "notes" ? "active" : "")}
                onClick={() => setFace("notes")}
                title="Etymology & synonyms (4)">
                Notes
              </button>
            </div>
          </div>
          <div className="control-group center">
            <span className="label">Mark Mastery</span>
            <div className="mastery-row">
              <button className="m again" onClick={() => setMast("new")}>
                Again
              </button>
              <button
                className="m learning"
                onClick={() => setMast("learning")}>
                Learning
              </button>
              <button
                className="m mastered"
                onClick={() => setMast("mastered")}>
                Mastered
              </button>
            </div>
          </div>
          <div className="control-group right">
            <span className="label">Function</span>
            <div className="func-toggle">
              <button
                className={"opt " + (func === "study" ? "active" : "")}
                onClick={() => setFunc("study")}>
                Study
              </button>
              <button
                className={"opt " + (func === "test" ? "active" : "")}
                onClick={() => setFunc("test")}>
                Test
              </button>
              <button className="opt" onClick={shuffle} title="Shuffle">
                {Icon.shuffle(11)}
              </button>
              <button
                className="opt"
                onClick={toggleReverse}
                title="Reverse order">
                {Icon.reverse(11)}
              </button>
              <button className="opt" onClick={reset} title="Reset">
                {Icon.reset(11)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
