import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { summarizePullRequest } from "@devpulse/lib/src/ai";
import { generatePrSummaryQueue } from "@devpulse/lib/src/queue";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pr = await prisma.pullRequest.findFirst({
    where: { id: params.id, orgId: session.user.orgId }
  });
  if (!pr) {
    return NextResponse.json({ error: "PR not found" }, { status: 404 });
  }

  await generatePrSummaryQueue.add("summary", { orgId: pr.orgId, pullRequestId: pr.id });
  const summary = await summarizePullRequest({
    title: pr.title,
    repo: pr.repo,
    author: pr.author,
    body: `State=${pr.state}, additions=${pr.additions}, deletions=${pr.deletions}, changedFiles=${pr.changedFiles}`
  });

  const updated = await prisma.pullRequest.update({
    where: { id: pr.id },
    data: { summary, summaryUpdatedAt: new Date() }
  });
  return NextResponse.json(updated);
}
