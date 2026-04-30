import { PRTable } from "@/components/pr-table";
import { Topbar } from "@/components/topbar";

export default function DemoPullRequestsPage() {
  const prs = [
    {
      id: "1",
      number: 142,
      repo: "frontend-monorepo",
      title: "feat: redesign billing page to support multi-currency",
      state: "open",
      authorLogin: "alice-dev",
      authorAvatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
      additions: 1420,
      deletions: 340,
      createdAt: new Date(),
      updatedAt: new Date(),
      orgId: "demo",
      riskScore: { score: 85, rationale: "Massive changes to core billing components." }
    },
    {
      id: "2",
      number: 141,
      repo: "auth-service",
      title: "fix: token refresh race condition",
      state: "merged",
      authorLogin: "bob-eng",
      authorAvatarUrl: "https://avatars.githubusercontent.com/u/2?v=4",
      additions: 45,
      deletions: 12,
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 40000000),
      orgId: "demo",
      riskScore: { score: 62, rationale: "Touches critical auth paths but isolated." }
    },
    {
      id: "3",
      number: 140,
      repo: "frontend-monorepo",
      title: "chore: update dependencies",
      state: "open",
      authorLogin: "dependabot",
      authorAvatarUrl: "https://avatars.githubusercontent.com/in/29110?v=4",
      additions: 12,
      deletions: 12,
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      orgId: "demo",
      riskScore: null
    }
  ];

  return (
    <section className="space-y-8">
      <Topbar
        title="PR intelligence"
        description="Review health, AI summaries, and change risk in a streamlined surface optimized for engineering managers and senior reviewers."
        userLabel="Guest"
      />
      {/* @ts-ignore */}
      <PRTable prs={prs} />
    </section>
  );
}
