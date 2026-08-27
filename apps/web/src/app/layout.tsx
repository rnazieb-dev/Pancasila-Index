import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "Pancasila Index",
  description:
    "Indeks Kepancasilaan terbuka: menilai kesetiaan pemangku kekuasaan Indonesia pada Pancasila, Pembukaan UUD 1945, dan UUD 1945 — berbasis bukti.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col antialiased">
        <LocaleProvider>
          <AppChrome>{children}</AppChrome>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
