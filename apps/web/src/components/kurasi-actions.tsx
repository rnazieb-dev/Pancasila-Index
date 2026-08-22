"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        `Setujui penilaian ${assessmentId}? Status akan menjadi published.`
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
      const json = (await res.json()) as { error?: string };
      setMsg(res.ok ? "Tercatat ✓ jalankan build:data untuk menerapkan" : (json.error ?? "gagal"));
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
      {msg && <span className="text-[11px] text-[var(--muted)] max-w-56">{msg}</span>}
    </div>
  );
}
