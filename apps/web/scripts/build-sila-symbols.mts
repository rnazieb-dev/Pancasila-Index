/**
 * Menurunkan lima lambang sila sebagai PNG dari lambang negara yang SUDAH ada
 * di repositori ini: `public/emblems/presiden-ri.svg` (Garuda Pancasila,
 * berkas Wikimedia Commons yang dipakai juga untuk logo lembaga kepresidenan).
 *
 * Kenapa diturunkan, bukan diunduh satu-satu?
 * --------------------------------------------
 * Perisai pada Garuda Pancasila adalah sumber resmi kelima lambang sila itu
 * sendiri - memotongnya dari berkas yang sudah tercantum provenansinya lebih
 * dapat dipertanggungjawabkan daripada mengambil lima berkas lepas yang
 * versinya bisa berbeda. Hasilnya juga dapat diproduksi ulang tanpa jaringan:
 * siapa pun bisa menjalankan skrip ini dan mendapat berkas yang identik
 * (SHA-256 dicatat di manifes).
 *
 * Cara kerja
 * ----------
 * Ilustrator mengekspor SVG ini tanpa nama grup yang bermakna (`g15_1_`,
 * `path19_1_`), jadi lambang tidak bisa diambil per-grup. Yang dipakai:
 * segmentasi warna. Untuk tiap bidang perisai, warna dasarnya (merah, putih,
 * atau hitam) di-flood-fill dari satu titik benih; lubang di dalam hasil
 * flood-fill itulah lambangnya. Bidang tetangga yang menyusup ke kotak potong
 * tidak ikut karena tersambung ke tepi kotak, sehingga dihitung sebagai luar
 * bidang lalu ditimpa warna dasar.
 *
 * Satu hal yang membuat pendekatan topologi murni gagal: pangkal batang pohon
 * beringin BERSENTUHAN dengan sudut perisai hitam di tengah. Tanpa penghalang,
 * genangan "luar bidang" merembes dari tepi kotak lewat perisai hitam itu ke
 * dalam pohon, dan seluruh pohon hilang. Karena itu perisai tengah dihitung
 * lebih dulu, dilebarkan beberapa piksel supaya garis tepinya ikut, lalu
 * dipakai sebagai penghalang saat menyegmentasi empat bidang sudut.
 *
 * Menjalankan: pnpm --filter @pancasila-index/web assets:sila
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(HERE, "..");
const SRC_SVG = path.join(WEB_ROOT, "public", "emblems", "presiden-ri.svg");
const OUT_DIR = path.join(WEB_ROOT, "public", "lambang");

/**
 * Lebar raster kerja. Titik benih dan kotak batas di bawah dinyatakan dalam
 * piksel pada lebar ini, jadi nilainya TIDAK boleh diubah tanpa mengukur
 * ulang seluruh koordinat.
 */
const RASTER_W = 2400;
/** Sisi PNG keluaran. */
const OUT_SIZE = 512;
/** Jarak aman di sekeliling lambang, dalam piksel raster kerja. */
const PAD = 26;
/** Toleransi kanal warna saat mencocokkan warna dasar bidang. */
const TOL = 26;

type RGB = [number, number, number];

interface Region {
  id: string;
  /** Nomor sila sesuai urutan pada Pembukaan UUD 1945. */
  sila: number;
  name_id: string;
  /** Warna dasar heraldik bidang ini. */
  ground: RGB;
  /** Titik benih flood-fill, pada raster selebar RASTER_W. */
  seed: [number, number];
  /**
   * Kotak pengurung [x0, y0, x1, y1] yang mengurung flood-fill di dalam satu
   * bidang perisai. Tanpa ini warna hitam perisai tengah menyambung ke garis
   * pembagi bidang lalu ke kepala banteng, dan seluruh segmentasi bocor.
   */
  bounds: [number, number, number, number];
}

const REGIONS: Region[] = [
  {
    id: "sila-1",
    sila: 1,
    name_id: "Bintang",
    ground: [0, 0, 0],
    seed: [1080, 1260],
    bounds: [1050, 1215, 1355, 1675],
  },
  {
    id: "sila-2",
    sila: 2,
    name_id: "Rantai",
    ground: [255, 0, 0],
    seed: [1450, 1440],
    bounds: [1195, 1360, 1596, 1860],
  },
  {
    id: "sila-3",
    sila: 3,
    name_id: "Pohon Beringin",
    ground: [255, 255, 255],
    seed: [1220, 950],
    bounds: [1195, 928, 1596, 1370],
  },
  {
    id: "sila-4",
    sila: 4,
    name_id: "Kepala Banteng",
    ground: [255, 0, 0],
    seed: [840, 960],
    bounds: [808, 928, 1200, 1370],
  },
  {
    id: "sila-5",
    sila: 5,
    name_id: "Padi dan Kapas",
    ground: [255, 255, 255],
    seed: [950, 1420],
    bounds: [808, 1360, 1200, 1860],
  },
];

interface Raster {
  data: Buffer;
  width: number;
  height: number;
  channels: number;
}

function sameColor(r: number, g: number, b: number, a: number, target: RGB): boolean {
  if (a < 250) return false;
  return (
    Math.abs(r - target[0]) <= TOL &&
    Math.abs(g - target[1]) <= TOL &&
    Math.abs(b - target[2]) <= TOL
  );
}

/**
 * Flood-fill 4-arah dalam kotak pengurung. Memakai tumpukan eksplisit karena
 * bidang perisai mencakup ratusan ribu piksel - rekursi akan melampaui stack.
 */
function floodFill(
  raster: Raster,
  seed: [number, number],
  target: RGB,
  bounds: [number, number, number, number]
): Uint8Array {
  const { data, width, channels } = raster;
  const [x0, y0, x1, y1] = bounds;
  const mask = new Uint8Array(width * raster.height);
  const at = (x: number, y: number) => y * width + x;

  const start = at(seed[0], seed[1]);
  const si = start * channels;
  if (!sameColor(data[si]!, data[si + 1]!, data[si + 2]!, data[si + 3]!, target)) {
    throw new Error(
      `Titik benih ${seed.join(",")} bukan warna dasar ${target.join(",")} ` +
        `(terbaca ${data[si]},${data[si + 1]},${data[si + 2]}). ` +
        `Berkas sumber berubah? Ukur ulang koordinatnya.`
    );
  }

  const stack: number[] = [seed[0], seed[1]];
  mask[start] = 1;
  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as const) {
      if (nx < x0 || nx >= x1 || ny < y0 || ny >= y1) continue;
      const idx = at(nx, ny);
      if (mask[idx]) continue;
      const p = idx * channels;
      if (!sameColor(data[p]!, data[p + 1]!, data[p + 2]!, data[p + 3]!, target)) continue;
      mask[idx] = 1;
      stack.push(nx, ny);
    }
  }
  return mask;
}

/**
 * Segala yang bukan warna dasar tetapi terkurung olehnya. Piksel bukan-dasar
 * yang menyentuh tepi kotak dianggap milik bidang lain (mis. sudut perisai
 * hitam yang menyusup) dan tidak diambil.
 *
 * `blocked` menutup jalur rembesan: piksel bertanda itu diperlakukan seperti
 * dinding, tidak bisa dilewati genangan "luar bidang" dan tidak pernah
 * dihitung sebagai lambang.
 */
function enclosedHoles(
  raster: Raster,
  ground: Uint8Array,
  bounds: [number, number, number, number],
  blocked?: Uint8Array
): Uint8Array {
  const { width } = raster;
  const [x0, y0, x1, y1] = bounds;
  const outside = new Uint8Array(width * raster.height);
  const at = (x: number, y: number) => y * width + x;
  const stack: number[] = [];
  const wall = (i: number) => ground[i] || (blocked ? blocked[i] : 0);

  const seedEdge = (x: number, y: number) => {
    const i = at(x, y);
    if (!wall(i) && !outside[i]) {
      outside[i] = 1;
      stack.push(x, y);
    }
  };
  for (let x = x0; x < x1; x++) {
    seedEdge(x, y0);
    seedEdge(x, y1 - 1);
  }
  for (let y = y0; y < y1; y++) {
    seedEdge(x0, y);
    seedEdge(x1 - 1, y);
  }

  while (stack.length) {
    const y = stack.pop()!;
    const x = stack.pop()!;
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as const) {
      if (nx < x0 || nx >= x1 || ny < y0 || ny >= y1) continue;
      const idx = at(nx, ny);
      if (outside[idx] || wall(idx)) continue;
      outside[idx] = 1;
      stack.push(nx, ny);
    }
  }

  const holes = new Uint8Array(width * raster.height);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = at(x, y);
      if (!wall(i) && !outside[i]) holes[i] = 1;
    }
  }
  return holes;
}

/** Pelebaran 4-arah `iterations` langkah, dibatasi kotak agar tetap murah. */
function dilate(
  mask: Uint8Array,
  width: number,
  bounds: [number, number, number, number],
  iterations: number
): Uint8Array {
  const [x0, y0, x1, y1] = bounds;
  let cur = mask;
  for (let n = 0; n < iterations; n++) {
    const next = Uint8Array.from(cur);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = y * width + x;
        if (cur[i]) continue;
        if (
          cur[i - 1] ||
          cur[i + 1] ||
          cur[i - width] ||
          cur[i + width]
        ) {
          next[i] = 1;
        }
      }
    }
    cur = next;
  }
  return cur;
}

function bbox(mask: Uint8Array, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error("Mask kosong - tidak ada lambang yang terdeteksi.");
  return { minX, minY, maxX, maxY };
}

async function main() {
  const svg = await readFile(SRC_SVG);
  const srcHash = createHash("sha256").update(svg).digest("hex");

  const { data, info } = await sharp(svg, { density: 600 })
    .resize({ width: RASTER_W })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const raster: Raster = {
    data,
    width: info.width,
    height: info.height,
    channels: info.channels,
  };

  await mkdir(OUT_DIR, { recursive: true });
  const manifest: Record<string, unknown>[] = [];

  /*
   * Perisai hitam di tengah dihitung lebih dulu dan dipakai sebagai
   * penghalang untuk empat bidang sudut - lihat catatan di kepala berkas.
   * Dilebarkan 12 piksel supaya garis tepinya ikut tertutup, kalau tidak
   * lengkung hitam itu terbaca sebagai bagian lambang tetangga.
   */
  const center = REGIONS.find((r) => r.id === "sila-1")!;
  const centerGround = floodFill(raster, center.seed, center.ground, center.bounds);
  const centerStar = enclosedHoles(raster, centerGround, center.bounds);
  const centerSilhouette = Uint8Array.from(centerGround);
  for (let i = 0; i < centerSilhouette.length; i++) {
    if (centerStar[i]) centerSilhouette[i] = 1;
  }
  const barrier = dilate(centerSilhouette, raster.width, center.bounds, 12);

  for (const region of REGIONS) {
    const isCenter = region.id === center.id;
    const ground = isCenter
      ? centerGround
      : floodFill(raster, region.seed, region.ground, region.bounds);
    const symbol = isCenter
      ? centerStar
      : enclosedHoles(raster, ground, region.bounds, barrier);
    const box = bbox(symbol, raster.width, raster.height);

    // Kotak potong persegi, terpusat pada lambang, agar tidak ada sila yang
    // gepeng saat diperkecil jadi ikon.
    const w = box.maxX - box.minX + 1;
    const h = box.maxY - box.minY + 1;
    const side = Math.max(w, h) + PAD * 2;
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    const left = Math.round(cx - side / 2);
    const top = Math.round(cy - side / 2);

    // Susun ubin: piksel di dalam bidang disalin apa adanya, sisanya diisi
    // warna dasar heraldik sehingga sambungannya tak terlihat.
    const tile = Buffer.alloc(side * side * 4);
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const sx = left + x;
        const sy = top + y;
        const o = (y * side + x) * 4;
        const inside =
          sx >= 0 &&
          sy >= 0 &&
          sx < raster.width &&
          sy < raster.height &&
          (ground[sy * raster.width + sx] || symbol[sy * raster.width + sx]);
        if (inside) {
          const p = (sy * raster.width + sx) * raster.channels;
          tile[o] = data[p]!;
          tile[o + 1] = data[p + 1]!;
          tile[o + 2] = data[p + 2]!;
        } else {
          tile[o] = region.ground[0];
          tile[o + 1] = region.ground[1];
          tile[o + 2] = region.ground[2];
        }
        tile[o + 3] = 255;
      }
    }

    const outPath = path.join(OUT_DIR, `${region.id}.png`);
    const png = await sharp(tile, { raw: { width: side, height: side, channels: 4 } })
      .resize(OUT_SIZE, OUT_SIZE, { fit: "fill" })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await writeFile(outPath, png);

    manifest.push({
      id: region.id,
      sila: region.sila,
      name_id: region.name_id,
      file: `/lambang/${region.id}.png`,
      ground_hex:
        "#" + region.ground.map((c) => c.toString(16).padStart(2, "0")).join(""),
      px: OUT_SIZE,
      bytes: png.length,
      sha256: createHash("sha256").update(png).digest("hex"),
    });
    console.log(
      `  ${region.id} (${region.name_id.padEnd(15)}) ${String(png.length).padStart(7)} B`
    );
  }

  const manifestPath = path.join(OUT_DIR, "manifest.json");
  await writeFile(
    manifestPath,
    JSON.stringify(
      {
        _catatan:
          "Dihasilkan oleh apps/web/scripts/build-sila-symbols.mts. Jangan disunting tangan.",
        sumber: {
          berkas: "public/emblems/presiden-ri.svg",
          judul: "Lambang Negara Republik Indonesia (Garuda Pancasila)",
          asal: "Wikimedia Commons",
          sha256: srcHash,
          status_hak_cipta:
            "Lambang negara - Pasal 42 huruf b UU No. 28 Tahun 2014 tentang Hak Cipta: tidak ada hak cipta atas lambang negara menurut sifatnya yang asli.",
        },
        raster_kerja_px: RASTER_W,
        dibuat_pada: new Date().toISOString().slice(0, 10),
        lambang: manifest,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`\nManifes: ${path.relative(WEB_ROOT, manifestPath)}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
