"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DaftarPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    affiliation: "",
    title: "",
    funding: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan pendaftaran.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/masuk?registered=true");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
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
          Pancasila<span className="text-red-500">·</span>Index
        </Link>
        <h1 className="mt-3 text-2xl font-bold">Daftar Akun Pengulas</h1>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Bergabung sebagai kontributor dan peninjau sejawat konstitusional terbuka.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 shadow-xl">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg font-bold text-emerald-400">Pendaftaran Berhasil!</h2>
            <p className="text-xs text-[var(--muted)]">Mengarahkan Anda ke halaman masuk...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Nama Lengkap *</label>
              <input
                type="text"
                required
                className={inputCls}
                placeholder="Nama sesuai identitas resmi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Alamat Email *</label>
              <input
                type="email"
                required
                className={inputCls}
                placeholder="email@institusi.ac.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Kata Sandi *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputCls}
                  placeholder="Min. 6 karakter"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Ulangi Sandi *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className={inputCls}
                  placeholder="Ketik ulang"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Afiliasi Institusi (Opsional)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Universitas / Lembaga Riset"
                value={formData.affiliation}
                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Gelar / Jabatan (Opsional)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Dosen HTN, Peneliti, dsb."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <p className="text-[11px] text-[var(--muted)] leading-relaxed pt-1">
              Dengan mendaftar, Anda menyetujui prinsip kenetralan riset dan bersedia mendeklarasikan
              transparansi saat mengirimkan usulan penilaian. Sesi Anda akan tetap aktif secara persisten.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 shadow"
            >
              {loading ? "Mendaftarkan..." : "Daftar Akun Sekarang"}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-[var(--line)] pt-4 text-center text-xs text-[var(--muted)]">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-sky-400 font-semibold hover:text-sky-300">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
