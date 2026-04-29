import { Queue } from "bullmq";
import { getRedisClient } from "./redis";

let _processGithubEventQueue: Queue | undefined;
let _generatePrSummaryQueue: Queue | undefined;
let _computeDoraQueue: Queue | undefined;

export function getProcessGithubEventQueue() {
  if (!_processGithubEventQueue) {
    _processGithubEventQueue = new Queue("process-github-event", { connection: getRedisClient() });
  }
  return _processGithubEventQueue;
}

export function getGeneratePrSummaryQueue() {
  if (!_generatePrSummaryQueue) {
    _generatePrSummaryQueue = new Queue("generate-pr-summary", { connection: getRedisClient() });
  }
  return _generatePrSummaryQueue;
}

export function getComputeDoraQueue() {
  if (!_computeDoraQueue) {
    _computeDoraQueue = new Queue("compute-dora", { connection: getRedisClient() });
  }
  return _computeDoraQueue;
}

export type ProcessGithubPayload = { orgId: string; webhookEventId: string };
export type GenerateSummaryPayload = { orgId: string; pullRequestId: string };
export type ComputeDoraPayload = { orgId: string };
