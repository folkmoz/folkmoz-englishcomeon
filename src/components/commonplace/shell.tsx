"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { CommonplaceTweaks } from "@/types";
import { Icon } from "./icons";
import { TweaksPanel } from "./tweaks-panel";
import { fmtDate, useStored } from "./use-stored";

const DEFAULT_TWEAKS: CommonplaceTweaks = {
  theme: "parchment",
  displayFont: "cormorant",
  recordView: "list",
  dailyQuota: 20,
  ttsVoice: "Kore",
};

const FONT_MAP: Record<CommonplaceTweaks["displayFont"], string> = {
  cormorant: "'Cormorant Garamond', Georgia, serif",
  newsreader: "'Newsreader', Georgia, serif",
  eb: "'EB Garamond', Georgia, serif",
};

interface ShellProps {
  children: ReactNode;
  totalEntries: number;
  isAdmin?: boolean;
}

export function CommonplaceShell({
  children,
  totalEntries,
  isAdmin = false,
}: ShellProps) {
  const pathname = usePathname();
  const isReview = pathname?.startsWith("/vocab/review");
  const page: "record" | "review" = isReview ? "review" : "record";

  const [tweaks, setTweaks] = useStored<CommonplaceTweaks>(
    "tweaks_v1",
    DEFAULT_TWEAKS,
  );
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("commonplace");
    return () => {
      document.body.classList.remove("commonplace");
    };
  }, []);

  useEffect(() => {
    document.body.dataset.theme = tweaks.theme || "parchment";
    document.documentElement.style.setProperty(
      "--serif-display",
      FONT_MAP[tweaks.displayFont] || FONT_MAP.cormorant,
    );
  }, [tweaks.theme, tweaks.displayFont]);

  const [dateLabel, setDateLabel] = useState("");
  useEffect(() => {
    setDateLabel(fmtDate());
  }, []);

  return (
    <div
      className="commonplace-root"
      data-screen-label={page === "record" ? "01 Record" : "02 Review"}
    >
      <header className="masthead">
        <div className="left">
          <Link
            href="/"
            className={`nav-link ${page === "record" ? "active" : ""}`}
          >
            Record
          </Link>
          <Link
            href="/vocab/review"
            className={`nav-link ${page === "review" ? "active" : ""}`}
          >
            Review
          </Link>
          {isAdmin && (
            <Link href="/admin" className="nav-link nav-admin">
              Admin
            </Link>
          )}
        </div>
        <div className="center">
          <h1>English Commonplace</h1>
          <div className="tagline">A Lexicon · Kept by Hand</div>
        </div>
        <div className="right">
          <span className="date-stamp">{dateLabel}</span>
          <span
            style={{ width: 1, height: 14, background: "var(--rule)" }}
            aria-hidden
          />
          <button
            className="icon-btn"
            onClick={() => setTweaksOpen((o) => !o)}
            title="Tweaks"
            aria-label="Tweaks"
          >
            {Icon.settings(13)}
          </button>
        </div>
      </header>

      {children}

      <footer className="colophon">
        <span>Folio I · Set in Cormorant &amp; Newsreader</span>
        <span>{totalEntries} entries · synced from Notion</span>
      </footer>

      <TweaksPanel
        tweaks={tweaks}
        setTweaks={setTweaks}
        visible={tweaksOpen}
        onClose={() => setTweaksOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export function useTweaks() {
  return useStored<CommonplaceTweaks>("tweaks_v1", DEFAULT_TWEAKS);
}
