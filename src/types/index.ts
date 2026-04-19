export type CommonplacePos =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "preposition"
  | "other";

export type MasteryState = "new" | "learning" | "mastered";

export interface SplitVariableResult {
  id: string;
  front: string;
  back: string;
  phrase: string | null;
  pos: CommonplacePos;
}

export interface CommonplaceTweaks {
  theme: "parchment" | "ivory" | "dusk";
  displayFont: "cormorant" | "newsreader" | "eb";
  recordView: "grid" | "list" | "grouped";
  dailyQuota: number;
}

export interface CommonplaceSession {
  touched: string[];
  lastIdx: number;
  date: string | null;
}
