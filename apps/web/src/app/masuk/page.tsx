"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function MasukForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError("Email atau kata sandi tidak cocok. Silakan periksa kembali.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch {
      setError("Terjadi kesalahan saat masuk. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition";
  const labelCls = "block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <Link href="/" className="font-bold tracking-tight text-xl">
          Pancasila<span className="text-[var(--acc-red)]">·</span>Index
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Masuk ke Akun</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Sesi Anda akan tetap aktif secara persisten sampai Anda menekan Logout di Pengaturan.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl space-y-5">
        {registered && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-[var(--acc-emerald)]">
            Akun berhasil dibuat! Silakan masukkan email dan kata sandi Anda.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-[var(--acc-red)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Alamat Email</label>
            <input
              type="email"
              required
              className={inputCls}
              placeholder="email@institusi.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className={labelCls}>Kata Sandi</label>
            </div>
            <input
              type="password"
              required
              className={inputCls}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 shadow"
          >
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>

        <div className="relative border-t border-[var(--line)] pt-4 text-center">
          <span className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-[var(--panel)] px-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            atau
          </span>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl })}
            className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-slate-500 transition flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Masuk dengan Akun GitHub
          </button>
        </div>

        <div className="border-t border-[var(--line)] pt-4 text-center text-xs text-[var(--muted)]">
          Belum memiliki akun?{" "}
          <Link href="/daftar" className="text-[var(--acc-red)] font-semibold hover:text-[var(--acc-red-strong)]">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-20 text-center text-xs text-[var(--muted)]">
          Memuat formulir masuk...
        </div>
      }
    >
      <MasukForm />
    </Suspense>
  );
}
