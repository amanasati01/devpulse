import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@devpulse/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type GithubApiPr = {
  number: number;
  title: string;
  state: string;
  additions?: number;
  deletions?: number;
  changed_files?: number;
  merged_at?: string | null;
  closed_at?: string | null;
  user?: { login?: string };
  base?: { repo?: { full_name?: string } };
};

type GithubApiRepo = {
  name: string;
  full_name: string;
  owner: { login: string };
};

export async function POST() {
  const session = await auth();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = session.user.githubAccessToken;
  if (!token) {
    return NextResponse.json(
      { error: "No GitHub OAuth token found in session. Please sign in again with GitHub." },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch user's repositories from GitHub
    const reposRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "DevPulse-App"
      }
    });

    if (!reposRes.ok) {
      const errText = await reposRes.text();
      return NextResponse.json({ error: `GitHub API error fetching repos: ${errText}` }, { status: reposRes.status });
    }

    const repos: GithubApiRepo[] = await reposRes.json();
    let syncedCount = 0;

    // 2. For each repository, fetch pull requests (all states: open, closed)
    for (const repo of repos) {
      const prsRes = await fetch(`https://api.github.com/repos/${repo.full_name}/pulls?state=all&per_page=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "DevPulse-App"
        }
      });

      if (!prsRes.ok) continue;

      const prs: GithubApiPr[] = await prsRes.json();

      for (const pr of prs) {
        const repoFullName = pr.base?.repo?.full_name ?? repo.full_name;

        // Fetch detailed PR stats (additions, deletions, changed_files) if missing
        let additions = pr.additions ?? 0;
        let deletions = pr.deletions ?? 0;
        let changedFiles = pr.changed_files ?? 0;

        if (pr.additions === undefined) {
          try {
            const detailRes = await fetch(`https://api.github.com/repos/${repoFullName}/pulls/${pr.number}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "DevPulse-App"
              }
            });
            if (detailRes.ok) {
              const detail: GithubApiPr = await detailRes.json();
              additions = detail.additions ?? 0;
              deletions = detail.deletions ?? 0;
              changedFiles = detail.changed_files ?? 0;
            }
          } catch (e) {
            // fallback
          }
        }

        await prisma.pullRequest.upsert({
          where: {
            orgId_repo_number: {
              orgId: session.user.orgId,
              repo: repoFullName,
              number: pr.number
            }
          },
          update: {
            title: pr.title,
            state: pr.state,
            additions,
            deletions,
            changedFiles,
            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null
          },
          create: {
            orgId: session.user.orgId,
            repo: repoFullName,
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? "unknown",
            state: pr.state,
            additions,
            deletions,
            changedFiles,
            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null
          }
        });

        syncedCount++;
      }
    }

    // 3. Return updated list of PRs
    const updatedPrs = await prisma.pullRequest.findMany({
      where: { orgId: session.user.orgId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        riskScore: {
          select: { score: true, rationale: true }
        }
      }
    });

    return NextResponse.json({ ok: true, syncedCount, prs: updatedPrs });
  } catch (err) {
    console.error("[DevPulse] Error syncing PRs from GitHub:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
