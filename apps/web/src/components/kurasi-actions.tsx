"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Status hasil keputusan sesuai kontrak POST /api/kurasi (fase 5b). */
type ApiStatus = "published" | "rejected" | "pending_second" | "untouched";

const PESAN_STATUS: Record<ApiStatus, string> = {
  published: "Tercatat ✓ kuorum 2 approver terpenuhi — published.",
  rejected: "Tercatat ✓ ditolak — keluar dari dataset publik saat build:data berikutnya.",
  pending_second:
    "Tercatat ✓ menunggu telaah kedua (publikasi butuh approver beda nama).",
  untouched: "Tercatat.",
};

export function KurasiActions({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function decide(decision: "approved" | "rejected") {
    let note: string | null | undefined;
    if (decision === "rejected") {
      note = window.prompt("Alasan penolakan (wajib):");
      if (!note) return;
    } else if (
      !window.confirm(
        `Setujui penilaian ${assessmentId}? Publikasi butuh 2 approver ` +
          `berbeda nama — approval pertama hanya menandai "menunggu telaah kedua".`
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/kurasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, decision, note }),
      });
      const json = (await res.json()) as { error?: string; status?: ApiStatus };
      setMsg(
        res.ok
          ? PESAN_STATUS[json.status ?? "untouched"]
          : (json.error ?? "gagal")
      );
      if (res.ok) router.refresh();
    } catch {
      setMsg("Gagal menghubungi server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={busy}
        onClick={() => decide("approved")}
        className="rounded-md bg-green-600/90 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-40"
      >
        Setujui
      </button>
      <button
        disabled={busy}
        onClick={() => decide("rejected")}
        className="rounded-md bg-red-600/80 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-40"
      >
        Tolak
      </button>
      {msg && <span className="text-[11px] text-[var(--muted)] max-w-64">{msg}</span>}
    </div>
  );
}
