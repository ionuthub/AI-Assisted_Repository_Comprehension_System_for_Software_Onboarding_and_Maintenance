import { describe, expect, it } from "vitest";
import {
  ADJUDICATION_GENERATION_CONFIG,
  AUDIT_GENERATION_CONFIG,
  consumeGenerationStream,
  DEFAULT_GEMINI_MODEL,
  encodeGenerationEvent,
  extractJsonObjects,
  GENERATION_CONFIG,
  RUNTIME_RECONCILIATION_GENERATION_CONFIG,
  shouldRetryModelResponse,
} from "./generationProtocol";
import { MODEL_BUDGET } from "../constants/appConstants";

const streamOf = (parts: string[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      parts.forEach((part) => controller.enqueue(encoder.encode(part)));
      controller.close();
    },
  });

describe("Gemini stream parsing", () => {
  it("uses the current GA Flash model for verified repository answers", () => {
    expect(DEFAULT_GEMINI_MODEL).toBe("gemini-3.6-flash");
  });

  it("keeps enough output headroom for verified cross-file answers", () => {
    expect(GENERATION_CONFIG.maxOutputTokens).toBeGreaterThanOrEqual(8_192);
  });

  it("uses medium reasoning for verified generation without a custom temperature", () => {
    expect(GENERATION_CONFIG.thinkingConfig.thinkingLevel).toBe("medium");
    expect(GENERATION_CONFIG).not.toHaveProperty("temperature");
  });

  it("uses medium reasoning for the independent semantic audit", () => {
    expect(AUDIT_GENERATION_CONFIG.thinkingConfig.thinkingLevel).toBe("medium");
    expect(AUDIT_GENERATION_CONFIG.maxOutputTokens).toBe(GENERATION_CONFIG.maxOutputTokens);
    expect(AUDIT_GENERATION_CONFIG).not.toHaveProperty("temperature");
  });

  it("uses bounded reasoning for targeted final adjudication", () => {
    expect(ADJUDICATION_GENERATION_CONFIG.thinkingConfig.thinkingLevel).toBe("low");
    expect(ADJUDICATION_GENERATION_CONFIG.maxOutputTokens).toBe(GENERATION_CONFIG.maxOutputTokens);
    expect(ADJUDICATION_GENERATION_CONFIG).not.toHaveProperty("temperature");
  });
  it("uses medium reasoning with full answer headroom for selective reconciliation", () => {
    expect(RUNTIME_RECONCILIATION_GENERATION_CONFIG.thinkingConfig.thinkingLevel).toBe("medium");
    expect(RUNTIME_RECONCILIATION_GENERATION_CONFIG.maxOutputTokens)
      .toBe(GENERATION_CONFIG.maxOutputTokens);
    expect(RUNTIME_RECONCILIATION_GENERATION_CONFIG).not.toHaveProperty("temperature");
  });

  it("allows verified generation to outlive the former 90-second abort", () => {
    expect(MODEL_BUDGET.MAX_REQUEST_DURATION_MS).toBe(285_000);
  });

  it("retries temporary provider failures but not a monthly spending cap", () => {
    expect(shouldRetryModelResponse(503, "high demand")).toBe(true);
    expect(shouldRetryModelResponse(429, "rate limit exceeded")).toBe(true);
    expect(shouldRetryModelResponse(429, "project exceeded its monthly spending cap")).toBe(false);
    expect(shouldRetryModelResponse(400, "invalid request")).toBe(false);
  });

  it("extracts complete objects while retaining an incomplete final object", () => {
    const parsed = extractJsonObjects(
      '[{"candidates":[{"content":{"parts":[{"text":"a { brace"}]}}]}, {"candidate'
    );
    expect(parsed.objects).toHaveLength(1);
    expect(parsed.rest).toContain('{"candidate');
  });

  it("reassembles text events split across network chunks and returns usage", async () => {
    const payload =
      encodeGenerationEvent({ type: "text", text: "hello" }) +
      encodeGenerationEvent({
        type: "complete",
        finishReason: "STOP",
        usageMetadata: { candidatesTokenCount: 7 },
      });
    const pieces = [payload.slice(0, 9), payload.slice(9, 27), payload.slice(27)];
    let answer = "";

    const complete = await consumeGenerationStream(streamOf(pieces), (text) => {
      answer += text;
    });

    expect(answer).toBe("hello");
    expect(complete.finishReason).toBe("STOP");
    expect(complete.usageMetadata?.candidatesTokenCount).toBe(7);
  });

  it("refuses a stream that ends without completion metadata", async () => {
    const stream = streamOf([encodeGenerationEvent({ type: "text", text: "partial" })]);
    await expect(consumeGenerationStream(stream, () => undefined)).rejects.toThrow(
      /without a completion event/
    );
  });

  it("refuses a non-STOP finish reason", async () => {
    const stream = streamOf([
      encodeGenerationEvent({ type: "complete", finishReason: "MAX_TOKENS" }),
    ]);
    await expect(consumeGenerationStream(stream, () => undefined)).rejects.toThrow(/MAX_TOKENS/);
  });
});
