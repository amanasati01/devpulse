import OpenAI from "openai";

let _openai: OpenAI | undefined;

function getOpenAIClient() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const MAX_BODY_LENGTH = 12_000;

function trimInput(input: string) {
  if (input.length <= MAX_BODY_LENGTH) return input;
  return `${input.slice(0, MAX_BODY_LENGTH)}\n\n[TRUNCATED_FOR_MODEL_LIMIT]`;
}

export async function summarizePullRequest(input: {
  title: string;
  repo: string;
  author: string;
  body: string;
}) {
  const openai = getOpenAIClient();
  const prompt = trimInput(
    `Repo: ${input.repo}\nTitle: ${input.title}\nAuthor: ${input.author}\nDescription:\n${input.body}`
  );

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 300,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You summarize pull requests for engineering managers. Return concise technical summary and rollout/testing concerns."
      },
      { role: "user", content: prompt }
    ]
  });

  return completion.choices[0]?.message?.content ?? "No summary generated.";
}

export async function scoreRisk(input: {
  title: string;
  diffStats: string;
  summary: string;
}) {
  const openai = getOpenAIClient();
  const prompt = trimInput(
    `PR Title: ${input.title}\nDiff Stats: ${input.diffStats}\nSummary: ${input.summary}\n\nProvide JSON: {"score":number(0-100),"rationale":"..."}`
  );
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 220,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a software delivery risk scoring assistant." },
      { role: "user", content: prompt }
    ]
  });
  const raw = completion.choices[0]?.message?.content ?? '{"score":50,"rationale":"fallback"}';
  return JSON.parse(raw) as { score: number; rationale: string };
}
