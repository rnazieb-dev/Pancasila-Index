"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { dataset } from "@pancasila-index/data";
import {
  getUserDrafts,
  deleteUserDraft,
  duplicateUserDraft,
  saveUserDraft,
  type UserDraft,
} from "@/lib/user-drafts";
import {
  IconInstitution,
  IconShieldCheck,
  IconFilePlus,
  IconArchive,
  IconAuditLog,
  IconScale,
  IconEdit,
  IconSettings,
  IconSearch,
  IconUsers,
} from "@/components/icons";

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  role: string;
  githubUsername?: string | null;
  affiliation: string | null;
  title: string | null;
  funding: string | null;
  bio: string | null;
  createdAt: string;
}

interface UsulanItem {
  id: string;
  targetType: string;
  targetId: string;
  decision: string;
  notes: string | null;
  status: "pending_review" | "pending_second" | "published" | "rejected";
  approversCount: number;
  createdAt: string;
}

type TabType = "usulan" | "draf" | "profil" | "keamanan";

export default function PengaturanPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("usulan");

  // Usulan & Draf state
  const [usulanList, setUsulanList] = useState<UsulanItem[]>([]);
  const [drafts, setDrafts] = useState<UserDraft[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    affiliation: "",
    title: "",
    funding: "",
    bio: "",
  });

  const refreshDrafts = () => {
    setDrafts(getUserDrafts());
  };

  useEffect(() => {
    refreshDrafts();

    // Fetch user profile
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
        // If profile endpoint fails, fallback to session data
        if (session?.user) {
          setProfile({
            id: session.user.id || "user",
            name: session.user.name || null,
            email: session.user.email || null,
            image: session.user.image || null,
            role: session.user.role || "KONTRIBUTOR",
            githubUsername: session.user.githubUsername || null,
            affiliation: session.user.affiliation || null,
            title: session.user.title || null,
            funding: session.user.funding || null,
            bio: session.user.bio || null,
            createdAt: new Date().toISOString(),
          });
          setFormData({
            name: session.user.name || "",
            affiliation: session.user.affiliation || "",
            title: session.user.title || "",
            funding: session.user.funding || "",
            bio: session.user.bio || "",
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch usulan history
    fetch("/api/user/usulan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data) {
          setUsulanList(data.data);
        }
      })
      .catch(() => {});
  }, [session]);

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
        if (profile) {
          setProfile({
            ...profile,
            ...formData,
          });
        }
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        alert(data.error || "Gagal menyimpan.");
      }
    } catch {
      alert("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun?")) {
      await signOut({ callbackUrl: "/" });
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        alert("Gagal mengekspor data. Silakan coba kembali.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pancasila-index-data-saya.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Terjadi kesalahan saat mengekspor data.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Hapus akun dan data pribadi Anda secara permanen?\n\n" +
          "Ini akan menghapus akun, email, dan data pribadi Anda. Kontribusi kurasi yang bersifat publik dipertahankan dalam bentuk anonim demi integritas ilmiah.\n\nTindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }
    if (!confirm("Anda yakin? Ketik konfirmasi kedua ini menandakan persetujuan akhir.")) {
      return;
    }
    try {
      const res = await fetch("/api/user/account", { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.message || "Akun Anda telah dihapus.");
        await signOut({ callbackUrl: "/" });
      } else {
        alert(data.error || "Gagal menghapus akun.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus akun.");
    }
  };

  const handleDeleteDraft = (id: string, title: string) => {
    if (confirm(`Hapus draf "${title}"?`)) {
      deleteUserDraft(id);
      refreshDrafts();
    }
  };

  const handleDuplicateDraft = (id: string) => {
    duplicateUserDraft(id);
    refreshDrafts();
  };

  const handleExportJson = () => {
    const dataStr = JSON.stringify(drafts, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pancasila-index-drafts-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          for (const item of imported) {
            saveUserDraft(item);
          }
          refreshDrafts();
          alert(`Berhasil mengimpor ${imported.length} draf.`);
        }
      } catch {
        alert("Format berkas JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  const inputCls =
    "w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text)] placeholder-[var(--muted)] focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition";
  const labelCls = "block text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5";

  if (loading || sessionStatus === "loading") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center text-xs text-[var(--muted)]">
        <div className="inline-block size-6 animate-spin rounded-full border-2 border-[var(--line)] border-t-red-600 mb-3" />
        <div>Memuat profil kontributor & portofolio usulan...</div>
      </div>
    );
  }

  const currentUser = profile || (session?.user ? {
    id: session.user.id || "user",
    name: session.user.name || "Kontributor",
    email: session.user.email || null,
    image: session.user.image || null,
    role: session.user.role || "KONTRIBUTOR",
    githubUsername: session.user.githubUsername || null,
    affiliation: session.user.affiliation || null,
    title: session.user.title || null,
    funding: session.user.funding || null,
    bio: session.user.bio || null,
    createdAt: new Date().toISOString(),
  } : null);

  if (!currentUser && sessionStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel)] text-[var(--acc-amber)]">
          <IconShieldCheck size={28} />
        </div>
        <h1 className="text-2xl font-bold">Anda Belum Masuk</h1>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Silakan masuk atau daftar akun untuk mengakses dashboard kontributor, memantau kuorum usulan, dan mengelola portofolio riset Anda.
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <Link
            href="/masuk"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
          >
            Masuk ke Akun
          </Link>
          <Link
            href="/daftar"
            className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-5 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
          >
            Daftar Baru
          </Link>
        </div>
      </div>
    );
  }

  const userRole = currentUser?.role || "KONTRIBUTOR";
  const userInitials = (currentUser?.name || "Kontributor")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const institutionsById = new Map(dataset.institutions.map((i) => [i.id, i]));
  const dimensionsById = new Map(dataset.rubric.dimensions.map((d) => [d.id, d]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition">
          Beranda
        </Link>
        <span>&rsaquo;</span>
        <Link href="/peer-review" className="hover:text-[var(--text)] transition">
          Peer Review
        </Link>
        <span>&rsaquo;</span>
        <span className="text-[var(--text)]">Profil Kontributor</span>
      </div>

      {/* Header Profil Kontributor */}
      <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {currentUser?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.image}
                alt={currentUser.name || "Avatar"}
                className="size-16 sm:size-20 rounded-2xl border-2 border-[var(--line)] object-cover shadow-sm"
              />
            ) : (
              <div className="size-16 sm:size-20 rounded-2xl border-2 border-[var(--line)] bg-red-600/10 text-[var(--acc-red)] font-bold text-xl sm:text-2xl flex items-center justify-center shadow-sm">
                {userInitials}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                  {currentUser?.name || "Kontributor Terdaftar"}
                </h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                    userRole === "ADMIN"
                      ? "bg-red-500/15 text-[var(--acc-red-strong)] border-red-500/30"
                      : userRole === "KURATOR"
                      ? "bg-amber-500/15 text-[var(--acc-amber-strong)] border-amber-500/30"
                      : "bg-emerald-500/15 text-[var(--acc-emerald-strong)] border-emerald-500/30"
                  }`}
                >
                  {userRole}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                {currentUser?.email && <span>{currentUser.email}</span>}
                {currentUser?.githubUsername && (
                  <a
                    href={`https://github.com/${currentUser.githubUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[var(--text)] hover:underline font-medium"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    @{currentUser.githubUsername}
                  </a>
                )}
                {currentUser?.affiliation && (
                  <span className="flex items-center gap-1">
                    <IconInstitution size={13} />
                    {currentUser.affiliation}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/usulkan-bukti"
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition shadow flex items-center gap-1.5"
            >
              <IconFilePlus size={14} />
              + Usulkan Bukti
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--acc-red)] hover:border-red-500/40 transition"
              title="Keluar dari akun"
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[var(--line)]">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5 text-center">
            <div className="font-mono text-xl sm:text-2xl font-black text-[var(--text)]">
              {usulanList.length}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Usulan Diajukan</div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5 text-center">
            <div className="font-mono text-xl sm:text-2xl font-black text-[var(--acc-emerald-strong)]">
              {usulanList.filter((u) => u.status === "published").length}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Kuorum Disetujui</div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5 text-center">
            <div className="font-mono text-xl sm:text-2xl font-black text-[var(--acc-amber-strong)]">
              {drafts.length}
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Draf di Browser</div>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-3.5 text-center">
            <div className="font-mono text-xl sm:text-2xl font-black text-[var(--acc-sky-strong)]">
              100%
            </div>
            <div className="text-[11px] text-[var(--muted)] mt-0.5">Integritas COPE</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-3">
        {[
          { id: "usulan", label: "Usulan Saya", count: usulanList.length, icon: IconFilePlus },
          { id: "draf", label: "Draf Lokal Saya", count: drafts.length, icon: IconArchive },
          { id: "profil", label: "Edit Profil & Afiliasi", icon: IconUsers },
          { id: "keamanan", label: "Keamanan & Sesi Persisten", icon: IconSettings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                isActive
                  ? "bg-[var(--text)] text-[var(--bg)] border-[var(--text)] shadow-xs"
                  : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:text-[var(--text)] hover:border-slate-500"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isActive
                      ? "bg-[var(--bg)] text-[var(--text)]"
                      : "bg-[var(--bg)] text-[var(--muted)]"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USULAN SAYA */}
      {activeTab === "usulan" && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                Portofolio Usulan Bukti Primer & Penilaian
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Status transparansi kuorum dua-reviewer untuk setiap usulan yang Anda kirimkan.
              </p>
            </div>
            <Link
              href="/usulkan-bukti"
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
            >
              + Usulkan Bukti Baru
            </Link>
          </div>

          {usulanList.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] p-12 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-amber)]">
                <IconFilePlus size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Belum Ada Usulan Terkirim</h3>
              <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                Anda belum mengajukan usulan bukti primer. Berikan kontribusi akademik Anda dengan mengusulkan undang-undang, putusan MK, dokumen negara, atau laporan audit lembaga.
              </p>
              <Link
                href="/usulkan-bukti"
                className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
              >
                Mulai Usulkan Bukti Pertama &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {usulanList.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3 hover:border-slate-500 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-mono text-[var(--muted)]">#{item.id}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              item.status === "published"
                                ? "bg-emerald-500/15 text-[var(--acc-emerald-strong)] border border-emerald-500/30"
                                : item.status === "pending_second"
                                ? "bg-amber-500/15 text-[var(--acc-amber-strong)] border border-amber-500/30"
                                : item.status === "rejected"
                                ? "bg-red-500/15 text-[var(--acc-red-strong)] border border-red-500/30"
                                : "bg-sky-500/15 text-[var(--acc-sky-strong)] border border-sky-500/30"
                            }`}
                          >
                            {item.status === "published"
                              ? "Disetujui & Diterbitkan (Kuorum 2/2)"
                              : item.status === "pending_second"
                              ? "Menunggu Reviewer 2 (Kuorum 1/2)"
                              : item.status === "rejected"
                              ? "Ditolak / Butuh Revisi"
                              : "Menunggu Telaah Reviewer"}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[var(--text)]">
                          Target: {item.targetType} ({item.targetId})
                        </h4>
                      </div>

                      <div className="text-right text-[10px] text-[var(--muted)]">
                        Diajukan: {new Date(item.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[var(--muted)] bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)] leading-relaxed">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: DRAF LOKAL */}
      {activeTab === "draf" && (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text)]">
                Draf Usulan Tersimpan di Peramban
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Draf tersimpan di penyimpanan lokal browser Anda dan dapat dilanjutkan kapan saja.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/peer-review/usulan"
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
              >
                + Buat Draf Baru
              </Link>
              {drafts.length > 0 && (
                <button
                  onClick={handleExportJson}
                  className="rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition"
                >
                  Cadangkan JSON
                </button>
              )}
              <label className="cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition">
                Impor JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--line)] p-12 text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--panel)] border border-[var(--line)] text-[var(--acc-sky)]">
                <IconArchive size={24} />
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">Belum Ada Draf Tersimpan</h3>
              <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed">
                Saat Anda menulis usulan bukti di portal Peer Review, Anda dapat menyimpannya sebagai draf lokal agar tidak hilang.
              </p>
              <Link
                href="/peer-review/usulan"
                className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
              >
                Mulai Tulis Draf Pertama &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {drafts.map((d) => {
                const inst = institutionsById.get(d.institution_id);
                const dim = dimensionsById.get(d.dimension_id);

                const fields = [
                  d.institution_id,
                  d.term_id,
                  d.dimension_id,
                  d.source_type,
                  d.source_title,
                  d.source_url,
                  d.argumentasi,
                  d.nama,
                  d.afiliasi,
                  d.funding,
                  d.setuju_pakta,
                ];
                const completedFields = fields.filter(Boolean).length;
                const pct = Math.round((completedFields / fields.length) * 100);

                const formattedDate = new Date(d.updatedAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 space-y-3 hover:border-slate-500 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded bg-amber-500/20 text-[var(--acc-amber)] font-bold px-2 py-0.5">
                            DRAF LOKAL
                          </span>
                          {inst && (
                            <span className="rounded bg-[var(--bg)] text-[var(--text)] border border-[var(--line)] font-medium px-2 py-0.5">
                              {inst.name_id}
                            </span>
                          )}
                          {dim && (
                            <span className="text-[var(--muted)]">
                              • {dim.name_id}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-[var(--text)] mt-1">
                          {d.source_title || d.title}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[var(--acc-amber)]">
                          {pct}% Lengkap
                        </span>
                        <div className="text-[10px] text-[var(--muted)]">
                          Diperbarui: {formattedDate}
                        </div>
                      </div>
                    </div>

                    {d.argumentasi && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed bg-[var(--bg)] p-3 rounded-xl border border-[var(--line)]">
                        &ldquo;{d.argumentasi}&rdquo;
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--line)]">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/peer-review/usulan?draftId=${d.id}`}
                          className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition"
                        >
                          Lanjutkan Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicateDraft(d.id)}
                          className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition"
                        >
                          Duplikasi
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(d, null, 2));
                            setCopiedId(d.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition"
                        >
                          {copiedId === d.id ? "✓ Tersalin" : "Salin JSON"}
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteDraft(d.id, d.source_title || d.title)}
                        className="text-xs text-[var(--acc-red)] hover:text-[var(--acc-red-strong)] transition font-medium"
                      >
                        Hapus Draf
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: EDIT PROFIL & DEKLARASI TRANSPARANSI */}
      {activeTab === "profil" && (
        <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Data Profil & Deklarasi Transparansi Standar COPE
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Informasi afiliasi dan sumber pendanaan riset Anda dipublikasikan secara terbuka bersama setiap telaah ilmiah untuk menjamin integritas riset.
            </p>
          </div>

          {saveMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-[var(--acc-emerald-strong)] font-semibold">
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
                  value={currentUser?.email || ""}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Afiliasi Institusi</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Universitas / Lembaga Riset / Mahkamah"
                  value={formData.affiliation}
                  onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Jabatan / Gelar Akademis</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Dosen Hukum Tata Negara, Peneliti Kebijakan"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Default Funding Disclosure (Standar COPE)</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Mandiri / Tidak Ada / Hibah Penelitian Universitas"
                value={formData.funding}
                onChange={(e) => setFormData({ ...formData, funding: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                Deklarasikan bila ada lembaga donor, partai politik, atau sponsor yang mendanai riset Anda.
              </p>
            </div>

            <div>
              <label className={labelCls}>Biografi Singkat / Fokus Keahlian</label>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                placeholder="Spesialisasi hukum tata negara, pengujian undang-undang, hak asasi manusia, tata kelola peradilan..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 shadow"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </form>
        </section>
      )}

      {/* TAB 4: KEAMANAN & SESI PERSISTEN */}
      {activeTab === "keamanan" && (
        <section className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">Manajemen Sesi Persisten & Keamanan</h2>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Akun Anda menggunakan sistem sesi persisten jangka panjang (1 tahun). Sesi tidak akan
              kedaluwarsa atau keluar secara otomatis saat Anda menutup peramban atau mematikan perangkat.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-[var(--acc-emerald-strong)] flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                Sesi Persisten Aktif
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                Terhubung sebagai <strong>{currentUser?.email || currentUser?.name}</strong> sejak{" "}
                {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString("id-ID", { dateStyle: "long" })}.
              </p>
            </div>
            <span className="rounded-lg bg-[var(--bg)] text-[var(--text)] border border-[var(--line)] font-mono text-[10px] px-3 py-1.5 w-fit">
              Durasi Token: 365 Hari
            </span>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-[var(--text)]">Pelindungan Data Pribadi (UU No. 27/2022)</h3>
              <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed">
                Anda berhak mengakses, mengoreksi, mengekspor, dan menghapus data pribadi Anda. Detail lengkap:{" "}
                <Link href="/privasi" className="text-[var(--acc-sky)] font-semibold hover:underline">
                  Kebijakan Privasi
                </Link>.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:border-slate-400 transition"
              >
                Ekspor Data Saya (JSON)
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-[var(--acc-red)] hover:bg-red-500 hover:text-white transition"
              >
                Hapus Akun &amp; Data Pribadi
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[var(--muted)]">
              Ingin mengakhiri sesi pada perangkat ini? Anda dapat masuk kembali sewaktu-waktu.
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-[var(--acc-red)] hover:bg-red-500 hover:text-white transition"
            >
              Keluar dari Akun (Logout)
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
