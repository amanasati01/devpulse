import crypto from "crypto";
import { z } from "zod";

export const githubWebhookHeadersSchema = z.object({
  "x-github-event": z.string(),
  "x-github-delivery": z.string().optional(),
  "x-hub-signature-256": z.string()
});

export const summaryRequestSchema = z.object({
  pullRequestId: z.string().uuid()
});

export const riskScoreSchema = z.object({
  pullRequestId: z.string().uuid()
});

export function verifyGithubHmac(payload: string, signature: string, secret: string): boolean {
  const expected = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}
