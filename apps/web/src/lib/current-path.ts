import { headers } from "next/headers";

/**
 * Path lengkap permintaan saat ini (termasuk kueri), disalurkan middleware
 * lewat header `x-pathname`.
 *
 * Layout server tidak menerima pathname dari Next.js, sehingga gerbang
 * autentikasi sebelumnya memakai callbackUrl hardcoded. Akibatnya deep link
 * seperti /usulkan-bukti?dimensi=sila-2 kehilangan parameternya setelah
 * pengguna login, dan mendarat di formulir kosong.
 */
export async function currentPath(fallback: string): Promise<string> {
  const value = (await headers()).get("x-pathname");
  // Hanya terima path relatif, jangan pernah URL absolut — mencegah callbackUrl
  // dipakai sebagai pengalihan terbuka ke domain lain.
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}
