"use client";
import { ReactNode, useEffect } from "react";

export default function AdminShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.dataset.theme;
    if (!prev) document.body.dataset.theme = "parchment";
    document.body.classList.add("commonplace");
  }, []);
  return <div className="commonplace-root">{children}</div>;
}
