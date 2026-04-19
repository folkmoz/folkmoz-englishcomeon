import { ReactNode } from "react";
import { CommonplaceShell } from "@/components/commonplace/shell";
import { getAllVocab } from "@/lib/api";

interface VocabLayoutProps {
  children: ReactNode;
}

export default async function VocabLayout({ children }: VocabLayoutProps) {
  const data = await getAllVocab();
  return (
    <CommonplaceShell totalEntries={data.length}>{children}</CommonplaceShell>
  );
}
