import { Worker } from "bullmq";
import { prisma } from "@devpulse/db";
import { getRedisClient, scoreRisk, summarizePullRequest } from "@devpulse/lib";

const redis = getRedisClient();

new Worker(
  "process-github-event",
  async (job) => {
    const event = await prisma.webhookEvent.findUnique({ where: { id: job.data.webhookEventId } });
    if (!event) return;
    const payload = event.payload as any;
    if (payload.pull_request) {
      const pr = payload.pull_request;
      const repo = payload.repository?.full_name ?? "unknown/repo";
      await prisma.pullRequest.upsert({
        where: { orgId_repo_number: { orgId: job.data.orgId, repo, number: pr.number } },
        update: {
          title: pr.title,
          state: pr.state,
          additions: pr.additions ?? 0,
          deletions: pr.deletions ?? 0,
          changedFiles: pr.changed_files ?? 0,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null
        },
        create: {
          orgId: job.data.orgId,
          repo,
          number: pr.number,
          title: pr.title,
          author: pr.user?.login ?? "unknown",
          state: pr.state,
          additions: pr.additions ?? 0,
          deletions: pr.deletions ?? 0,
          changedFiles: pr.changed_files ?? 0,
          mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
          closedAt: pr.closed_at ? new Date(pr.closed_at) : null
        }
      });
    }
    await prisma.webhookEvent.update({
      where: { id: event.id },
      data: { processedAt: new Date() }
    });
    await redis.publish(
      "devpulse:events",
      JSON.stringify({ type: "pipeline-update", payload: { orgId: job.data.orgId }, timestamp: new Date().toISOString() })
    );
  },
  { connection: redis }
);

new Worker(
  "generate-pr-summary",
  async (job) => {
    const pr = await prisma.pullRequest.findUnique({ where: { id: job.data.pullRequestId } });
    if (!pr) return;
    const summary = await summarizePullRequest({
      title: pr.title,
      repo: pr.repo,
      author: pr.author,
      body: `${pr.additions} additions, ${pr.deletions} deletions, ${pr.changedFiles} files`
    });
    await prisma.pullRequest.update({
      where: { id: pr.id },
      data: { summary, summaryUpdatedAt: new Date() }
    });
    await redis.publish(
      "devpulse:events",
      JSON.stringify({ type: "ai-summary", payload: { pullRequestId: pr.id }, timestamp: new Date().toISOString() })
    );
  },
  { connection: redis }
);

new Worker(
  "compute-dora",
  async (job) => {
    const orgId = job.data.orgId as string;
    const prs = await prisma.pullRequest.findMany({ where: { orgId } });
    const incidents = await prisma.incident.findMany({ where: { orgId } });
    const merged = prs.filter((pr) => pr.mergedAt);
    const deploymentFrequency = merged.length;
    const leadTimeHours =
      merged.reduce((acc, pr) => acc + ((pr.mergedAt!.getTime() - pr.createdAt.getTime()) / 36e5), 0) /
      Math.max(merged.length, 1);
    const changeFailureRate = incidents.length / Math.max(merged.length, 1);
    const mttrHours =
      incidents.reduce((acc, i) => {
        if (!i.resolvedAt) return acc;
        return acc + (i.resolvedAt.getTime() - i.startedAt.getTime()) / 36e5;
      }, 0) / Math.max(incidents.filter((i) => i.resolvedAt).length, 1);
    await prisma.doraSnapshot.create({
      data: { orgId, deploymentFrequency, leadTimeHours, changeFailureRate, mttrHours }
    });
    await redis.publish(
      "devpulse:events",
      JSON.stringify({ type: "dora-updated", payload: { orgId }, timestamp: new Date().toISOString() })
    );
  },
  { connection: redis }
);

// Optional recurring risk re-evaluation for newest PR.
setInterval(async () => {
  const latest = await prisma.pullRequest.findFirst({ orderBy: { createdAt: "desc" } });
  if (!latest) return;
  const ai = await scoreRisk({
    title: latest.title,
    summary: latest.summary ?? "",
    diffStats: `${latest.additions}/${latest.deletions}/${latest.changedFiles}`
  });
  await prisma.riskScore.upsert({
    where: { pullRequestId: latest.id },
    update: { score: ai.score, rationale: ai.rationale, model: "gpt-4o-mini" },
    create: {
      orgId: latest.orgId,
      pullRequestId: latest.id,
      score: ai.score,
      rationale: ai.rationale,
      model: "gpt-4o-mini"
    }
  });
}, 120_000);
