import Link from "next/link";
import { db } from "@/lib/db";
import {
  IconUsers,
  IconShieldCheck,
  IconInstitution,
  IconFilePlus,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Direktori Kontributor Terverifikasi",
  description:
    "Daftar akademisi, peneliti, dan kontributor ilmiah terverifikasi Pancasila Index dengan deklarasi transparansi standar COPE.",
};

type Contributor = {
  id: string;
  nama: string;
  jabatan: string;
  afiliasi: string;
  funding: string;
  role: string;
  kontribusi: number;
  image?: string | null;
};

export default async function KontributorPage() {
  let contributors: Contributor[] = [];
  try {
    const users = await db.user.findMany({
      where: {
        OR: [
          { role: { in: ["ADMIN", "KURATOR"] } },
          { name: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        title: true,
        affiliation: true,
        funding: true,
        role: true,
        image: true,
        _count: {
          select: {
            reviews: true,
            ckanAudits: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    contributors = users
      .filter((u) => u.name)
      .map((u) => ({
        id: u.id,
        nama: u.name || "Kontributor Terdaftar",
        jabatan: u.title || "Peneliti Konstitusi",
        afiliasi: u.affiliation || "Independen",
        funding: u.funding || "Mandiri / COPE Disclosed",
        role: u.role,
        kontribusi: (u._count?.reviews || 0) + (u._count?.ckanAudits || 0),
        image: u.image,
      }));
  } catch {
    // Graceful fallback if database is empty/unreachable
  }

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
        <span className="text-[var(--text)]">Direktori Kontributor</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[var(--line)] pb-6">
        <div className="space-y-1">
          <span className="text-xs uppercase tracking-widest text-[var(--acc-red)] font-semibold">
            Tinjauan Sejawat Terbuka
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Direktori Kontributor &amp; Penelaah Sejawat
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-2xl leading-relaxed">
            Daftar peneliti, akademisi, dan pakar hukum yang berkontribusi menelaah bukti primer pada Pancasila Index, lengkap dengan afiliasi institusi dan deklarasi transparansi sumber pendanaan.
          </p>
        </div>

        <Link
          href="/usulkan-bukti"
          className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow flex items-center gap-1.5 shrink-0"
        >
          <IconFilePlus size={14} />
          + Ajukan Usulan Bukti
        </Link>
      </div>

      {/* Prinsip COPE */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 text-xs leading-relaxed text-[var(--muted)] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[var(--text)]">
          <IconShieldCheck size={16} className="text-[var(--acc-sky-strong)]" />
          <span>Standar Transparansi COPE (Committee on Publication Ethics)</span>
        </div>
        <p>
          Pancasila Index menerapkan prinsip transparansi penuh. Setiap kontributor wajib mendeklarasikan afiliasi, sumber pendanaan riset, dan ketiadaan konflik kepentingan sebelum telaah diterbitkan ke dalam dataset kanonik.
        </p>
      </div>

      {contributors.length === 0 ? (
        /* Keadaan jika belum ada kontributor terpublikasi di DB */
        <div className="rounded-3xl border border-dashed border-[var(--line)] bg-[var(--panel)]/50 p-12 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-[var(--acc-amber)]">
            <IconUsers size={24} />
          </div>
          <h2 className="text-base font-bold text-[var(--text)]">
            Menunggu Usulan Kontributor Pertama
          </h2>
          <p className="mx-auto max-w-md text-xs leading-relaxed text-[var(--muted)]">
            Direktori ini hanya memuat kontributor terverifikasi yang usulannya telah diterima melalui kuorum kurasi ganda. Tidak ada atribusi fiktif atau nama yang dicantumkan tanpa persetujuan eksplisit.
          </p>
          <div className="pt-2">
            <Link
              href="/usulkan-bukti"
              className="inline-block rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 transition shadow"
            >
              Mulai Usulkan Bukti Pertama &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contributors.map((c) => (
            <div
              key={c.id}
              className="flex items-start gap-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5 hover:border-slate-500 transition shadow-2xs"
            >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.nama}
                  className="size-12 rounded-xl object-cover border border-[var(--line)] shrink-0"
                />
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-sm font-bold text-[var(--acc-red)] border border-red-500/30">
                  {c.nama.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)] truncate">
                    {c.nama}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold border shrink-0 ${
                      c.role === "ADMIN"
                        ? "bg-red-500/15 text-[var(--acc-red-strong)] border-red-500/30"
                        : c.role === "KURATOR"
                        ? "bg-amber-500/15 text-[var(--acc-amber-strong)] border-amber-500/30"
                        : "bg-emerald-500/15 text-[var(--acc-emerald-strong)] border-emerald-500/30"
                    }`}
                  >
                    {c.role}
                  </span>
                </div>

                <div className="text-xs text-[var(--acc-red)] font-medium">
                  {c.jabatan}
                </div>

                <div className="text-xs text-[var(--muted)] flex items-center gap-1">
                  <IconInstitution size={12} />
                  <span className="truncate">{c.afiliasi}</span>
                </div>

                <div className="pt-2 text-[11px] text-[var(--muted)] border-t border-[var(--line)] mt-2">
                  <span className="font-semibold text-[var(--text)]">Funding:</span>{" "}
                  <span className="truncate">{c.funding}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-[var(--muted)]">
        Ingin bergabung sebagai kontributor terverifikasi?{" "}
        <Link href="/usulkan-bukti" className="text-[var(--acc-sky)] hover:underline font-semibold">
          Ajukan usulan bukti hukum pertama Anda
        </Link>{" "}
        dan profil Anda akan tercatat dalam direktori publik setelah melewati proses kuorum telaah.
      </p>
    </div>
  );
}
