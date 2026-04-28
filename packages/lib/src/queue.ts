import { Queue } from "bullmq";
import { getRedisClient } from "./redis";

const connection = getRedisClient();

export const processGithubEventQueue = new Queue("process-github-event", { connection });
export const generatePrSummaryQueue = new Queue("generate-pr-summary", { connection });
export const computeDoraQueue = new Queue("compute-dora", { connection });

export type ProcessGithubPayload = { orgId: string; webhookEventId: string };
export type GenerateSummaryPayload = { orgId: string; pullRequestId: string };
export type ComputeDoraPayload = { orgId: string };
