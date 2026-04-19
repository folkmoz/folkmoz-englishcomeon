"use client";
import { CommonplaceTweaks } from "@/types";
import { Dispatch, SetStateAction } from "react";

interface Option<V> {
  v: V;
  l: string;
}

interface TweaksPanelProps {
  tweaks: CommonplaceTweaks;
  setTweaks: Dispatch<SetStateAction<CommonplaceTweaks>>;
  visible: boolean;
  onClose: () => void;
}

function Group<V extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: Option<V>[];
  onChange: (v: V) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <div className="opts">
        {options.map((o) => (
          <button
            key={String(o.v)}
            className={value === o.v ? "active" : ""}
            onClick={() => onChange(o.v)}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TweaksPanel({
  tweaks,
  setTweaks,
  visible,
  onClose,
}: TweaksPanelProps) {
  if (!visible) return null;
  const set =
    <K extends keyof CommonplaceTweaks>(k: K) =>
    (v: CommonplaceTweaks[K]) =>
      setTweaks((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="tweaks-panel">
      <div className="head">
        <span>Tweaks</span>
        <button className="close" onClick={onClose} aria-label="Close tweaks">
          ×
        </button>
      </div>
      <div className="body">
        <Group
          label="Theme"
          value={tweaks.theme}
          options={[
            { v: "parchment", l: "Parchment" },
            { v: "ivory", l: "Ivory" },
            { v: "dusk", l: "Dusk" },
          ]}
          onChange={set("theme")}
        />
        <Group
          label="Display Font"
          value={tweaks.displayFont}
          options={[
            { v: "cormorant", l: "Cormorant" },
            { v: "newsreader", l: "Newsreader" },
            { v: "eb", l: "EB Garamond" },
          ]}
          onChange={set("displayFont")}
        />
        <Group
          label="Default Record View"
          value={tweaks.recordView}
          options={[
            { v: "grid", l: "Grid" },
            { v: "list", l: "List" },
            { v: "grouped", l: "Grouped" },
          ]}
          onChange={set("recordView")}
        />
        <Group
          label="Daily Quota"
          value={tweaks.dailyQuota}
          options={[
            { v: 10, l: "10" },
            { v: 20, l: "20" },
            { v: 30, l: "30" },
            { v: 50, l: "50" },
          ]}
          onChange={set("dailyQuota")}
        />
      </div>
    </div>
  );
}
