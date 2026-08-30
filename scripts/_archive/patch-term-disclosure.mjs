import fs from 'fs';

const path = 'apps/web/src/app/lembaga/[slug]/[term]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldCard = `<div className="flex justify-between items-center text-[11px] text-[var(--muted)] pt-1">
                  <span>Kontributor: <strong>{item.contributor?.name || "Kontributor Terdaftar"}</strong></span>
                  <span className="font-mono text-[10px]">Dimensi: {item.relevantDimension}</span>
                </div>`;

const newCard = `<div className="space-y-1.5 pt-1 border-t border-[var(--line)]/50">
                  <div className="flex flex-wrap justify-between items-center text-[11px] text-[var(--muted)]">
                    <div>
                      <span>Penelaah Utama: </span>
                      <strong className="text-[var(--text)]">{item.contributor?.name || "Kontributor Terverifikasi"}</strong>
                      {item.contributor?.title && <span className="ml-1 text-[10px]">({item.contributor.title})</span>}
                      {item.contributor?.affiliation && (
                        <span className="ml-1 text-[10px] text-[var(--muted)]">· {item.contributor.affiliation}</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] bg-[var(--line)]/50 px-1.5 py-0.5 rounded">Dimensi: {item.relevantDimension}</span>
                  </div>

                  {item.contributor?.funding && (
                    <div className="text-[10px] text-[var(--muted)] italic">
                      Deklarasi Independensi: {item.contributor.funding}
                    </div>
                  )}

                  {item.approverNames && item.approverNames.length > 0 && (
                    <div className="text-[10px] text-[var(--muted)]">
                      Persetujuan Kuorum: <span className="text-[var(--acc-emerald)] font-medium">{item.approverNames.join(" & ")}</span>
                    </div>
                  )}
                </div>`;

content = content.replace(oldCard, newCard);

fs.writeFileSync(path, content, 'utf8');
console.log("Term page patched with contributor disclosure!");
