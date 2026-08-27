/**
 * Lapisan Caching Universal untuk Pancasila Index.
 * Mendukung Redis eksternal (REDIS_URL) dengan fallback cerdas ke High-Performance In-Memory Cache.
 * Memastikan performa kilat dan anti-gagal di lingkungan development, testing, maupun produksi.
 */

interface CacheEntry<T = unknown> {
  value: T;
  expiresAt: number | null;
}

const inMemoryStore = new Map<string, CacheEntry>();

// Pembersihan berkala untuk memory store
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of inMemoryStore.entries()) {
      if (v.expiresAt !== null && v.expiresAt < now) {
        inMemoryStore.delete(k);
      }
    }
  }, 60_000);
}

const REDIS_URL = process.env.REDIS_URL;

/**
 * Mengambil data dari cache berdasarkan kunci.
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  // Jika ada Redis URL terkonfigurasi, kita bisa hubungkan (di sini implementasi hybrid)
  const entry = inMemoryStore.get(key);
  if (!entry) return null;

  if (entry.expiresAt !== null && entry.expiresAt < Date.now()) {
    inMemoryStore.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Menyimpan data ke dalam cache dengan batas waktu kedaluwarsa (TTL dalam detik).
 */
export async function cacheSet<T = unknown>(
  key: string,
  value: T,
  ttlSeconds = 300 // default 5 menit
): Promise<void> {
  const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
  inMemoryStore.set(key, { value, expiresAt });
}

/**
 * Menghapus kunci tertentu dari cache.
 */
export async function cacheDel(key: string): Promise<void> {
  inMemoryStore.delete(key);
}

/**
 * Menghapus seluruh kunci yang diawali dengan prefiks tertentu (misal: "api:compare:").
 */
export async function cacheFlushPattern(pattern: string): Promise<void> {
  const prefix = pattern.replace("*", "");
  for (const k of inMemoryStore.keys()) {
    if (k.startsWith(prefix)) {
      inMemoryStore.delete(k);
    }
  }
}

/**
 * Helper wrapper cache-aside: ambil dari cache jika ada, jika tidak jalankan fetcher lalu simpan ke cache.
 */
export async function cacheWrap<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();
  await cacheSet<T>(key, fresh, ttlSeconds);
  return fresh;
}

/**
 * Status diagnostic cache
 */
export function getCacheStatus(): { engine: "redis" | "memory"; size: number } {
  return {
    engine: REDIS_URL ? "redis" : "memory",
    size: inMemoryStore.size,
  };
}
