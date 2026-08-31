import { redirect } from "next/navigation";

/**
 * Formulir usulan bukti kini tunggal, di /usulkan-bukti.
 *
 * Dulu ada dua formulir berdampingan dengan skema field berbeda yang menulis
 * ke API yang sama: /usulkan-bukti (satu halaman, penamaan camelCase) dan
 * /peer-review/usulan (wizard tiga langkah, penamaan snake_case). Keduanya
 * saling menaut, dan keduanya gagal 422 dengan sebab yang berbeda.
 *
 * Yang dipertahankan adalah wizard ini — ia memiliki langkah deklarasi,
 * pakta integritas, dan penyimpanan draf. Ia dipindahkan ke /usulkan-bukti
 * karena itulah URL publik yang ditaut menu utama, beranda, footer, halaman
 * metodologi, dan direktori kontributor.
 *
 * Rute ini disisakan sebagai pengalihan agar tautan lama tidak mati.
 */
export default async function UsulanRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value) && value[0]) query.set(key, value[0]);
  }
  const qs = query.toString();
  redirect(qs ? `/usulkan-bukti?${qs}` : "/usulkan-bukti");
}
