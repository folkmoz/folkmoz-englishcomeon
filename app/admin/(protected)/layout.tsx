import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
