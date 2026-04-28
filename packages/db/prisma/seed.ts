import { prisma } from "../src";

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "acme-devs" },
    update: {},
    create: {
      name: "Acme Devs",
      slug: "acme-devs"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "lead@acme.dev" },
    update: {},
    create: {
      orgId: org.id,
      githubId: "10001",
      email: "lead@acme.dev",
      name: "Team Lead",
      githubToken: "seed-token"
    }
  });

  const pr = await prisma.pullRequest.upsert({
    where: { orgId_repo_number: { orgId: org.id, repo: "acme/api", number: 42 } },
    update: {},
    create: {
      orgId: org.id,
      repo: "acme/api",
      number: 42,
      title: "Refactor deployment pipeline",
      author: user.name ?? "Team Lead",
      state: "open",
      additions: 420,
      deletions: 140,
      changedFiles: 12
    }
  });

  await prisma.incident.create({
    data: {
      orgId: org.id,
      title: "Intermittent worker timeout",
      severity: "high",
      status: "open",
      startedAt: new Date(Date.now() - 1000 * 60 * 90)
    }
  });

  await prisma.riskScore.upsert({
    where: { pullRequestId: pr.id },
    update: {},
    create: {
      orgId: org.id,
      pullRequestId: pr.id,
      score: 67,
      rationale: "Large refactor touching deployment code and many files.",
      model: "gpt-4o-mini"
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
