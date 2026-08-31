import katex from "katex";

/**
 * Render notasi matematika di waktu build (server component).
 *
 * Halaman metodologi di-prerender statis, sehingga KaTeX dijalankan saat build
 * dan hanya HTML hasilnya yang dikirim ke peramban — nol JavaScript klien.
 *
 * CSS KaTeX diimpor sekali di app/layout.tsx.
 */
export function Tex({
  children,
  block = false,
}: {
  children: string;
  block?: boolean;
}) {
  const html = katex.renderToString(children, {
    displayMode: block,
    throwOnError: false,
    output: "html",
    strict: false,
  });

  return block ? (
    <div
      className="overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}
