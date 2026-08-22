import { z } from "zod";
import {
  assessmentSchema,
  eventSchema,
  institutionSchema,
  sourceSchema,
  termSchema,
  uudSchema,
  type Assessment,
  type EventRecord,
  type Institution,
  type Source,
  type Term,
  type UudMap,
} from "./schemas";
import { rubricSchema, type Rubric } from "./schemas";

/**
 * Bundel dataset lengkap hasil build dari packages/data.
 * Divalidasi saat pemuatan agar korupsi data terdeteksi sedini mungkin.
 */
export const datasetSchema = z.object({
  rubric: rubricSchema,
  uud: uudSchema,
  institutions: z.array(institutionSchema),
  terms: z.array(termSchema),
  events: z.array(eventSchema),
  sources: z.array(sourceSchema),
  assessments: z.array(assessmentSchema),
});
export type Dataset = z.infer<typeof datasetSchema>;

export class DatasetError extends Error {
  constructor(message: string, public issues?: unknown) {
    super(message);
    this.name = "DatasetError";
  }
}

export function parseDataset(raw: unknown): Dataset {
  const parsed = datasetSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DatasetError("Dataset tidak valid", parsed.error.flatten());
  }
  return parsed.data;
}

// ------------------------------------------------------------------ aksesur

export function getRubric(dataset: Dataset): Rubric {
  return dataset.rubric;
}

export function getInstitutions(dataset: Dataset): Institution[] {
  return [...dataset.institutions].sort((a, b) =>
    a.branch.localeCompare(b.branch) || a.name_id.localeCompare(b.name_id)
  );
}

export function getInstitution(
  dataset: Dataset,
  slug: string
): Institution | undefined {
  return dataset.institutions.find((i) => i.slug === slug);
}

export function getTermsOfInstitution(
  dataset: Dataset,
  institutionId: string
): Term[] {
  return dataset.terms
    .filter((t) => t.institution_id === institutionId)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
}

export function getEventsOfTerm(
  dataset: Dataset,
  termId: string
): EventRecord[] {
  return dataset.events
    .filter((e) => e.term_id === termId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getSource(
  dataset: Dataset,
  sourceId: string
): Source | undefined {
  return dataset.sources.find((s) => s.id === sourceId);
}

export function getAssessmentsOfTerm(
  dataset: Dataset,
  termId: string
): Assessment[] {
  return dataset.assessments.filter((a) => a.term_id === termId);
}

export function getLatestAssessment(
  dataset: Dataset,
  termId: string
): Assessment | undefined {
  const list = getAssessmentsOfTerm(dataset, termId);
  return list.at(-1);
}
