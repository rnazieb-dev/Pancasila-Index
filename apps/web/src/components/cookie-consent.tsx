"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * @vercel/analytics & @vercel/speed-insights dinonaktifkan di komponen
 * ini: library Next.js inject script internal tanpa atribut `nonce`,
 * sehingga akan diblokir oleh Content-Security-Policy nonce-ketat yang
 * dipasang di middleware. Untuk re-enable, bungkus dengan `<Script>`
 * Next.js + lewatkan `nonce` yang dibaca dari `headers()`.
 *
 * Lihat SECURITY.md untuk justifikasi.
 */

const CONSENT_KEY = "pi-consent-v1";

type Consent = "granted" | "denied" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(CONSENT_KEY) as Consent | null;
      setConsent(v);
    } catch {
      // abaikan bila penyimpanan lokal diblokir
    }
    setReady(true);
  }, []);

  const decide = (value: "granted" | "denied") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // abaikan bila penyimpanan lokal diblokir
    }
    setConsent(value);
  };

  return (
    <>
      {ready && consent === null && (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--line)] bg-[var(--panel)] px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-[var(--muted)]">
              Kami menggunakan kuki sesi yang diperlukan untuk autentikasi.
              Lihat{" "}
              <Link href="/privasi" className="font-semibold text-[var(--acc-sky)] hover:underline">
                Kebijakan Privasi
              </Link>{" "}
              untuk detail pelindungan data pribadi (UU No. 27/2022).
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => decide("denied")}
                className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--text)] hover:border-slate-400"
              >
                Hanya Kuki Esensial
              </button>
              <button
                onClick={() => decide("granted")}
                className="rounded-lg bg-[var(--acc-red)] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
              >
                Setuju
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
