import { ReactNode } from "react";
import { CommonplaceShell } from "@/components/commonplace/shell";
import { getAllVocab } from "@/lib/api";
import { isAuthed } from "@/lib/auth";

interface VocabLayoutProps {
  children: ReactNode;
}

export default async function VocabLayout({ children }: VocabLayoutProps) {
  const [data, admin] = await Promise.all([getAllVocab(), isAuthed()]);
  return (
    <CommonplaceShell totalEntries={data.length} isAdmin={admin}>
      {children}
    </CommonplaceShell>
  );
}
