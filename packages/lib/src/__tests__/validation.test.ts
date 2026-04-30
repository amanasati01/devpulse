import { describe, it, expect } from "vitest";
import { verifyGithubHmac, githubWebhookHeadersSchema, summaryRequestSchema } from "../validation";
import crypto from "crypto";

describe("Validation and Verification", () => {
  describe("verifyGithubHmac", () => {
    it("should return true for a valid HMAC signature", () => {
      const payload = JSON.stringify({ action: "opened", pr: 123 });
      const secret = "supersecret";
      const expectedSignature = `sha256=${crypto.createHmac("sha256", secret).update(payload).digest("hex")}`;
      
      expect(verifyGithubHmac(payload, expectedSignature, secret)).toBe(true);
    });

    it("should return false for an invalid signature", () => {
      const payload = JSON.stringify({ action: "opened", pr: 123 });
      const secret = "supersecret";
      const badSignature = `sha256=${crypto.createHmac("sha256", "wrongsecret").update(payload).digest("hex")}`;
      
      expect(verifyGithubHmac(payload, badSignature, secret)).toBe(false);
    });

    it("should return false if signature length is mismatched to prevent error throws", () => {
      const payload = "hello";
      const secret = "secret";
      expect(verifyGithubHmac(payload, "sha256=too_short", secret)).toBe(false);
    });
  });

  describe("Zod Schemas", () => {
    it("validates github headers correctly", () => {
      const valid = {
        "x-github-event": "pull_request",
        "x-hub-signature-256": "sha256=abcd"
      };
      const result = githubWebhookHeadersSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails github headers if signature is missing", () => {
      const invalid = {
        "x-github-event": "pull_request"
      };
      const result = githubWebhookHeadersSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("validates summaryRequestSchema with valid UUID", () => {
      const valid = { pullRequestId: "123e4567-e89b-12d3-a456-426614174000" };
      const result = summaryRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("fails summaryRequestSchema with invalid UUID", () => {
      const invalid = { pullRequestId: "not-a-uuid" };
      const result = summaryRequestSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
