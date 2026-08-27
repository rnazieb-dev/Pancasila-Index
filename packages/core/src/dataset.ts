import { z } from "zod";
import {
  actorCaseSchema,
  actorProfileSchema,
  assessmentSchema,
  eventSchema,
  externalIndexSchema,
  institutionSchema,
  sourceSchema,
  termSchema,
  uudSchema,
  type ActorCase,
  type ActorProfile,
  type Assessment,
  type EventRecord,
  type ExternalIndex,
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
  actors: z.array(actorProfileSchema).default([]),
  actor_cases: z.array(actorCaseSchema).default([]),
  events: z.array(eventSchema),
  sources: z.array(sourceSchema),
  assessments: z.array(assessmentSchema),
  external_indices: z.array(externalIndexSchema).default([]),
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

/** Peristiwa yang dicatat pada masa jabatan ini (`term_id`). */
export function getEventsOfTerm(
  dataset: Dataset,
  termId: string
): EventRecord[] {
  return dataset.events
    .filter((e) => e.term_id === termId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Peristiwa yang *menjadikan* masa jabatan ini subjek pemeriksaan meski
 * dicatat di lembaga lain - misal audit BPK atau putusan MA atas perkara
 * yang pelakunya menjabat di periode ini. Tanpa aksesor ini, perkara
 * korupsi hanya muncul di profil lembaga yang membongkarnya.
 */
export function getEventsAboutTerm(
  dataset: Dataset,
  termId: string
): EventRecord[] {
  return dataset.events
    .filter((e) => e.subject_term_id === termId && e.term_id !== termId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// -------------------------------------------------------------------- aktor

export function getActors(dataset: Dataset): ActorProfile[] {
  return [...dataset.actors].sort((a, b) => a.name.localeCompare(b.name));
}

export function getActor(
  dataset: Dataset,
  actorId: string
): ActorProfile | undefined {
  return dataset.actors.find((a) => a.id === actorId);
}

/** Peristiwa yang menyebut orang ini secara eksplisit lewat `actor_ids`. */
export function getEventsOfActor(
  dataset: Dataset,
  actorId: string
): EventRecord[] {
  return dataset.events
    .filter((e) => e.actor_ids.includes(actorId))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Perkara hukum orang ini; setiap perkara dijamin bersitasi oleh skema. */
export function getCasesOfActor(
  dataset: Dataset,
  actorId: string
): ActorCase[] {
  return dataset.actor_cases
    .filter((c) => c.actor_id === actorId)
    .sort((a, b) => a.status_date.localeCompare(b.status_date));
}

/** Masa jabatan yang pernah diduduki orang ini, terurut waktu. */
export function getTermsOfActor(dataset: Dataset, actorId: string): Term[] {
  const ids = new Set(
    getActor(dataset, actorId)
      ?.roles.map((r) => r.term_id)
      .filter((id): id is string => Boolean(id)) ?? []
  );
  for (const t of dataset.terms) {
    if (t.actors.some((a) => a.actor_id === actorId)) ids.add(t.id);
  }
  return dataset.terms
    .filter((t) => ids.has(t.id))
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
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

export function getExternalIndices(dataset: Dataset): ExternalIndex[] {
  return dataset.external_indices ?? [];
}

export function getExternalIndex(
  dataset: Dataset,
  id: string
): ExternalIndex | undefined {
  return (dataset.external_indices ?? []).find((idx) => idx.id === id);
}
