import { Inter as FontSans } from "@next/font/google";
import "./globals.css";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
  weights: [400, 500, 600, 700],
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={cn("font-sans antialiased text-slate-900", fontSans.variable)}
    >
      <head />
      <body className="min-h-screen">
        {children}
        <TailwindIndicator />
      </body>
    </html>
  );
}
