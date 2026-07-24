import { auth } from "@/auth";
import { prisma } from "@devpulse/db";
import { PRTable } from "@/components/pr-table";
import { Topbar } from "@/components/topbar";

export const dynamic = "force-dynamic";

export default async function PullRequestsPage() {
  const session = await auth();
  const orgId = session?.user?.orgId ?? "";
  const prs = orgId
    ? await prisma.pullRequest.findMany({
        where: { orgId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          riskScore: {
            select: {
              score: true,
              rationale: true
            }
          }
        }
      })
    : [];

  return (
    <section className="space-y-8">
      <Topbar
        title="PR intelligence"
        description="Review health, AI summaries, and change risk in a streamlined surface optimized for engineering managers and senior reviewers."
        userLabel={session?.user?.name ?? session?.user?.email}
      />
      <PRTable prs={prs} />
    </section>
  );
}
