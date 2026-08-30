import fs from 'fs';

const path = 'apps/web/src/app/metodologi/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const linkStr = `<p className="text-sm text-[var(--muted)] mt-4 leading-relaxed">
          Oleh karena itu, rubrik penilaian platform ini dirancang khusus untuk mengapresiasi institusi yang menjaga <strong>harmoni simbiotik agama dan negara</strong> serta menjunjung tinggi etika <strong>hikmat kebijaksanaan</strong>, sembari memberikan penalti bagi kebijakan yang secara sadar mengaburkan atau menghapus sejarah umat Islam dari memori kolektif bangsa.
        </p>
        <div className="mt-5">
          <a href="/akar-sejarah" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity">
            Lihat Lini Masa Akar Sejarah &rarr;
          </a>
        </div>`;

content = content.replace(
  `<p className="text-sm text-[var(--muted)] mt-4 leading-relaxed">\n          Oleh karena itu, rubrik penilaian platform ini dirancang khusus untuk mengapresiasi institusi yang menjaga <strong>harmoni simbiotik agama dan negara</strong> serta menjunjung tinggi etika <strong>hikmat kebijaksanaan</strong>, sembari memberikan penalti bagi kebijakan yang secara sadar mengaburkan atau menghapus sejarah umat Islam dari memori kolektif bangsa.\n        </p>`,
  linkStr
);

fs.writeFileSync(path, content, 'utf8');
console.log("Link added!");
