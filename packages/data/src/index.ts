import rawDataset from "../generated/dataset.json";

import { parseDataset, type Dataset } from "@pancasila-index/core";

/** Dataset tervalidasi penuh; dilempar error bila korup. */
export const dataset: Dataset = parseDataset(rawDataset);

export function getDataset(): Dataset {
  return dataset;
}

export * from "@pancasila-index/core";
export * from "./review";
export * from "./jdih";
export * from "./yaml-edit";
