import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import type { UsulanRow } from "@/lib/usulan-store";

/**
 * Uji lapisan otentikasi GitHub App di lib/github-pr.ts.
 *
 * Token instalasi diterbitkan sendiri dari App ID + kunci privat (JWT RS256
 * yang ditukar ke /app/installations/{id}/access_tokens), bukan token statis
 * yang harus diputar manual tiap ~1 jam. Fetch dipalsukan sepenuhnya di sini -
 * tidak ada panggilan sungguhan ke GitHub - sehingga menguji murni logika
 * pembuatan JWT, pertukaran token, dan caching-nya.
 */

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const PEM = privateKey.export({ type: "pkcs1", format: "pem" }) as string;

const baseEnv = {
  GITHUB_CANONICAL_REPO: "pemilik-uji/repo-uji",
  GITHUB_BASE_BRANCH: "main",
  GITHUB_APP_ID: "123456",
  GITHUB_APP_INSTALLATION_ID: "789",
  GITHUB_APP_PRIVATE_KEY: PEM,
};

const usulan: UsulanRow = {
  id: "id-1",
  publicId: "PR-2026-01",
  institutionId: "presiden-ri",
  termId: "presiden-habibie",
  dimensionId: "sila-2",
  sourceType: "putusan-mk",
  sourceTitle: "Putusan Uji",
  sourceUrl: "https://mkri.id/uji",
  argumentasi: "argumentasi uji",
  nama: "Penguji",
  afiliasi: "Universitas Uji",
  funding: "Mandiri",
  pakta: true,
  status: "PUBLISHED",
  reviewerNames: ["Kurator A", "Kurator B"],
  reviewerIds: ["u1", "u2"],
  reviewNote: null,
  authorId: null,
  authorIdent: "uji",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

/** Payload contents API: base64 dari YAML minimal yang valid. */
function berkasContents(yaml: string, sha: string) {
  return { content: Buffer.from(yaml, "utf8").toString("base64"), sha };
}

const SOURCES_YAML = "- id: sumber-lain\n  type: berita\n  title_id: X\n  year: 2020\n  citation_id: X\n  url: https://x\n";
const ASSESSMENTS_YAML =
  "- id: asm-1\n  term_id: presiden-habibie\n  dimension_scores:\n" +
  "    - dimension_id: sila-2\n      score: 0\n      confidence: 0.5\n      evidence:\n        - source_id: lama\n";

let panggilanAccessToken: number;
let headerTerakhir: Record<string, string>[];

function pasangFetchTiruan(opts?: { expiresInMs?: number }) {
  panggilanAccessToken = 0;
  headerTerakhir = [];
  const expiresAt = new Date(Date.now() + (opts?.expiresInMs ?? 3600_000)).toISOString();

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const headers = Object.fromEntries(new Headers(init?.headers).entries());
      headerTerakhir.push(headers);

      const json = (body: unknown, ok = true, status = 200) => ({
        ok,
        status,
        json: async () => body,
        text: async () => JSON.stringify(body),
      });

      if (url.includes("/access_tokens")) {
        panggilanAccessToken++;
        return json({ token: `ghs_token_${panggilanAccessToken}`, expires_at: expiresAt });
      }
      if (url.includes("/pulls?state=all")) return json([]);
      if (url.includes("/git/ref/heads/")) return json({ object: { sha: "sha-base" } });
      if (url.includes("/git/refs") && init?.method === "POST") return json({});
      if (url.includes("/contents/packages/data/data/sources.yaml"))
        return json(berkasContents(SOURCES_YAML, "sha-sources"));
      if (url.includes("/contents/packages/data/data/assessments.yaml"))
        return json(berkasContents(ASSESSMENTS_YAML, "sha-assessments"));
      if (url.includes("/contents/") && init?.method === "PUT") return json({});
      if (url.endsWith("/pulls") && init?.method === "POST")
        return json({ html_url: "https://github.com/pemilik-uji/repo-uji/pull/1" });

      throw new Error(`URL tidak diharapkan dalam uji: ${url}`);
    }),
  );
}

describe("otentikasi GitHub App (github-pr.ts)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    for (const [k, v] of Object.entries(baseEnv)) vi.stubEnv(k, v);
    delete process.env.GITHUB_PR_TOKEN;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("githubConfig memilih mode app ketika ketiga variabel App terisi", async () => {
    const { githubConfig } = await import("@/lib/github-pr");
    const cfg = githubConfig();
    expect(cfg?.mode).toBe("app");
  });

  it("jatuh ke mode token statis ketika variabel App tidak lengkap", async () => {
    vi.stubEnv("GITHUB_APP_ID", "");
    vi.stubEnv("GITHUB_PR_TOKEN", "ghp_statis");
    const { githubConfig } = await import("@/lib/github-pr");
    const cfg = githubConfig();
    expect(cfg).toEqual({
      mode: "token",
      repo: "pemilik-uji/repo-uji",
      baseBranch: "main",
      token: "ghp_statis",
    });
  });

  it("null ketika tidak ada kredensial apa pun", async () => {
    vi.stubEnv("GITHUB_APP_ID", "");
    const { githubConfig } = await import("@/lib/github-pr");
    expect(githubConfig()).toBeNull();
  });

  it("null ketika format repo tidak valid", async () => {
    vi.stubEnv("GITHUB_CANONICAL_REPO", "bukan-repo-yang-valid");
    const { githubConfig } = await import("@/lib/github-pr");
    expect(githubConfig()).toBeNull();
  });

  it("menerima kunci privat dengan \\n literal (format env var satu baris)", async () => {
    vi.stubEnv("GITHUB_APP_PRIVATE_KEY", PEM.replace(/\n/g, "\\n"));
    pasangFetchTiruan();
    const { bukaPullRequestUsulan } = await import("@/lib/github-pr");
    const hasil = await bukaPullRequestUsulan(usulan);
    expect(hasil.url).toContain("pull/1");
  });

  it("menukar JWT App ke token instalasi dan memakainya sebagai Bearer di setiap panggilan API", async () => {
    pasangFetchTiruan();
    const { bukaPullRequestUsulan } = await import("@/lib/github-pr");
    await bukaPullRequestUsulan(usulan);

    // Hanya SATU pertukaran token untuk seluruh alur PR (8 panggilan API lain
    // memakai ulang token yang sama) - inilah manfaat caching-nya.
    expect(panggilanAccessToken).toBe(1);

    const panggilanApiGithub = headerTerakhir.filter(
      (h) => h.authorization && !h.authorization.startsWith("Bearer eyJ"),
    );
    expect(panggilanApiGithub.length).toBeGreaterThan(0);
    for (const h of panggilanApiGithub) {
      expect(h.authorization).toBe("Bearer ghs_token_1");
    }
  });

  it("JWT App yang dikirim ke endpoint access_tokens ditandatangani RS256 secara sah", async () => {
    pasangFetchTiruan();
    const { bukaPullRequestUsulan } = await import("@/lib/github-pr");
    await bukaPullRequestUsulan(usulan);

    const headerJwt = headerTerakhir.find((h) => h.authorization?.startsWith("Bearer ey"));
    const authHeader = headerJwt?.authorization;
    if (!authHeader) throw new Error("tidak ada permintaan berisi JWT App di header Authorization");
    const jwt = authHeader.replace("Bearer ", "");
    const [h, p, s] = jwt.split(".");
    if (!h || !p || !s) throw new Error(`JWT tidak berbentuk header.payload.signature: ${jwt}`);

    const { createVerify, createPublicKey } = await import("node:crypto");
    const publicKey = createPublicKey({ key: PEM, format: "pem", type: "pkcs1" });
    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${h}.${p}`);
    verifier.end();
    const sig = Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
    expect(verifier.verify(publicKey, sig)).toBe(true);

    const payload = JSON.parse(
      Buffer.from(p.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(),
    );
    expect(payload.iss).toBe("123456");
    expect(payload.exp - payload.iat).toBeLessThanOrEqual(600);
  });

  it("meminta token instalasi baru setelah yang lama kedaluwarsa", async () => {
    pasangFetchTiruan({ expiresInMs: -1000 }); // langsung kedaluwarsa
    const { bukaPullRequestUsulan } = await import("@/lib/github-pr");

    await bukaPullRequestUsulan({ ...usulan, publicId: "PR-2026-02" });
    const setelahPertama = panggilanAccessToken;
    await bukaPullRequestUsulan({ ...usulan, publicId: "PR-2026-03" });

    expect(panggilanAccessToken).toBeGreaterThan(setelahPertama);
  });

  it("membatalkan diri dengan pesan jelas ketika instalasi ditolak GitHub", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/access_tokens")) {
          return { ok: false, status: 401, text: async () => "Bad credentials" };
        }
        throw new Error("tidak boleh sampai sini");
      }),
    );
    const { bukaPullRequestUsulan } = await import("@/lib/github-pr");
    await expect(bukaPullRequestUsulan(usulan)).rejects.toThrow(/token instalasi/i);
  });
});
