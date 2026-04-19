import { ReactNode } from "react";
import { CommonplaceShell } from "@/components/commonplace/shell";
import { getAllVocab } from "@/lib/api";

interface MarketingLayoutProps {
  children: ReactNode;
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  const data = await getAllVocab();
  return (
    <CommonplaceShell totalEntries={data.length}>{children}</CommonplaceShell>
  );
}
