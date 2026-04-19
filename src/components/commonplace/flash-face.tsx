"use client";
import { Fragment, useMemo } from "react";
import { MasteryState, SplitVariableResult } from "@/types";
import { Icon } from "./icons";
import { speak } from "./use-stored";

type FaceState = "front" | "back" | "phrase";
type FuncMode = "study" | "test";

interface Props {
  word: SplitVariableResult;
  faceState: FaceState;
  func: FuncMode;
  testInput: string;
  setTestInput: (v: string) => void;
  testResult: "right" | "wrong" | null;
  testFront: "en" | "th";
  checkTest: () => void;
  currentIdx: number;
  total: number;
  mastery: MasteryState;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function FlashFace({
  word,
  faceState,
  func,
  testInput,
  setTestInput,
  testResult,
  testFront,
  checkTest,
  currentIdx,
  total,
  mastery,
}: Props) {
  const phraseWithHighlight = useMemo(() => {
    if (!word.phrase) return null;
    const re = new RegExp(`(${escapeRegex(word.front)})`, "i");
    const parts = word.phrase.split(re);
    return parts.map((p, i) =>
      re.test(p) ? (
        <span key={i} className="target">
          {p}
        </span>
      ) : (
        <Fragment key={i}>{p}</Fragment>
      ),
    );
  }, [word]);

  if (func === "test") {
    const promptLabel =
      testFront === "en" ? "Translate to Thai" : "Translate to English";
    const promptWord = testFront === "en" ? word.front : word.back;
    return (
      <div className="face">
        <span className="corner-tl">Test · {promptLabel}</span>
        <span className="corner-tr">
          {String(currentIdx + 1).padStart(3, "0")} / {total}
        </span>
        <span className="corner-bl">{word.pos}</span>
        <div className="center-stack">
          <div className="test-prompt">
            What is the {testFront === "en" ? "meaning" : "English word"}?
          </div>
          <div className="word">
            {promptWord}
            {testFront === "en" && (
              <button className="audio" onClick={() => speak(word.front)}>
                {Icon.speaker(15)}
              </button>
            )}
          </div>
          <div className="test-input-wrap">
            <input
              autoFocus
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkTest();
              }}
              placeholder="Your answer…"
            />
            <button className="btn solid" onClick={checkTest}>
              Check
            </button>
          </div>
          {testResult && (
            <div className={`test-result ${testResult}`}>
              {testResult === "right"
                ? "✓ Correct"
                : `✗ Answer: ${testFront === "en" ? word.back : word.front}`}
            </div>
          )}
        </div>
      </div>
    );
  }

  const showFront = faceState === "front";
  const showBack = faceState === "back";
  const showPhrase = faceState === "phrase";

  return (
    <div className="face">
      <span className="corner-tl">
        {showFront && "English"}
        {showBack && "Thai · Translation"}
        {showPhrase && "In Use"}
      </span>
      <span className="corner-tr">
        {String(currentIdx + 1).padStart(3, "0")} / {total}
      </span>
      <span className="corner-bl">
        <span
          className={`pos ${word.pos}`}
          style={{ color: "inherit", borderColor: "currentColor" }}
        >
          {word.pos}
        </span>
      </span>
      <span className="corner-br">
        <span
          className={`mastery-dot ${mastery}`}
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
          }}
        />
      </span>
      <div className="center-stack">
        {showFront && (
          <>
            <div className="word">
              {word.front}
              <button className="audio" onClick={() => speak(word.front)}>
                {Icon.speaker(16)}
              </button>
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-3)",
                letterSpacing: ".18em",
                textTransform: "uppercase",
              }}
            >
              tap &quot;Back&quot; or press 2 for translation
            </div>
          </>
        )}
        {showBack && (
          <>
            <div className="translation">{word.back}</div>
            <div
              style={{
                fontFamily: "var(--serif-display)",
                fontStyle: "italic",
                fontSize: 22,
                color: "var(--ink-3)",
                borderTop: "1px solid var(--rule)",
                paddingTop: 14,
                marginTop: 4,
              }}
            >
              {word.front}
            </div>
          </>
        )}
        {showPhrase && (
          <>
            {word.phrase ? (
              <div className="phrase-block">{phraseWithHighlight}</div>
            ) : (
              <div
                style={{
                  fontFamily: "var(--serif-display)",
                  fontStyle: "italic",
                  fontSize: 22,
                  color: "var(--ink-4)",
                }}
              >
                “No example phrase recorded.”
              </div>
            )}
            {word.phrase && (
              <button
                className="audio"
                onClick={() => speak(word.phrase!)}
                style={{ marginTop: 28 }}
              >
                {Icon.speaker(16)}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
