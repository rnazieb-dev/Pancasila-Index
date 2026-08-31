import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

import { AppChrome } from "@/components/app-chrome";
import { LocaleProvider } from "@/components/locale-provider";
import { SessionProvider } from "@/components/session-provider";
import { CookieConsent } from "@/components/cookie-consent";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pancasila.site"),
  title: {
    default: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    template: "%s | Pancasila Index"
  },
  description:
    "Platform penilaian independen kesetiaan 8 organ kekuasaan Indonesia terhadap Pancasila, Pembukaan UUD 1945 alinea IV, dan norma struktural UUD 1945 (1945–kini) berbasis bukti primer berkuorum.",
  keywords: [
    "Pancasila Index",
    "UUD 1945",
    "Konstitusi",
    "Presiden",
    "DPR",
    "Mahkamah Konstitusi",
    "Audit Data Terbuka",
    "Akar Sejarah",
    "Syarikat Islam",
    "Piagam Jakarta"
  ],
  authors: [{ name: "Pancasila Index Contributors" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.pancasila.site",
    siteName: "Pancasila Index",
    title: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    description: "Menilai kesetiaan 8 organ konstitusional Indonesia pada Pancasila dan UUD 1945 (1945–kini) dengan setiap skor wajib bersitasi bukti primer.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pancasila Index — Penilaian Kepatuhan Konstitusional Berbasis Bukti",
    description: "Menilai kesetiaan 8 organ konstitusional Indonesia pada Pancasila dan UUD 1945 berbasis bukti primer berkuorum.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light">
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <LocaleProvider>
            <AppChrome>{children}</AppChrome>
          </LocaleProvider>
        </SessionProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
