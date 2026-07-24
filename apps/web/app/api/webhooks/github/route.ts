import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@devpulse/db";
import { getProcessGithubEventQueue } from "@devpulse/lib/src/queue";
import { githubWebhookHeadersSchema, verifyGithubHmac } from "@devpulse/lib/src/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[DevPulse] Webhook received:", request.method, request.url);

  const rawBody = await request.text();
  const headers = githubWebhookHeadersSchema.safeParse({
    "x-github-event": request.headers.get("x-github-event"),
    "x-github-delivery": request.headers.get("x-github-delivery") ?? undefined,
    "x-hub-signature-256": request.headers.get("x-hub-signature-256")
  });
  if (!headers.success) {
    console.warn("[DevPulse] Webhook rejected: invalid headers", headers.error.flatten());
    return NextResponse.json({ error: "Invalid headers" }, { status: 400 });
  }

  const valid = verifyGithubHmac(
    rawBody,
    headers.data["x-hub-signature-256"],
    process.env.GITHUB_WEBHOOK_SECRET!
  );
  if (!valid) {
    console.warn("[DevPulse] Webhook rejected: invalid HMAC signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as Record<string, any>;
  const eventType = headers.data["x-github-event"];
  const orgSlug = payload.organization?.login ?? payload.repository?.owner?.login ?? "default";
  console.log("[DevPulse] Processing event:", eventType, "org:", orgSlug);

  const org = await prisma.organization.upsert({
    where: { slug: orgSlug.toLowerCase() },
    update: {},
    create: { slug: orgSlug.toLowerCase(), name: orgSlug }
  });

  const event = await prisma.webhookEvent.create({
    data: {
      orgId: org.id,
      source: "github",
      eventType,
      payload,
      deliveryId: headers.data["x-github-delivery"]
    }
  });

  // ── Inline processing: handle pull_request events directly ──
  // This removes the dependency on Redis + Worker for the critical path.
  // PRs are created/updated immediately when the webhook fires.
  if (eventType === "pull_request" && payload.pull_request) {
    try {
      const pr = payload.pull_request;
      const repo = payload.repository?.full_name ?? "unknown/repo";
      await prisma.pullRequest.upsert({
        where: {
          orgId_repo_number: { orgId: org.id, repo, number: pr.number }
        },
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
          orgId: org.id,
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
      console.log("[DevPulse] PR upserted:", repo, "#" + pr.number, pr.title);
    } catch (err) {
      console.error("[DevPulse] Failed to upsert PR:", err);
    }
  }

  // Mark the event as processed since we handled it inline
  await prisma.webhookEvent.update({
    where: { id: event.id },
    data: { processedAt: new Date() }
  });

  // Also queue for worker (fire-and-forget) for additional async processing
  // like AI summaries, DORA metrics, etc.
  try {
    await getProcessGithubEventQueue().add("process", {
      orgId: org.id,
      webhookEventId: event.id
    });
    console.log("[DevPulse] Queued event for async processing:", event.id);
  } catch (err) {
    console.error("[DevPulse] Failed to enqueue event (Redis issue):", err);
  }

  return NextResponse.json({ ok: true });
}
