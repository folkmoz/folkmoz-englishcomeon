import { ReactNode } from "react";
import { CommonplaceShell } from "@/components/commonplace/shell";
import { getAllVocab } from "@/lib/api";
import { isAuthed } from "@/lib/auth";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const [data, admin] = await Promise.all([getAllVocab(), isAuthed()]);
  return (
    <CommonplaceShell totalEntries={data.length} isAdmin={admin}>
      {children}
    </CommonplaceShell>
  );
}
