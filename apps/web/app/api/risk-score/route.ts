import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { riskScoreSchema } from "@devpulse/lib/src/validation";
import { scoreRisk } from "@devpulse/lib/src/ai";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = riskScoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pr = await prisma.pullRequest.findFirst({
    where: { id: parsed.data.pullRequestId, orgId: session.user.orgId }
  });
  if (!pr) {
    return NextResponse.json({ error: "PR not found" }, { status: 404 });
  }

  const ai = await scoreRisk({
    title: pr.title,
    summary: pr.summary ?? "No summary yet",
    diffStats: `${pr.additions} additions, ${pr.deletions} deletions, ${pr.changedFiles} files`
  });
  const risk = await prisma.riskScore.upsert({
    where: { pullRequestId: pr.id },
    update: { score: ai.score, rationale: ai.rationale, model: "gpt-4o-mini" },
    create: {
      orgId: pr.orgId,
      pullRequestId: pr.id,
      score: ai.score,
      rationale: ai.rationale,
      model: "gpt-4o-mini"
    }
  });
  return NextResponse.json(risk);
}
