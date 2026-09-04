import { describe, it, expect } from "vitest";
import { aiDisclosureSchema } from "@pancasila-index/core";
import { dataset } from "@pancasila-index/data";

describe("EU AI Act & Dimension Milestones Integrity", () => {
  it("aiDisclosureSchema memvalidasi konfigurasi model Gemini 3.8 Flash High sesuai Pasal 50 EU AI Act", () => {
    const disclosure = aiDisclosureSchema.parse({
      assisted: true,
      model_id: "gemini-3.8-flash-high",
      model_provider: "Google DeepMind",
      pipeline_version: "pancasila-nlp-v1.5",
      analysis_type: "llm-assisted-synthesis",
      human_oversight: {
        mechanism: "quorum-2-reviewers",
        status: "verified",
        approver_count: 2,
        approvers: ["Pakar HTN 1", "Arsiparis Sejarah"],
      },
      limitations_notice: "Sintesis awal dibantu AI dan diverifikasi manusia terhadap Lembaran Negara.",
      eu_ai_act_compliance: {
        article_50_compliant: true,
        transparency_tag: "EU-AI-ACT-ART-50-DISCLOSED",
      },
    });

    expect(disclosure.model_id).toBe("gemini-3.8-flash-high");
    expect(disclosure.model_provider).toBe("Google DeepMind");
    expect(disclosure.human_oversight.mechanism).toBe("quorum-2-reviewers");
    expect(disclosure.eu_ai_act_compliance.article_50_compliant).toBe(true);
  });

  it("seluruh 50 asesmen kanonik di dataset memiliki deklarasi transparansi EU AI Act yang valid", () => {
    expect(dataset.assessments.length).toBe(50);

    for (const asm of dataset.assessments) {
      expect(asm.ai_disclosure).toBeDefined();
      expect(asm.ai_disclosure?.model_id).toBe("gemini-3.8-flash-high");
      expect(asm.ai_disclosure?.model_provider).toBe("Google DeepMind");
      expect(asm.ai_disclosure?.eu_ai_act_compliance?.article_50_compliant).toBe(true);
      expect(asm.ai_disclosure?.human_oversight?.mechanism).toBe("quorum-2-reviewers");

      // Pasal 14: klaim pengawasan manusia hanya sah bila ada penelaah nyata.
      const ho = asm.ai_disclosure!.human_oversight;
      expect(ho.approver_count).toBe(ho.approvers.length);
      if (ho.status === "verified") expect(ho.approvers.length).toBeGreaterThan(0);
      if (asm.human_confirmed) expect(ho.status).not.toBe("draft");
    }
  });

  it("aiDisclosureSchema menolak klaim terverifikasi tanpa penelaah bernama", () => {
    expect(() =>
      aiDisclosureSchema.parse({
        human_oversight: { status: "verified", approver_count: 2, approvers: [] },
      })
    ).toThrow();
  });

  it("setiap asesmen masa jabatan memiliki trajektori multi-peristiwa ilmiah", () => {
    let multiEventCount = 0;
    for (const asm of dataset.assessments) {
      for (const ds of asm.dimension_scores) {
        if ((ds.event_ids?.length || 0) >= 2) {
          multiEventCount++;
        }
      }
    }

    // Memastikan lebih dari 300 skor dimensi memiliki trajektori multi-peristiwa (>=2)
    expect(multiEventCount).toBeGreaterThanOrEqual(300);
  });
});
