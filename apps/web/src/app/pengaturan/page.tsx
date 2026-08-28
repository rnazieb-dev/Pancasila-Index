"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  affiliation: string | null;
  title: string | null;
  funding: string | null;
  bio: string | null;
  createdAt: string;
}

export default function PengaturanPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    affiliation: "",
    title: "",
    funding: "",
    bio: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.data) {
          setProfile(data.data);
          setFormData({
            name: data.data.name || "",
            affiliation: data.data.affiliation || "",
            title: data.data.title || "",
            funding: data.data.funding || "",
            bio: data.data.bio || "",
          });
        }
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMessage("✓ Profil dan preferensi transparansi berhasil disimpan.");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        alert(data.error || "Gagal menyimpan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await signOut({ callbackUrl: "/" });
    }
  };

  const inputCls =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition";
  const labelCls = "block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5";

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-xs text-[var(--muted)]">
        Memuat data akun...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold">Anda Belum Masuk</h1>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Silakan masuk atau daftar akun untuk mengelola profil pengulas dan pengaturan sesi Anda.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href="/masuk"
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition"
          >
            Masuk ke Akun
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
          >
            Daftar Baru
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--line)] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[var(--acc-red)] font-semibold">
            Akun Kontributor
          </span>
          <h1 className="mt-1 text-3xl font-bold">Pengaturan Profil & Sesi</h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            Kelola identitas publik, deklarasi transparansi standar COPE, dan sesi persisten Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/20 text-[var(--acc-emerald)] border border-emerald-500/30 px-3 py-1 text-xs font-semibold">
            {profile.role}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {/* Formulir Profil */}
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Data Profil & Afiliasi Publik</h2>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Informasi ini akan terisi otomatis saat Anda mengajukan usulan tinjauan sejawat (Peer Review).
            </p>
          </div>

          {saveMessage && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-[var(--acc-emerald)]">
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  className={inputCls}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Alamat Email (Terkunci)</label>
                <input
                  type="email"
                  disabled
                  className={`${inputCls} opacity-60 cursor-not-allowed`}
                  value={profile.email || ""}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Afiliasi Institusi</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Universitas / Lembaga Riset"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Jabatan / Gelar Akademis</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Dosen Hukum Tata Negara, Peneliti"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Default Funding Disclosure</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Mandiri / Tidak Ada / Lembaga Pemberi Dana"
                value={formData.funding}
                onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Sumber pendanaan riset yang biasanya Anda terima untuk kajian kebijakan negara.
              </p>
            </div>

            <div>
              <label className={labelCls}>Biografi Singkat / Fokus Keahlian</label>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                placeholder="Spesialisasi hukum tata negara, pengujian undang-undang, hak asasi manusia..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </form>
        </section>

        {/* Manajemen Sesi Persisten */}
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Status Sesi Persisten</h2>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Akun Anda menggunakan sistem sesi persisten jangka panjang (1 tahun). Sesi tidak akan
              kedaluwarsa atau keluar secara otomatis saat Anda menutup peramban atau mematikan perangkat.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4 flex items-center justify-between text-xs">
            <div className="space-y-1">
              <div className="font-bold text-[var(--acc-emerald-strong)] flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Sesi Aktif (Persisten)
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Terhubung sebagai <strong>{profile.email}</strong> sejak{" "}
                {new Date(profile.createdAt).toLocaleDateString("id-ID", { dateStyle: "long" })}.
              </p>
            </div>
            <span className="rounded bg-slate-800 text-slate-300 font-mono text-[10px] px-2 py-1">
              Max-Age: 365 hari
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
            <div className="text-xs text-[var(--muted)]">
              Ingin mengakhiri sesi pada perangkat ini?
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-[var(--acc-red)] hover:bg-red-500 hover:text-white transition"
            >
              🚪 Keluar dari Akun (Logout)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
