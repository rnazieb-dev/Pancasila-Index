import fs from 'fs';

const path = 'apps/web/src/app/metodologi/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const akarSejarah = `
      <div className="mt-8 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5">
        <h3 className="font-semibold text-lg text-[var(--text)]">Genealogi Konstitusi & Akar Pergerakan</h3>
        <p className="text-sm text-[var(--muted)] mt-3 leading-relaxed">
          Pancasila Index menolak de-historisasi. Kami meyakini bahwa Indonesia tidak lahir dari ruang hampa pada 17 Agustus 1945, melainkan berakar dari genealogi pergerakan kemerdekaan yang digerakkan oleh napas keagamaan dan kebangsaan.
        </p>
        <ul className="mt-4 space-y-3 text-sm text-[var(--muted)] list-disc pl-5 marker:text-[var(--text)]">
          <li className="leading-relaxed"><strong>Syarikat Dagang Islam (1905) & Syarikat Islam (1912):</strong> Titik nol kebangkitan kesadaran <em>Zelfbestuur</em> (Pemerintahan Sendiri) oleh H.O.S. Tjokroaminoto.</li>
          <li className="leading-relaxed"><strong>Fusi Nasionalis-Religius:</strong> Gagasan musyawarah mufakat, keadilan sosial, dan kedaulatan bukan sekadar saduran demokrasi liberal Barat, melainkan saripati tradisi nusantara dan nilai tauhid.</li>
          <li className="leading-relaxed"><strong>Piagam Jakarta (22 Juni 1945):</strong> Kompromi luhur yang, sebagaimana dikukuhkan dalam Dekrit Presiden 1959, menjiwai seluruh batang tubuh UUD 1945 dan menempatkan nilai Ketuhanan sebagai fondasi etika bernegara.</li>
        </ul>
        <p className="text-sm text-[var(--muted)] mt-4 leading-relaxed">
          Oleh karena itu, rubrik penilaian platform ini dirancang khusus untuk mengapresiasi institusi yang menjaga <strong>harmoni simbiotik agama dan negara</strong> serta menjunjung tinggi etika <strong>hikmat kebijaksanaan</strong>, sembari memberikan penalti bagi kebijakan yang secara sadar mengaburkan atau menghapus sejarah umat Islam dari memori kolektif bangsa.
        </p>
      </div>
`;

content = content.replace(
  `versi lengkap yang dapat diaudit secara mandiri hidup sebagai data di repositori terbuka.\n      </p>\n    </section>`,
  `versi lengkap yang dapat diaudit secara mandiri hidup sebagai data di repositori terbuka.\n      </p>\n${akarSejarah}    </section>`
);

fs.writeFileSync(path, content, 'utf8');
console.log("Methodology updated!");
