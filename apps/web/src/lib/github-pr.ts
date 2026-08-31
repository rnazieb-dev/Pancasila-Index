import { appendSource, addEvidence, yamlDapatDiurai } from "@pancasila-index/data";
import type { UsulanRow } from "@/lib/usulan-store";
import { buildUsulanPatch } from "@/lib/usulan-patch";

/**
 * Membuka Pull Request otomatis dari usulan yang telah lolos kuorum kurator,
 * agar kontributor dan kurator tidak perlu memahami Git sama sekali.
 *
 * BATAS WEWENANG YANG SENGAJA DIPASANG:
 *
 * 1. Tidak pernah menulis ke cabang utama. Selalu cabang baru + Pull Request.
 * 2. Tidak dapat menggabungkan (merge). Perlindungan cabang di GitHub tetap
 *    mensyaratkan persetujuan manusia — jadi ada dua lapis: kuorum dua kurator
 *    di aplikasi, lalu telaah PR di repositori.
 * 3. Hanya bertindak atas usulan berstatus PUBLISHED (kuorum sudah terpenuhi).
 * 4. Membatalkan diri bila hasil suntingan tidak dapat diurai sebagai YAML.
 * 5. Nonaktif total bila kredensial tidak dipasang — dalam keadaan itu antarmuka
 *    kembali menampilkan patch untuk disalin manual.
 *
 * PR ini menambahkan SITASI BUKTI, bukan mengubah skor. Apakah bukti tersebut
 * menggeser skor dimensi tetap penilaian ahli, dan dikerjakan penelaah PR.
 */

const API = "https://api.github.com";

export interface GithubConfig {
  repo: string;
  token: string;
  baseBranch: string;
}

/** Konfigurasi aktif, atau null bila integrasi belum dipasang. */
export function githubConfig(): GithubConfig | null {
  const repo = process.env.GITHUB_CANONICAL_REPO;
  const token = process.env.GITHUB_PR_TOKEN;
  if (!repo || !token) return null;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  return { repo, token, baseBranch: process.env.GITHUB_BASE_BRANCH || "main" };
}

async function gh<T>(
  cfg: GithubConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status} pada ${path}: ${detail.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

async function bacaBerkas(cfg: GithubConfig, path: string, ref: string) {
  const data = await gh<{ content: string; sha: string }>(
    cfg,
    `/repos/${cfg.repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
  );
  return {
    text: Buffer.from(data.content, "base64").toString("utf8"),
    sha: data.sha,
  };
}

async function tulisBerkas(
  cfg: GithubConfig,
  path: string,
  text: string,
  sha: string,
  branch: string,
  message: string,
) {
  await gh(cfg, `/repos/${cfg.repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(text, "utf8").toString("base64"),
      sha,
      branch,
    }),
  });
}

export interface PrResult {
  url: string;
  branch: string;
  evidenceApplied: boolean;
  catatan: string[];
}

export async function bukaPullRequestUsulan(
  row: UsulanRow,
): Promise<PrResult> {
  const cfg = githubConfig();
  if (!cfg) throw new Error("Integrasi GitHub belum dipasang.");
  if (row.status !== "PUBLISHED") {
    throw new Error("Hanya usulan yang sudah lolos kuorum dapat dibuatkan PR.");
  }

  const patch = buildUsulanPatch(row, new Date(row.createdAt).getFullYear());
  const branch = `usulan/${row.publicId.toLowerCase()}`;
  const catatan: string[] = [];

  // Idempoten: jangan membuka PR kedua untuk usulan yang sama.
  const existing = await gh<{ html_url: string }[]>(
    cfg,
    `/repos/${cfg.repo}/pulls?state=all&head=${cfg.repo.split("/")[0]}:${branch}`,
  );
  if (existing.length > 0) {
    return {
      url: existing[0]!.html_url,
      branch,
      evidenceApplied: false,
      catatan: ["Pull request untuk usulan ini sudah pernah dibuka."],
    };
  }

  const base = await gh<{ object: { sha: string } }>(
    cfg,
    `/repos/${cfg.repo}/git/ref/heads/${cfg.baseBranch}`,
  );
  await gh(cfg, `/repos/${cfg.repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }),
  });

  // ---- sources.yaml ----
  const sourcesPath = "packages/data/data/sources.yaml";
  const sumber = await bacaBerkas(cfg, sourcesPath, branch);
  const hasilSumber = appendSource(sumber.text, patch.sourcesYaml);
  if (!hasilSumber.applied) {
    catatan.push(`sources.yaml tidak diubah: ${hasilSumber.reason}`);
  } else {
    if (!yamlDapatDiurai(hasilSumber.text)) {
      throw new Error("Hasil suntingan sources.yaml tidak dapat diurai; PR dibatalkan.");
    }
    await tulisBerkas(
      cfg, sourcesPath, hasilSumber.text, sumber.sha, branch,
      `data(sumber): tambah ${patch.sourceId} dari usulan ${row.publicId}`,
    );
  }

  // ---- assessments.yaml ----
  const asmPath = "packages/data/data/assessments.yaml";
  const asm = await bacaBerkas(cfg, asmPath, branch);
  const hasilAsm = addEvidence(asm.text, row.termId, row.dimensionId, patch.sourceId);
  if (!hasilAsm.applied) {
    // Bukan kegagalan fatal: PR tetap dibuka dengan sumbernya saja, dan
    // kekurangannya dinyatakan terus terang di badan PR agar penelaah tahu
    // persis apa yang masih harus dikerjakan tangan.
    catatan.push(`Sitasi belum disisipkan otomatis: ${hasilAsm.reason}`);
  } else {
    if (!yamlDapatDiurai(hasilAsm.text)) {
      throw new Error("Hasil suntingan assessments.yaml tidak dapat diurai; PR dibatalkan.");
    }
    await tulisBerkas(
      cfg, asmPath, hasilAsm.text, asm.sha, branch,
      `data(asesmen): sitasi ${patch.sourceId} pada ${row.termId}/${row.dimensionId}`,
    );
  }

  const body = [
    `Dibuka otomatis dari usulan **${row.publicId}** yang telah lolos kuorum dua kurator.`,
    "",
    "| | |",
    "|---|---|",
    `| Pengusul | ${row.nama}${row.afiliasi ? ` (${row.afiliasi})` : ""} |`,
    `| Pendanaan | ${row.funding || "tidak dinyatakan"} |`,
    `| Lembaga | \`${row.institutionId}\` |`,
    `| Masa jabatan | \`${row.termId}\` |`,
    `| Dimensi | \`${row.dimensionId}\` |`,
    `| Sumber | ${row.sourceUrl} |`,
    `| Kurator penelaah | ${row.reviewerNames.join(", ") || "—"} |`,
    "",
    "### Argumentasi pengusul",
    "",
    row.argumentasi,
    "",
    "### Yang HARUS dikerjakan penelaah",
    "",
    "PR ini hanya menambahkan **sitasi bukti**. Skor dimensi belum berubah.",
    "Nilailah apakah bukti ini menggeser `score`, `confidence`, dan `rationale_id`",
    "pada dimensi tersebut, lalu sesuaikan dalam PR ini juga.",
    ...(catatan.length ? ["", "### Perlu perhatian", "", ...catatan.map((c) => `- ${c}`)] : []),
  ].join("\n");

  const pr = await gh<{ html_url: string }>(cfg, `/repos/${cfg.repo}/pulls`, {
    method: "POST",
    body: JSON.stringify({
      title: `data: sitasi ${patch.sourceId} untuk ${row.termId}/${row.dimensionId} (${row.publicId})`,
      head: branch,
      base: cfg.baseBranch,
      body,
      maintainer_can_modify: true,
    }),
  });

  return { url: pr.html_url, branch, evidenceApplied: hasilAsm.applied, catatan };
}
