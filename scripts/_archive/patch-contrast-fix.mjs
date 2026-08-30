import fs from 'fs';

// 1. Fix akar-sejarah
const akarPath = 'apps/web/src/app/akar-sejarah/page.tsx';
let akar = fs.readFileSync(akarPath, 'utf8');

// Fix category button active state
akar = akar.replace(
  'bg-[var(--acc-emerald)] text-slate-950 shadow-sm',
  'bg-emerald-600 dark:bg-emerald-600 text-white font-bold shadow-md ring-1 ring-emerald-400'
);

// Fix banner button
akar = akar.replace(
  'bg-[var(--acc-sky)] text-slate-950 font-bold text-xs hover:bg-sky-400 transition shrink-0',
  'bg-sky-600 dark:bg-sky-600 text-white font-bold text-xs hover:bg-sky-500 transition shrink-0 shadow-sm'
);

// Fix Year Badge Circle (high contrast white on solid emerald)
akar = akar.replace(
  'border-2 border-[var(--bg)] bg-[var(--acc-emerald)] text-slate-950 shrink-0 font-extrabold text-[10px] sm:text-xs z-10 shadow-md',
  'border-2 border-[var(--bg)] bg-emerald-600 dark:bg-emerald-600 text-white shrink-0 font-extrabold text-[10px] sm:text-xs z-10 shadow-md ring-2 ring-emerald-400/40'
);

fs.writeFileSync(akarPath, akar, 'utf8');

// 2. Fix arsip page
const arsipPath = 'apps/web/src/app/arsip/page.tsx';
let arsip = fs.readFileSync(arsipPath, 'utf8');

arsip = arsip.replace(
  'bg-[var(--acc-sky)] text-slate-950 shadow-sm',
  'bg-sky-600 dark:bg-sky-600 text-white font-bold shadow-md ring-1 ring-sky-400'
);

fs.writeFileSync(arsipPath, arsip, 'utf8');

console.log("High contrast white text on emerald green and sky blue buttons applied successfully!");
