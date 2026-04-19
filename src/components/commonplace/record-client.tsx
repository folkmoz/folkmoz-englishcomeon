"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CommonplacePos,
  MasteryState,
  SplitVariableResult,
} from "@/types";
import { Icon } from "./icons";
import { useTweaks } from "./shell";
import { playAudio, speak, useStored } from "./use-stored";

type RecordView = "grid" | "list" | "grouped";

interface Props {
  data: SplitVariableResult[];
}

const POS_OPTS: Array<"all" | CommonplacePos> = [
  "all",
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
];
const MAS_OPTS: Array<{ k: "all" | MasteryState; l: string }> = [
  { k: "all", l: "All" },
  { k: "new", l: "New" },
  { k: "learning", l: "Learning" },
  { k: "mastered", l: "Mastered" },
];

function Stats({
  total,
  learning,
  mastered,
  todayCount,
}: {
  total: number;
  learning: number;
  mastered: number;
  todayCount: number;
}) {
  const pct = total > 0 ? ((mastered / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="stats">
      <div className="stat">
        <span className="label">Total Entries</span>
        <span className="value">{total}</span>
        <span className="sub">growing daily</span>
      </div>
      <div className="stat">
        <span className="label">Mastered</span>
        <span className="value">{mastered}</span>
        <span className="sub">{pct}% of corpus</span>
      </div>
      <div className="stat">
        <span className="label">In Study</span>
        <span className="value">{learning}</span>
        <span className="sub">marked as learning</span>
      </div>
      <div className="stat">
        <span className="label">Reviewed Today</span>
        <span className="value">{todayCount}</span>
        <span className="sub">across all sessions</span>
      </div>
    </div>
  );
}

function Toolbar({
  view,
  setView,
  query,
  setQuery,
  posFilter,
  setPosFilter,
  masteryFilter,
  setMasteryFilter,
}: {
  view: RecordView;
  setView: (v: RecordView) => void;
  query: string;
  setQuery: (v: string) => void;
  posFilter: "all" | CommonplacePos;
  setPosFilter: (v: "all" | CommonplacePos) => void;
  masteryFilter: "all" | MasteryState;
  setMasteryFilter: (v: "all" | MasteryState) => void;
}) {
  const VIEWS: Array<{
    k: RecordView;
    icon: (s?: number) => React.ReactNode;
    l: string;
  }> = [
    { k: "grid", icon: Icon.grid, l: "Grid" },
    { k: "list", icon: Icon.list, l: "List" },
    { k: "grouped", icon: Icon.group, l: "Grouped" },
  ];
  return (
    <div className="toolbar">
      <div className="search">
        <span style={{ color: "var(--ink-3)" }}>{Icon.search()}</span>
        <input
          placeholder="Search the lexicon…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="filter-group">
        {POS_OPTS.map((p) => (
          <button
            key={p}
            className={"chip " + (posFilter === p ? "active" : "")}
            onClick={() => setPosFilter(p)}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="filter-group">
        {MAS_OPTS.map((m) => (
          <button
            key={m.k}
            className={"chip " + (masteryFilter === m.k ? "active" : "")}
            onClick={() => setMasteryFilter(m.k)}
          >
            {m.l}
          </button>
        ))}
      </div>
      <div className="filter-group">
        {VIEWS.map((v) => (
          <button
            key={v.k}
            className={"chip " + (view === v.k ? "active" : "")}
            onClick={() => setView(v.k)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {v.icon()} {v.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function GridView({
  words,
  mastery,
  onJump,
}: {
  words: SplitVariableResult[];
  mastery: Record<string, MasteryState>;
  onJump: (id: string) => void;
}) {
  return (
    <div className="grid">
      {words.map((w, i) => {
        const m = mastery[w.id] || "new";
        return (
          <div
            key={`${w.id}-${i}`}
            className="card"
            onClick={() => onJump(w.id)}
          >
            <span className="num">{String(i + 1).padStart(3, "0")}</span>
            <div className="word">{w.front}</div>
            <div className="trans">{w.back}</div>
            <div className="meta">
              <span className={`pos ${w.pos}`}>{w.pos}</span>
              <span style={{ flex: 1 }} />
              <span className={`mastery-dot ${m}`} title={m} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  words,
  mastery,
  onJump,
}: {
  words: SplitVariableResult[];
  mastery: Record<string, MasteryState>;
  onJump: (id: string) => void;
}) {
  return (
    <div className="index-list">
      {words.map((w, i) => {
        const m = mastery[w.id] || "new";
        return (
          <div
            key={`${w.id}-${i}`}
            className="index-row"
            onClick={() => onJump(w.id)}
          >
            <span className="ix">{String(i + 1).padStart(3, "0")}</span>
            <span className="word">{w.front}</span>
            <span className={`pos ${w.pos}`}>{w.pos}</span>
            <span className="leader">
              <span className="dots" />
              <span className="trans">{w.back}</span>
            </span>
            <span className="mastery-cell">
              <span className={`mastery-dot ${m}`} /> {m}
            </span>
            <button
              className="icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (w.hasAudioFront) {
                  playAudio(
                    `/api/audio?id=${encodeURIComponent(w.id)}&kind=front`,
                    w.front,
                  );
                } else {
                  speak(w.front);
                }
              }}
              title="Speak"
              aria-label="Speak"
            >
              {Icon.speaker(13)}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function GroupedView({
  words,
  onJump,
}: {
  words: SplitVariableResult[];
  onJump: (id: string) => void;
}) {
  const groups = useMemo(() => {
    const g: Record<string, SplitVariableResult[]> = {};
    words.forEach((w) => {
      g[w.pos] = g[w.pos] || [];
      g[w.pos].push(w);
    });
    const order: CommonplacePos[] = [
      "noun",
      "verb",
      "adjective",
      "adverb",
      "phrase",
      "preposition",
      "other",
    ];
    return order.filter((k) => g[k]).map((k) => ({ key: k, items: g[k]! }));
  }, [words]);

  const title = (key: string) => {
    if (key === "phrase") return "Phrases";
    if (key === "other") return "Others";
    return `${key.charAt(0).toUpperCase()}${key.slice(1)}s`;
  };

  return (
    <div>
      {groups.map((g) => (
        <div key={g.key} className="group-block">
          <div className="group-head">
            <h3>{title(g.key)}</h3>
            <span className="count">{g.items.length} entries</span>
          </div>
          <div className="entry-list">
            {g.items.map((w, i) => (
              <div
                key={`${w.id}-${i}`}
                className="entry"
                onClick={() => onJump(w.id)}
                style={{ cursor: "pointer" }}
              >
                <span className="word">{w.front}</span>
                <span className={`pos ${w.pos}`}>{w.pos}</span>
                <span className="trans">{w.back}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecordClient({ data }: Props) {
  const router = useRouter();
  const [tweaks] = useTweaks();
  const [mastery] = useStored<Record<string, MasteryState>>("mastery_v1", {});
  const [sessionState] = useStored<{
    touched: string[];
    lastIdx: number;
    date: string | null;
  }>("session_v1", { touched: [], lastIdx: 0, date: null });

  const [view, setView] = useStored<RecordView>(
    "record_view",
    tweaks.recordView || "grid",
  );
  useEffect(() => {
    if (tweaks.recordView) setView(tweaks.recordView);
  }, [tweaks.recordView, setView]);

  const [query, setQuery] = useState("");
  const [posFilter, setPosFilter] = useState<"all" | CommonplacePos>("all");
  const [masteryFilter, setMasteryFilter] = useState<"all" | MasteryState>(
    "all",
  );

  const filtered = useMemo(
    () =>
      data.filter((w) => {
        if (posFilter !== "all" && w.pos !== posFilter) return false;
        if (masteryFilter !== "all") {
          const m = mastery[w.id] || "new";
          if (m !== masteryFilter) return false;
        }
        if (query) {
          const q = query.toLowerCase();
          if (
            !w.front.toLowerCase().includes(q) &&
            !w.back.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [data, query, posFilter, masteryFilter, mastery],
  );

  const totals = useMemo(() => {
    let learning = 0;
    let mastered = 0;
    Object.values(mastery).forEach((m) => {
      if (m === "learning") learning++;
      if (m === "mastered") mastered++;
    });
    return { learning, mastered };
  }, [mastery]);

  const jumpToWord = (id: string) => {
    try {
      sessionStorage.setItem("commonplace_jump_id", id);
    } catch {}
    router.push("/vocab/review");
  };

  return (
    <div className="page">
      <div className="section-head">
        <h2>
          The <em>Record</em>
        </h2>
        <span className="eyebrow">
          Volume I · Folio {data.length}
        </span>
      </div>
      <Stats
        total={data.length}
        learning={totals.learning}
        mastered={totals.mastered}
        todayCount={sessionState.touched.length}
      />
      <div style={{ height: 8 }} />
      <Toolbar
        view={view}
        setView={setView}
        query={query}
        setQuery={setQuery}
        posFilter={posFilter}
        setPosFilter={setPosFilter}
        masteryFilter={masteryFilter}
        setMasteryFilter={setMasteryFilter}
      />
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: 11,
          letterSpacing: ".08em",
          color: "var(--ink-3)",
          marginBottom: 14,
        }}
      >
        Showing {filtered.length} of {data.length} entries
        {posFilter !== "all" && ` · ${posFilter}`}
        {masteryFilter !== "all" && ` · ${masteryFilter}`}
      </div>
      {view === "grid" && (
        <GridView words={filtered} mastery={mastery} onJump={jumpToWord} />
      )}
      {view === "list" && (
        <ListView words={filtered} mastery={mastery} onJump={jumpToWord} />
      )}
      {view === "grouped" && (
        <GroupedView words={filtered} onJump={jumpToWord} />
      )}
    </div>
  );
}
