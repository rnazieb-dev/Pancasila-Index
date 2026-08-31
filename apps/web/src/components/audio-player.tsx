"use client";

import { useState } from "react";
import { useLocale } from "@/components/locale-provider";

/**
 * Tombol pemutar audio universal untuk Pancasila Index.
 * - Klien fetch /api/audio/[locale]/[slug]?type=...
 * - Terima audio/mpeg binary stream.
 * - Play / pause di native HTML5 audio.
 * - State: idle | loading | playing | error.
 *
 * Props:
 * - slug: id peristiwa / term / institution / akar-sejarah.
 * - type: "event" | "term" | "institution" | "root".
 * - label: judul untuk announce ke screen reader (opsional).
 */

export interface AudioPlayerProps {
  slug: string;
  type?: "event" | "term" | "institution" | "root";
  label?: string;
  size?: "sm" | "md";
}

export function AudioPlayer({
  slug,
  type = "event",
  label,
  size = "sm",
}: AudioPlayerProps) {
  const { t, locale } = useLocale();
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (state === "loading") return;
    if (state === "playing") {
      // Pause: cari element audio dan pause.
      const audio = document.querySelector<HTMLAudioElement>(
        `audio[data-audio-slug="${slug}"]`
      );
      audio?.pause();
      setState("idle");
      return;
    }

    setState("loading");
    setError(null);
    try {
      const audio = document.querySelector<HTMLAudioElement>(
        `audio[data-audio-slug="${slug}"]`
      );
      if (audio) {
        // Sudah ada element audio dengan src; tinggal play.
        await audio.play();
        setState("playing");
        return;
      }
      // Fetch audio.
      const url = `/api/audio/${locale}/${encodeURIComponent(
        slug
      )}?type=${type}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = new Audio(objUrl);
      a.dataset.audioSlug = slug;
      a.onended = () => {
        setState("idle");
        URL.revokeObjectURL(objUrl);
      };
      a.onerror = () => {
        setState("error");
        setError("Audio gagal diputar.");
        URL.revokeObjectURL(objUrl);
      };
      document.body.appendChild(a);
      await a.play();
      setState("playing");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  const sizeCls =
    size === "md" ? "px-3 py-1.5 text-xs" : "px-2 py-1 text-[10px]";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "loading"}
      title={label ?? t("audioPlayTitle")}
      aria-label={label ?? t("audioPlayTitle")}
      className={`inline-flex items-center gap-1.5 ${sizeCls} font-bold rounded-full border transition ${
        state === "playing"
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
          : state === "error"
          ? "border-red-500/50 bg-red-500/5 text-red-400"
          : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-emerald-500/50 hover:text-emerald-400"
      }`}
    >
      {state === "loading" && <span>{t("audioLoading")}</span>}
      {state === "playing" && <span>{t("audioPlaying")}</span>}
      {state === "error" && <span>{t("audioError")}</span>}
      {state === "idle" && (
        <>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>{t("audioPlay")}</span>
        </>
      )}
      {error && (
        <span className="sr-only" role="status">
          {error}
        </span>
      )}
    </button>
  );
}
