import type { JobDefinition } from "../model/GameDataModels";

/**
 * Maps a base job id (class_id 0 root jobs) to its background image file.
 * Advanced jobs are resolved to their root base job through the inherit chain,
 * so every job id ends up mapped to one of these backgrounds.
 */
const BASE_JOB_BACKGROUNDS: Record<number, string> = {
  1: "bg_warrior.png", // warrior
  2: "bg_archer.png", // archer
  3: "bg_sorcerer.png", // sorceress
  4: "bg_cleric.png", // cleric
  5: "bg_academic.png", // academic
};

const BACKGROUND_BASE_PATH = "assets/img/background/";

/**
 * Resolves the background image url for a given job id.
 *
 * It walks the job inherit chain (e.g. gladiator -> swordmaster -> warrior)
 * until it finds a base job that has a mapped background image.
 *
 * @returns the public url of the background image, or null when none matches.
 */
export const resolveJobBackgroundUrl = (
  jobs: JobDefinition[],
  jobId: number,
): string | null => {
  const jobById = new Map<number, JobDefinition>();
  for (const job of jobs) {
    jobById.set(job.id, job);
  }

  let current: JobDefinition | null = jobById.get(jobId) ?? null;
  const visited = new Set<number>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);

    const background = BASE_JOB_BACKGROUNDS[current.id];
    if (background) {
      return `${import.meta.env.BASE_URL}${BACKGROUND_BASE_PATH}${background}`;
    }

    if (current.inherit < 0) {
      break;
    }

    current = jobById.get(current.inherit) ?? null;
  }

  return null;
};
