"use client";

import { AudioPlayer } from "@/components/audio-player";

/**
 * Wrapper client untuk AudioPlayer yang dipakai dari server component.
 * Hindari masalah hydration mismatch karena client component yang
 * di-mount dari server component aman (Next.js 15 supports this).
 */
export function AudioPlayerClient(props: {
  slug: string;
  type?: "event" | "term" | "institution" | "root";
  label?: string;
  size?: "sm" | "md";
}) {
  return <AudioPlayer {...props} />;
}
