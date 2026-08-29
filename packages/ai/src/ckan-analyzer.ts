import { CkanPackage } from "@pancasila-index/core";

export interface AiClaimResult {
  aiExtractedClaim: string;
  relevantDimension: string;
}

export async function analyzeDatasetClaim(dataset: CkanPackage): Promise<AiClaimResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, using mock extraction");
    return {
      aiExtractedClaim: `Pemerintah mengklaim pencapaian dalam dataset: ${dataset.title}`,
      relevantDimension: "sila-5",
    };
  }

  const prompt = `
  Anda adalah asisten AI untuk Pancasila Index, platform audit independen.
  Tugas Anda:
  Baca metadata dataset rilis pemerintah berikut.
  Ekstrak 1 kalimat pendek yang merupakan "Klaim Utama Pemerintah" (contoh: "Angka kemiskinan turun 2%").
  Tentukan ID dimensi UUD 1945 mana klaim ini bersinggungan (pilih satu dari: sila-1, sila-2, sila-3, sila-4, sila-5, kedaulatan-rakyat, negara-hukum, checks-balances, tujuan-1, tujuan-2, tujuan-3, tujuan-4).

  Dataset:
  Title: ${dataset.title}
  Agency: ${dataset.organization?.title || "Pemerintah"}
  Description: ${dataset.notes}

  Output harus HANYA berupa JSON tanpa markdown dengan format:
  {
    "aiExtractedClaim": "string",
    "relevantDimension": "string"
  }
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const text = (data as any).candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText) as AiClaimResult;
  } catch (err) {
    console.error("AI Claim Error:", err);
    return null;
  }
}
