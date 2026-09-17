import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@devpulse/db";
import { getRedisClient } from "@devpulse/lib";
import { getProcessGithubEventQueue } from "@devpulse/lib/src/queue";
import { githubWebhookHeadersSchema, verifyGithubHmac } from "@devpulse/lib/src/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.log("[DevPulse] Webhook received:", request.method, request.url);

  try {
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

    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[DevPulse] Webhook rejected: GITHUB_WEBHOOK_SECRET environment variable is missing!");
      return NextResponse.json({ error: "Server misconfigured: GITHUB_WEBHOOK_SECRET missing" }, { status: 500 });
    }

    const valid = verifyGithubHmac(
      rawBody,
      headers.data["x-hub-signature-256"],
      secret
    );
    if (!valid) {
      console.warn("[DevPulse] Webhook rejected: invalid HMAC signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: Record<string, any>;
    try {
      if (rawBody.startsWith("payload=")) {
        const decoded = decodeURIComponent(rawBody.substring(8).replace(/\+/g, " "));
        payload = JSON.parse(decoded);
      } else {
        payload = JSON.parse(rawBody);
      }
    } catch (parseErr) {
      console.error("[DevPulse] Webhook rejected: failed to parse body as JSON", parseErr);
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

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

    // ── Direct Real-time Event Publishing ──
    // Publish live activity directly to Redis channel so the Realtime Feed UI
    // receives events immediately even without a background worker running.
    try {
      const redis = getRedisClient();
      let iconType: "pr" | "incident" | "deploy" | "system" | "user" = "system";
      let message = `Webhook received from ${payload.repository?.name ?? orgSlug} (${eventType})`;

      if (eventType === "pull_request" && payload.pull_request) {
        iconType = "pr";
        message = `PR #${payload.pull_request.number} ${payload.action ?? "updated"}: ${payload.pull_request.title}`;
      } else if (eventType === "push") {
        iconType = "deploy";
        const branch = payload.ref?.replace("refs/heads/", "") ?? "main";
        message = `Push to ${branch} on ${payload.repository?.name ?? "repo"} by @${payload.pusher?.name ?? payload.sender?.login ?? "dev"}`;
      }

      await redis.publish(
        "devpulse:events",
        JSON.stringify({
          type: eventType.toUpperCase(),
          payload: { message },
          timestamp: Date.now(),
          iconType
        })
      );
      console.log("[DevPulse] Realtime event published to Redis:", message);
    } catch (pubErr) {
      console.warn("[DevPulse] Could not publish realtime event:", pubErr);
    }

    // Also queue for worker (fire-and-forget) for additional async processing
    try {
      await getProcessGithubEventQueue().add("process", {
        orgId: org.id,
        webhookEventId: event.id
      });
    } catch (err) {
      // Redis queue optional
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DevPulse] Unhandled exception in webhook route:", err);
    return NextResponse.json(
      { error: "Internal server error", message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
