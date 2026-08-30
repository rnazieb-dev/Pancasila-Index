import fs from 'fs';

const path = 'apps/web/src/app/akar-sejarah/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const banner = `
      {/* Banner Khazanah Arsip ANRI */}
      <div className="mt-8 p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="font-bold text-sm text-[var(--text)]">Jelajahi Khazanah Arsip Nasional Lengkap</div>
            <div className="text-xs text-[var(--muted)]">Telusuri register naskah otentik ANRI, kawat telegram PDRI 1948, dan Risalah BPUPK di direktori dokumen primer.</div>
          </div>
        </div>
        <Link
          href="/arsip"
          className="px-4 py-2 rounded-xl bg-[var(--acc-sky)] text-slate-950 font-bold text-xs hover:bg-sky-400 transition shrink-0"
        >
          Buka Direktori Arsip ANRI &rarr;
        </Link>
      </div>
`;

content = content.replace(
  '{/* Timeline Stream */}',
  `${banner}\n      {/* Timeline Stream */}`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Akar sejarah page enhanced with ANRI directory banner!");
