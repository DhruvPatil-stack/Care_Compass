import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareCompass - Plain-Language Discharge Summary",
  description:
    "Turn hospital discharge summaries into a plain-language daily checklist. Practice tool only. Not medical advice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
