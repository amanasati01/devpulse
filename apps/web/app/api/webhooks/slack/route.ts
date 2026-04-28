import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@devpulse/db";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Record<string, any>;
  const orgSlug = (payload.team_domain ?? "slack-default").toLowerCase();
  const org = await prisma.organization.upsert({
    where: { slug: orgSlug },
    update: {},
    create: { slug: orgSlug, name: orgSlug }
  });
  await prisma.webhookEvent.create({
    data: {
      orgId: org.id,
      source: "slack",
      eventType: payload.type ?? "event_callback",
      payload
    }
  });
  return NextResponse.json({ ok: true });
}
