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
