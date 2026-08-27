/**
 * In-memory sliding window rate limiter untuk rute API publik.
 * Membatasi frekuensi request per IP/kunci agar layanan stabil dan terlindungi dari abuse.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitRecord>();

// Bersihkan cache lama berkala
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (v.resetTime < now) cache.delete(k);
    }
  }, 120_000);
}

export function checkRateLimit(
  key: string,
  limit = 120,
  windowMs = 60_000
): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = cache.get(key);

  if (!record || record.resetTime < now) {
    cache.set(key, { count: 1, resetTime: now + windowMs });
    return { ok: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (record.count >= limit) {
    return { ok: false, remaining: 0, reset: record.resetTime };
  }

  record.count += 1;
  return { ok: true, remaining: limit - record.count, reset: record.resetTime };
}
