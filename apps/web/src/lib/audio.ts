/**
 * Helper text-to-speech via OpenRouter (Fish Audio model).
 *
 * - Pakai suffix `:free` (fish-audio/s2.1-pro-free:free) agar otomatis stop
 *   setelah masa promo 30 hari (sampai 18 September 2026).
 * - Cache di memory (Map) — hilang antar cold start Vercel, tapi
 *   cukup untuk demo & mengurangi biaya selama 30 hari.
 * - Untuk produksi jangka panjang, migrasi ke Vercel KV / R2.
 *
 * Model:
 * - s2.1-pro-free: text-to-speech, low-latency streaming.
 * - s2-pro-free: text-to-speech, ~80 bahasa (untuk i18n selain id/en).
 * - s1-free: text-to-speech, emosional (untuk narasi).
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/audio/speech";

const DEFAULT_MODEL = "fish-audio/s2.1-pro-free:free";
const MODEL_BY_LOCALE: Record<string, string> = {
  id: "fish-audio/s2.1-pro-free:free",
  en: "fish-audio/s2.1-pro-free:free",
  jv: "fish-audio/s2-pro-free:free",
  su: "fish-audio/s2-pro-free:free",
  mad: "fish-audio/s2-pro-free:free",
  min: "fish-audio/s2-pro-free:free",
};

const MAX_TEXT_LENGTH = 1500;

interface CacheEntry {
  audio: Uint8Array;
  mimeType: string;
  createdAt: number;
}

const audioCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 hari

/**
 * Sanitasi teks untuk TTS: hapus markdown, line break berlebih, dan
 * karakter yang tidak bersuara. Hindari simbol yang dapat merusak
 * output audio.
 */
function sanitizeForTTS(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // hapus code block
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // link -> teks saja
    .replace(/[#*_~`]/g, "") // markdown
    .replace(/\n{3,}/g, "\n\n") // max 2 baris kosong
    .replace(/[ \t]+/g, " ") // spasi berlebih
    .trim();
}

function getCacheKey(text: string, locale: string): string {
  // Simple key — cache akan diisi per (text+locale).
  return `${locale}:${text.length}:${text.slice(0, 50)}:${text.slice(-50)}`;
}

export interface TTSResult {
  audio: Uint8Array;
  mimeType: string;
  cached: boolean;
  model: string;
}

/**
 * Hasilkan audio untuk teks via Fish Audio (lewat OpenRouter). Cache di
 * memory.
 *
 * response_format OpenRouter default ke `pcm`, bukan `mp3` — harus di-set
 * eksplisit agar sesuai `Content-Type: audio/mpeg` yang diasumsikan
 * downstream di route.ts.
 *
 * @param text Teks sumber (boleh markdown — akan disanitasi).
 * @param locale Kode locale (id/en/jv/su/mad/min).
 * @returns Audio buffer + metadata.
 * @throws Error bila OPENROUTER_API_KEY tidak diset, atau OpenRouter
 *   mengembalikan status non-200.
 */
export async function generateTTS(
  text: string,
  locale: string = "id"
): Promise<TTSResult> {
  const sanitized = sanitizeForTTS(text).slice(0, MAX_TEXT_LENGTH);
  if (!sanitized) {
    throw new Error("Teks kosong setelah sanitasi.");
  }

  const cacheKey = getCacheKey(sanitized, locale);
  const cached = audioCache.get(cacheKey);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return {
      audio: cached.audio,
      mimeType: cached.mimeType,
      cached: true,
      model: MODEL_BY_LOCALE[locale] ?? DEFAULT_MODEL,
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum diset.");
  }

  const modelId = MODEL_BY_LOCALE[locale] ?? DEFAULT_MODEL;

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://www.pancasila.site",
      "X-Title": "Pancasila Index",
    },
    body: JSON.stringify({
      model: modelId,
      input: sanitized,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `OpenRouter TTS gagal (${response.status}): ${detail.slice(0, 500)}`
    );
  }

  const audioData = new Uint8Array(await response.arrayBuffer());
  const mimeType = response.headers.get("content-type") ?? "audio/mpeg";

  audioCache.set(cacheKey, {
    audio: audioData,
    mimeType,
    createdAt: Date.now(),
  });

  return {
    audio: audioData,
    mimeType,
    cached: false,
    model: modelId,
  };
}

/**
 * Statistik cache (untuk endpoint /api/audio/stats).
 */
export function getCacheStats() {
  return {
    size: audioCache.size,
    ttlMs: CACHE_TTL_MS,
  };
}

/**
 * Hapus cache (untuk testing/admin).
 */
export function clearCache() {
  audioCache.clear();
}
