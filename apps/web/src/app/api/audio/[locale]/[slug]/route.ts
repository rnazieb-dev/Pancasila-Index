import { NextResponse, type NextRequest } from "next/server";
import { generateTTS, getCacheStats } from "@/lib/audio";
import { dataset } from "@pancasila-index/data";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Endpoint text-to-speech via OpenRouter (Fish Audio).
 *
 * URL: /api/audio/[locale]/[slug]
 * - locale: id | en | jv | su | mad | min
 * - slug: id peristiwa / lembaga / term / akar-sejarah
 *
 * Query params:
 * - type=event|term|institution|root -> tipe konten (default: event)
 *
 * Response: audio/mpeg binary stream.
 *
 * Cache: in-memory per proses server (Map di lib/audio.ts).
 * Selama 30 hari, audio di-cache; miss akan re-generate via OpenRouter.
 */

const SUPPORTED_LOCALES = new Set(["id", "en", "jv", "su", "mad", "min"]);

function audioNotConfigured() {
  return NextResponse.json(
    {
      error: "TTS belum di-setup.",
      detail:
        "Variabel lingkungan OPENROUTER_API_KEY belum diset. Buat API key di " +
        "https://openrouter.ai/settings/keys lalu tambahkan sebagai env var " +
        "OPENROUTER_API_KEY di Vercel (Production).",
    },
    { status: 503 }
  );
}

function audioBadRequest(reason: string) {
  return NextResponse.json(
    { error: "Permintaan tidak valid.", detail: reason },
    { status: 400 }
  );
}

function pickString(obj: unknown, key: string): string {
  if (!obj || typeof obj !== "object") return "";
  const v = (obj as Record<string, unknown>)[key];
  return typeof v === "string" ? v : "";
}

async function resolveText(
  slug: string,
  type: string,
  locale: string
): Promise<{ title: string; text: string } | null> {
  if (type === "event") {
    const ev = dataset.events.find((e) => e.id === slug);
    if (!ev) return null;
    const title = pickString(ev, `title_${locale}`) || pickString(ev, "title_id");
    const summary = pickString(ev, `summary_${locale}`) || pickString(ev, "summary_id");
    return { title, text: `${title}. ${summary}` };
  }

  if (type === "term") {
    const term = dataset.terms.find((t) => t.id === slug);
    if (!term) return null;
    const label = pickString(term, "label_id");
    return { title: label, text: label };
  }

  if (type === "institution") {
    const inst = dataset.institutions.find((i) => i.id === slug);
    if (!inst) return null;
    const name = pickString(inst, `name_${locale}`) || pickString(inst, "name_id");
    const desc = pickString(inst, `description_${locale}`) || pickString(inst, "description_id");
    return { title: name, text: `${name}. ${desc}` };
  }

  if (type === "root") {
    // Akar sejarah: fitur statis dalam dataset.events (tipe 'krisis' atau 'pengangkatan').
    // Untuk sekarang, fallback ke title_id/summary_id.
    const ev = dataset.events.find(
      (e) => e.id === slug || e.title_id?.toLowerCase().includes(slug)
    );
    if (!ev) return null;
    const title = pickString(ev, "title_id");
    const summary = pickString(ev, "summary_id");
    return { title, text: `${title}. ${summary}` };
  }

  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "event";

  if (!SUPPORTED_LOCALES.has(locale)) {
    return audioBadRequest(`Locale tidak didukung: ${locale}`);
  }

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`audio:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Mohon tunggu sebentar." },
      { status: 429 }
    );
  }

  const resolved = await resolveText(slug, type, locale);
  if (!resolved) {
    return audioBadRequest(
      `Konten tidak ditemukan: ${type}/${slug}`
    );
  }

  try {
    const tts = await generateTTS(resolved.text, locale);
    // Konversi Uint8Array ke ArrayBuffer (BodyInit compatible).
    const body = tts.audio.buffer.slice(
      tts.audio.byteOffset,
      tts.audio.byteOffset + tts.audio.byteLength
    ) as ArrayBuffer;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": tts.mimeType,
        "Content-Disposition": `inline; filename="${slug}.mp3"`,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Audio-Model": tts.model,
        "X-Audio-Cache": tts.cached ? "HIT" : "MISS",
        "X-Audio-Bytes": String(tts.audio.byteLength),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("OPENROUTER_API_KEY")) {
      return audioNotConfigured();
    }
    console.error("[/api/audio]", err);
    return NextResponse.json(
      {
        error: "Gagal menghasilkan audio.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint health-check (HEAD/GET /api/audio/stats) — diagnostik cache.
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "X-Audio-Cache-Size": String(getCacheStats().size) },
  });
}
