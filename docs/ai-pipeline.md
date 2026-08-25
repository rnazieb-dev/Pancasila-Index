# Pipeline AI (prototipe)

Prinsip: **AI mengusulkan, manusia memutuskan.** Tidak ada keluaran pipeline
yang bisa menjadi `published` tanpa kurasi (`human_confirmed=true`).

## Alur

```
events.yaml ──▶ heuristic.ts (kata-kunci) ──▶ kerangka YAML draf
      │                                            ▲
      └──(opsional OPENAI_API_KEY)──▶ LLM usulkan skor + rasional
                                                   │
                                    kurator edit & isi skor
                                                   │
                              assessments.yaml (status: draft)
                                                   │
                          /kurasi → review-state.json (approved)
                                                   │
                            build.mts menerapkan keputusan
```

## Pemakaian

```bash
# heuristik saja (offline, deterministik)
pnpm --filter @pancasila-index/ai suggest --term presiden-habibie

# dengan usulan skor LLM
OPENAI_API_KEY=sk-... pnpm --filter @pancasila-index/ai suggest --term presiden-jokowi-ii
```

Salin-tempel hasilnya ke `packages/data/data/assessments.yaml`, lengkapi
`rationale_id` dan bukti, lalu buka `/kurasi` untuk persetujuan.

## Kontrak

- Keluaran selalu `status: draft` dan `ai_suggested: true`.
- Mode LLM membatasi skor pada rentang skema (-2..+2) dan confidence ≤0,9.
- Penolakan kurator wajib beralasan; alasan tersimpan di jejak audit.

## Fase 6b — suggest v2 berbasis korpus (tahap 1, tanpa LLM berbayar)

```
raw/index.jsonl (metadata JDIH tervalidasi)
      │
      ▼
corpus.ts  — generator MURNI & deterministik:
      • sumber baru hanya utk instrumen yang belum bersumber
      • tanggal dari metadata resmi (ditetapkan > diundangkan > tahun)
      • dimensi via tabel kata-kunci KONSERVATIF ke 15 dimensi rubrik;
        amendemen mewarisi topik UU yang diubahnya (rantai, anti-siklus);
        tanpa kecocokan yakin → DILEWATI, bukan ditebak
      │
      ▼
import.mts — validasi ketat: skema core + term_id + source_ids +
      dimension_ids dibaca LANGSUNG dari rubricSchema (bukan daftar
      hardcoded yang bisa telat)
      │
      ▼
events.yaml / sources.yaml  ──▶ build:data ──▶ antrean kurasi fase 5b
```

Status tahap ini: +8 peristiwa & +8 sumber primer (161 total). Target
fase (+250 terverifikasi) masih jauh; kelanjutannya berupa batch-batch
bertema (per era × per dimensi) yang tiap itemnya wajib punya metadata
primer setara JDIH atau rujukan web yang diverifikasi.

## Evaluasi orkestrasi LangGraph + Mastra (usulan klien)

Klien mengusulkan arsitektur: **LangGraph.js sebagai master engine**
(state global, sesi percakapan, human-in-the-loop, time travel) yang
**memanggil Mastra sebagai sub-agent tool** untuk RAG cepat atas
knowledge base dan workflow lokal.

Penilaian teknis terhadap kondisi repo saat ini:

| Aspek | LangGraph+Mastra | Kondisi sekarang |
|---|---|---|
| Human-in-the-loop | fitur inti framework | sudah ada sebagai kurasi 2-reviewer (fase 5b) |
| State/sesi | graph state persisten | batch stateless + YAML kanonik |
| RAG | Mastra KB siap pakai | corpus.ts deterministik + index.jsonl |
| Biaya/kompleksitas | 2 dep besar + runtime LLM | 0 dependensi runtime baru |
| Reproduksibilitas | bergantung model | deterministik penuh |

Keputusan (mengikuti aturan arsitektur terkunci "AI mengusulkan, manusia
memutuskan" + kejujuran cakupan): **evaluasi lanjut, adopsi bertahap,
tidak menjadi prasyarat.** Pemicu adopt: (a) kebutuhan percakapan multi-
turn pada antarmuka kurasi, atau (b) RAG lintas-PDF yang benar-benar
diperlukan untuk menembus +250 peristiwa — titik yang tidak bisa dicapai
generator deterministik semata. Bila diadopsi: LangGraph memegang state
sesi kurasi; Mastra sub-agent menjalankan retrieval korpus `data/raw/`
dan workflow import; keduaanya TIDAK boleh menulis langsung ke YAML —
tetap lewat `import.mts` + kuorum reviewer.
