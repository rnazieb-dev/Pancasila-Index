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

/**
 * Dua cara mengotentikasi diri sengaja didukung berdampingan:
 *
 * - "app": token instalasi diterbitkan sendiri dari App ID + kunci privat,
 *   berlaku ~1 jam dan diperbarui otomatis. Ini jalur yang dipakai produksi -
 *   tidak ada token statis yang bisa kedaluwarsa diam-diam atau perlu diputar
 *   manual tiap jam.
 * - "token": token statis (mis. classic PAT) lewat GITHUB_PR_TOKEN, disimpan
 *   untuk pengujian cepat sebelum GitHub App dipasang. TIDAK disarankan untuk
 *   produksi: token begini biasanya melekat pada satu akun pribadi, bukan
 *   pada instalasi yang scoped ke repo tunggal.
 */
export type GithubConfig =
  | { mode: "app"; repo: string; baseBranch: string; appId: string; privateKey: string; installationId: string }
  | { mode: "token"; repo: string; baseBranch: string; token: string };

/** Konfigurasi aktif, atau null bila integrasi belum dipasang. */
export function githubConfig(): GithubConfig | null {
  const repo = process.env.GITHUB_CANONICAL_REPO;
  if (!repo || !/^[\w.-]+\/[\w.-]+$/.test(repo)) return null;
  const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";

  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  // Kunci privat GitHub App berbentuk PEM multi-baris; di banyak dashboard
  // env var (termasuk Vercel bila ditempel sebagai satu baris) baris barunya
  // ter-escape jadi literal "\n". Keduanya diterima.
  const privateKeyRaw = process.env.GITHUB_APP_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.includes("\\n")
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : privateKeyRaw;

  if (appId && installationId && privateKey) {
    return { mode: "app", repo, baseBranch, appId, privateKey, installationId };
  }

  const token = process.env.GITHUB_PR_TOKEN;
  if (token) return { mode: "token", repo, baseBranch, token };

  return null;
}

// ---- Otentikasi GitHub App: JWT App -> token instalasi ----

/**
 * Cache token instalasi per proses. Instans serverless yang "hangat" akan
 * memakai ulang token yang sama sampai mendekati kedaluwarsa, alih-alih
 * meminta token baru di setiap panggilan API dalam satu permintaan.
 * Kosong lagi tiap cold start - itu sengaja, token tidak pernah dipersist.
 */
let cachedInstallationToken: { token: string; expiresAtMs: number } | null = null;

function base64url(input: Buffer | string): string {
  return (typeof input === "string" ? Buffer.from(input) : input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** JWT App (RS256), berumur pendek - dipakai HANYA untuk menukar token instalasi. */
async function buatAppJwt(appId: string, privateKey: string): Promise<string> {
  const { createSign } = await import("node:crypto");
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iat: now - 60, // toleransi jam server tidak sinkron
      exp: now + 9 * 60, // maksimum GitHub adalah 10 menit
      iss: appId,
    }),
  );
  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  return `${signingInput}.${signature}`;
}

/** Menukar JWT App dengan token instalasi berumur ~1 jam, scoped ke repo terpasang. */
async function tokenInstalasi(cfg: Extract<GithubConfig, { mode: "app" }>): Promise<string> {
  if (cachedInstallationToken && cachedInstallationToken.expiresAtMs - Date.now() > 60_000) {
    return cachedInstallationToken.token;
  }

  const jwt = await buatAppJwt(cfg.appId, cfg.privateKey);
  const res = await fetch(`${API}/app/installations/${cfg.installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Gagal menerbitkan token instalasi GitHub App (${res.status}): ${detail.slice(0, 300)}. ` +
        `Periksa GITHUB_APP_ID, GITHUB_APP_INSTALLATION_ID, dan GITHUB_APP_PRIVATE_KEY.`,
    );
  }
  const data = (await res.json()) as { token: string; expires_at: string };
  cachedInstallationToken = {
    token: data.token,
    expiresAtMs: new Date(data.expires_at).getTime(),
  };
  return data.token;
}

async function tokenAktif(cfg: GithubConfig): Promise<string> {
  return cfg.mode === "app" ? tokenInstalasi(cfg) : cfg.token;
}

async function gh<T>(
  cfg: GithubConfig,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await tokenAktif(cfg);
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
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
