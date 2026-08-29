import React from "react";

export type InstitutionId =
  | "presiden-ri"
  | "dpr-ri"
  | "mpr-ri"
  | "dpd-ri"
  | "mahkamah-konstitusi"
  | "mahkamah-agung"
  | "bpk-ri"
  | "komisi-yudisial"
  | string;

interface InstitutionLogoProps {
  id: InstitutionId;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showBadge?: boolean;
}

const sizeMap = {
  xs: 20,
  sm: 28,
  md: 44,
  lg: 68,
  xl: 96,
};

export function InstitutionLogo({
  id,
  size = "md",
  className = "",
  showBadge = false,
}: InstitutionLogoProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size] ?? 44;

  const renderVector = () => {
    switch (id) {
      // 1. PRESIDEN REPUBLIK INDONESIA (Lambang Garuda Pancasila Kepresidenan Emas)
      case "presiden-ri":
      case "presiden":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Kepresidenan Republik Indonesia"
          >
            <defs>
              <linearGradient id="presGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
              <linearGradient id="presRed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>
            {/* Lingkaran Luar Berpendar */}
            <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="url(#presGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="43" fill="none" stroke="url(#presGold)" strokeWidth="0.75" strokeDasharray="2,2" />
            
            {/* Sayap Garuda Emas */}
            <path
              d="M50 20 C38 24 22 34 16 48 C24 47 34 43 42 46 C34 50 24 57 20 66 C28 62 38 58 45 61 C37 68 30 76 34 82 C40 76 46 68 50 67 C54 68 60 76 66 82 C70 76 63 68 55 61 C62 58 72 62 80 66 C76 57 66 50 58 46 C66 43 76 47 84 48 C78 34 62 24 50 20 Z"
              fill="url(#presGold)"
            />
            {/* Kepala Garuda & Jambul */}
            <path d="M47 14 C48 10 52 10 53 14 C56 16 57 19 55 22 C52 23 48 23 45 22 C43 19 44 16 47 14 Z" fill="url(#presGold)" />
            <path d="M53 15 Q58 17 55 19 Z" fill="#CA8A04" />
            
            {/* Perisai Pancasila Tengah */}
            <path
              d="M50 34 C41 34 38 40 38 52 C38 64 50 72 50 72 C50 72 62 64 62 52 C62 40 59 34 50 34 Z"
              fill="#FFFFFF"
              stroke="url(#presGold)"
              strokeWidth="1.5"
            />
            {/* Kuadran Merah Putih Perisai */}
            <path d="M38.5 35.5 H50 V52 H38.5 Z" fill="url(#presRed)" />
            <path d="M50 52 H61.5 V53 C61.5 63 50 71 50 71 V52 Z" fill="url(#presRed)" />
            
            {/* Bintang Emas Sila 1 */}
            <polygon points="50,45 51.5,49 55.5,49 52.3,51.3 53.5,55 50,52.8 46.5,55 47.7,51.3 44.5,49 48.5,49" fill="url(#presGold)" stroke="#78350F" strokeWidth="0.5" />
            
            {/* Pita Bhinneka Tunggal Ika */}
            <path d="M32 79 Q50 74 68 79 L65 84 Q50 80 35 84 Z" fill="#F8FAFC" stroke="url(#presGold)" strokeWidth="0.75" />
            <text x="50" y="82.5" fontSize="3.2" fontWeight="bold" textAnchor="middle" fill="#0F172A" letterSpacing="0.4">
              INDONESIA
            </text>
          </svg>
        );

      // 2. DPR RI (Gedung Nusantara Hijau Emas & Perisai Garuda)
      case "dpr-ri":
      case "dpr":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Dewan Perwakilan Rakyat Republik Indonesia"
          >
            <defs>
              <linearGradient id="dprGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#047857" />
                <stop offset="100%" stopColor="#064E3B" />
              </linearGradient>
              <linearGradient id="dprGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="#064E3B" stroke="url(#dprGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="#0F172A" />

            {/* Kubah Lengkung Khas Gedung Nusantara Senayan DPR */}
            <path
              d="M18 52 C22 32 36 24 50 24 C64 24 78 32 82 52 C74 50 62 48 50 48 C38 48 26 50 18 52 Z"
              fill="url(#dprGreen)"
              stroke="url(#dprGold)"
              strokeWidth="1.5"
            />
            {/* Sayap Lengkung Kubah DPR Kiri & Kanan */}
            <path d="M22 51 C32 40 44 38 50 38 C38 44 28 47 22 51 Z" fill="#34D399" />
            <path d="M78 51 C68 40 56 38 50 38 C62 44 72 47 78 51 Z" fill="#34D399" />

            {/* Tiang Pilar Gedung DPR */}
            <g stroke="url(#dprGold)" strokeWidth="1.5" opacity="0.9">
              <line x1="30" y1="52" x2="30" y2="68" />
              <line x1="38" y1="50" x2="38" y2="68" />
              <line x1="46" y1="49" x2="46" y2="68" />
              <line x1="54" y1="49" x2="54" y2="68" />
              <line x1="62" y1="50" x2="62" y2="68" />
              <line x1="70" y1="52" x2="70" y2="68" />
            </g>

            {/* Garuda Pancasila Tengah */}
            <circle cx="50" cy="58" r="9" fill="#0F172A" stroke="url(#dprGold)" strokeWidth="1.2" />
            <polygon points="50,52 52,56 56,56 53,58 54,62 50,60 46,62 47,58 44,56 48,56" fill="url(#dprGold)" />

            {/* Pita DPR RI */}
            <rect x="22" y="73" width="56" height="11" rx="3" fill="#047857" stroke="url(#dprGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.8">
              DPR RI
            </text>
          </svg>
        );

      // 3. MPR RI (Majelis Permusyawaratan Rakyat - Kubah Emas Biru & Bintang)
      case "mpr-ri":
      case "mpr":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Majelis Permusyawaratan Rakyat Republik Indonesia"
          >
            <defs>
              <linearGradient id="mprBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A8A" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="mprGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#mprBlue)" stroke="url(#mprGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#mprGold)" strokeWidth="1" strokeDasharray="3,2" />

            {/* Bintang Puncak Kedaulatan Rakyat */}
            <polygon points="50,14 52.5,21 60,21 54,25 56.5,32 50,28 43.5,32 46,25 40,21 47.5,21" fill="url(#mprGold)" />

            {/* Kubah Paripurna MPR */}
            <path
              d="M20 54 C24 36 36 30 50 30 C64 30 76 36 80 54 C72 52 62 50 50 50 C38 50 28 52 20 54 Z"
              fill="#1E40AF"
              stroke="url(#mprGold)"
              strokeWidth="1.5"
            />
            {/* Untaian Padi & Kapas */}
            <path d="M22 66 C26 48 36 40 45 40" fill="none" stroke="url(#mprGold)" strokeWidth="2" strokeLinecap="round" />
            <path d="M78 66 C74 48 64 40 55 40" fill="none" stroke="url(#mprGold)" strokeWidth="2" strokeLinecap="round" />

            {/* Pilar Perwakilan Rakyat */}
            <path d="M26 56 H74 V68 H26 Z" fill="#0F172A" stroke="url(#mprGold)" strokeWidth="1.2" />
            <line x1="38" y1="56" x2="38" y2="68" stroke="url(#mprGold)" strokeWidth="1.5" />
            <line x1="50" y1="56" x2="50" y2="68" stroke="url(#mprGold)" strokeWidth="1.5" />
            <line x1="62" y1="56" x2="62" y2="68" stroke="url(#mprGold)" strokeWidth="1.5" />

            {/* Pita MPR RI */}
            <rect x="22" y="73" width="56" height="11" rx="3" fill="#1E3A8A" stroke="url(#mprGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.8">
              MPR RI
            </text>
          </svg>
        );

      // 4. DPD RI (Dewan Perwakilan Daerah - Peta Nusantara & Bintang Daerah)
      case "dpd-ri":
      case "dpd":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Dewan Perwakilan Daerah Republik Indonesia"
          >
            <defs>
              <linearGradient id="dpdRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="dpdGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="url(#dpdGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="url(#dpdRed)" opacity="0.9" />

            {/* Siluet Kepulauan Daerah Nusantara Indonesia */}
            <g fill="url(#dpdGold)" stroke="#78350F" strokeWidth="0.3">
              {/* Sumatera */}
              <path d="M22 36 L28 30 L34 44 L28 48 Z" />
              {/* Jawa */}
              <path d="M32 56 L48 57 L46 60 L30 59 Z" />
              {/* Kalimantan */}
              <path d="M38 34 L48 32 L50 44 L40 46 Z" />
              {/* Sulawesi */}
              <path d="M54 36 L60 34 L58 44 L62 48 L56 50 L54 44 Z" />
              {/* Papua */}
              <path d="M68 40 L80 38 L82 46 L72 50 Z" />
            </g>

            {/* 5 Bintang Simbol Sila & 38 Titik Provinsi */}
            <circle cx="50" cy="24" r="3" fill="url(#dpdGold)" />
            <circle cx="28" cy="28" r="2" fill="url(#dpdGold)" />
            <circle cx="72" cy="28" r="2" fill="url(#dpdGold)" />

            {/* Pita DPD RI */}
            <rect x="22" y="73" width="56" height="11" rx="3" fill="#0F172A" stroke="url(#dpdGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.8">
              DPD RI
            </text>
          </svg>
        );

      // 5. MAHKAMAH KONSTITUSI (MK RI - Timbangan Keadilan, Perisai Merah Putih & Cakra)
      case "mahkamah-konstitusi":
      case "mk":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Mahkamah Konstitusi Republik Indonesia"
          >
            <defs>
              <linearGradient id="mkGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
              <linearGradient id="mkRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="url(#mkGold)" strokeWidth="2.5" />
            
            {/* Lingkaran Cakra Keadilan Konstitusi */}
            <circle cx="50" cy="46" r="30" fill="none" stroke="url(#mkGold)" strokeWidth="1" strokeDasharray="4,2" />
            
            {/* Perisai Merah Putih Konstitusi */}
            <path
              d="M50 20 C36 20 32 26 32 38 C32 52 50 64 50 64 C50 64 68 52 68 38 C68 26 64 20 50 20 Z"
              fill="#FFFFFF"
              stroke="url(#mkGold)"
              strokeWidth="1.5"
            />
            <path d="M33 21 H50 V42 H33 Z" fill="url(#mkRed)" />
            <path d="M50 42 H67 V43 C67 52 50 63 50 63 V42 Z" fill="url(#mkRed)" />

            {/* Neraca Timbangan Keadilan Konstitusi */}
            <g stroke="url(#mkGold)" strokeWidth="1.8" strokeLinecap="round">
              {/* Tiang & Palang Timbangan */}
              <line x1="50" y1="24" x2="50" y2="56" />
              <line x1="34" y1="30" x2="66" y2="30" />
              {/* Tali Timbangan Kiri & Kanan */}
              <line x1="36" y1="30" x2="31" y2="40" strokeWidth="0.8" />
              <line x1="36" y1="30" x2="41" y2="40" strokeWidth="0.8" />
              <line x1="64" y1="30" x2="59" y2="40" strokeWidth="0.8" />
              <line x1="64" y1="30" x2="69" y2="40" strokeWidth="0.8" />
            </g>
            {/* Piringan Timbangan */}
            <path d="M30 40 Q36 44 42 40 Z" fill="url(#mkGold)" />
            <path d="M58 40 Q64 44 70 40 Z" fill="url(#mkGold)" />
            {/* Bintang Puncak */}
            <polygon points="50,21 51.5,24 55,24 52,26 53,29 50,27 47,29 48,26 45,24 48.5,24" fill="url(#mkGold)" />

            {/* Pita Mahkamah Konstitusi */}
            <rect x="20" y="73" width="60" height="11" rx="3" fill="#991B1B" stroke="url(#mkGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="5.5" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.6">
              MAHKAMAH KONSTITUSI
            </text>
          </svg>
        );

      // 6. MAHKAMAH AGUNG (MA RI - Cakra Dharma Yukti & Keris Keadilan)
      case "mahkamah-agung":
      case "ma":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Mahkamah Agung Republik Indonesia"
          >
            <defs>
              <linearGradient id="maGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#065F46" />
                <stop offset="100%" stopColor="#022C22" />
              </linearGradient>
              <linearGradient id="maGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#maGreen)" stroke="url(#maGold)" strokeWidth="2.5" />
            
            {/* Cakra Bintang 8 Sudut Dharma Yukti */}
            <g stroke="url(#maGold)" strokeWidth="1.5" fill="none">
              <circle cx="50" cy="46" r="25" strokeWidth="1" strokeDasharray="3,3" />
              <polygon points="50,18 54,34 70,30 58,42 70,54 54,50 50,66 46,50 30,54 42,42 30,30 46,34" fill="#047857" opacity="0.6" />
            </g>

            {/* Keris & Timbangan Keadilan Tertinggi */}
            <g stroke="url(#maGold)" strokeWidth="1.8" strokeLinecap="round">
              <line x1="50" y1="20" x2="50" y2="58" />
              <line x1="33" y1="28" x2="67" y2="28" />
              {/* Tali Timbangan */}
              <line x1="36" y1="28" x2="31" y2="38" strokeWidth="0.8" />
              <line x1="36" y1="28" x2="41" y2="38" strokeWidth="0.8" />
              <line x1="64" y1="28" x2="59" y2="38" strokeWidth="0.8" />
              <line x1="64" y1="28" x2="69" y2="38" strokeWidth="0.8" />
            </g>
            <path d="M30 38 Q36 42 42 38 Z" fill="url(#maGold)" />
            <path d="M58 38 Q64 42 70 38 Z" fill="url(#maGold)" />

            {/* Gagang & Pamor Keris Pusaka */}
            <path d="M48 58 L52 58 L50 66 Z" fill="url(#maGold)" />

            {/* Pita Mahkamah Agung */}
            <rect x="20" y="73" width="60" height="11" rx="3" fill="#064E3B" stroke="url(#maGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="5.5" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.6">
              MAHKAMAH AGUNG
            </text>
          </svg>
        );

      // 7. BPK RI (Badan Pemeriksa Keuangan - Tri Dharma Bhakti Pentacala)
      case "bpk-ri":
      case "bpk":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Badan Pemeriksa Keuangan Republik Indonesia"
          >
            <defs>
              <linearGradient id="bpkBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" />
                <stop offset="100%" stopColor="#172554" />
              </linearGradient>
              <linearGradient id="bpkGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#bpkBlue)" stroke="url(#bpkGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#bpkGold)" strokeWidth="0.8" strokeDasharray="3,2" />

            {/* Perisai Pentacala Segi Lima BPK */}
            <polygon
              points="50,20 74,36 65,65 35,65 26,36"
              fill="#0F172A"
              stroke="url(#bpkGold)"
              strokeWidth="1.6"
            />

            {/* Neraca Pengawasan Keuangan Negara & Sayap Emas */}
            <path
              d="M32 40 C40 34 46 36 50 42 C54 36 60 34 68 40 C62 48 56 50 50 56 C44 50 38 48 32 40 Z"
              fill="url(#bpkGold)"
            />
            {/* Timbangan Akuntabilitas Keuangan */}
            <g stroke="url(#bpkGold)" strokeWidth="1.5">
              <line x1="50" y1="26" x2="50" y2="58" />
              <line x1="38" y1="34" x2="62" y2="34" />
            </g>
            <circle cx="38" cy="42" r="3.5" fill="url(#bpkGold)" />
            <circle cx="62" cy="42" r="3.5" fill="url(#bpkGold)" />

            {/* Bintang Ketuhanan Puncak */}
            <polygon points="50,22 51.5,25 55,25 52,27 53,30 50,28 47,30 48,27 45,25 48.5,25" fill="url(#bpkGold)" />

            {/* Pita BPK RI */}
            <rect x="22" y="73" width="56" height="11" rx="3" fill="#1E3A8A" stroke="url(#bpkGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.8">
              BPK RI
            </text>
          </svg>
        );

      // 8. KOMISI YUDISIAL (KY RI - Perisai Integritas Hakim & Cakra Kehormatan)
      case "komisi-yudisial":
      case "ky":
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm transition-transform group-hover:scale-105"
            aria-label="Lambang Komisi Yudisial Republik Indonesia"
          >
            <defs>
              <linearGradient id="kyPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338CA" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>
              <linearGradient id="kyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="47" fill="url(#kyPurple)" stroke="url(#kyGold)" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#kyGold)" strokeWidth="0.8" strokeDasharray="3,2" />

            {/* Perisai Integritas Martabat Hakim */}
            <path
              d="M50 20 C36 20 32 26 32 38 C32 54 50 65 50 65 C50 65 68 54 68 38 C68 26 64 20 50 20 Z"
              fill="#0F172A"
              stroke="url(#kyGold)"
              strokeWidth="1.6"
            />

            {/* Cakra Integritas & Timbangan Etik Peradilan */}
            <circle cx="50" cy="40" r="14" fill="none" stroke="url(#kyGold)" strokeWidth="1" strokeDasharray="3,2" />
            <g stroke="url(#kyGold)" strokeWidth="1.6" strokeLinecap="round">
              <line x1="50" y1="24" x2="50" y2="56" />
              <line x1="36" y1="32" x2="64" y2="32" />
              <line x1="38" y1="32" x2="34" y2="42" strokeWidth="0.8" />
              <line x1="38" y1="32" x2="42" y2="42" strokeWidth="0.8" />
              <line x1="62" y1="32" x2="58" y2="42" strokeWidth="0.8" />
              <line x1="62" y1="32" x2="66" y2="42" strokeWidth="0.8" />
            </g>
            <path d="M33 42 Q38 46 43 42 Z" fill="url(#kyGold)" />
            <path d="M57 42 Q62 46 67 42 Z" fill="url(#kyGold)" />

            {/* Bintang Kejujuran Puncak */}
            <polygon points="50,22 51.5,25 55,25 52,27 53,30 50,28 47,30 48,27 45,25 48.5,25" fill="url(#kyGold)" />

            {/* Pita Komisi Yudisial */}
            <rect x="20" y="73" width="60" height="11" rx="3" fill="#312E81" stroke="url(#kyGold)" strokeWidth="1.2" />
            <text x="50" y="80.5" fontSize="5.5" fontWeight="bold" textAnchor="middle" fill="#FDE047" letterSpacing="0.6">
              KOMISI YUDISIAL
            </text>
          </svg>
        );

      // Default Fallback: Garuda Pancasila
      default:
        return (
          <svg
            viewBox="0 0 100 100"
            width={pixelSize}
            height={pixelSize}
            className="drop-shadow-sm"
            aria-label="Lambang Lembaga Negara"
          >
            <circle cx="50" cy="50" r="47" fill="#0F172A" stroke="#EAB308" strokeWidth="2" />
            <polygon points="50,20 54,34 70,30 58,42 70,54 54,50 50,66 46,50 30,54 42,42 30,30 46,34" fill="#EAB308" />
          </svg>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {renderVector()}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow ring-2 ring-[var(--panel)]">
          ✓
        </span>
      )}
    </div>
  );
}
