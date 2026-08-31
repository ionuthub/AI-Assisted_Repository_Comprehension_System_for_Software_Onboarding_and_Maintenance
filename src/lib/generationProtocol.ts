import { MODEL_BUDGET } from "@/constants/appConstants";

export interface GenerationUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
  [key: string]: unknown;
}

/** Shared by the deployed proxy and local Vite middleware so captures are reproducible. */
export const GENERATION_CONFIG = {
  // Repository comprehension is factual retrieval work, not creative writing. A low
  // temperature reduces unnecessary variation while still allowing concise synthesis.
  temperature: 0.1,
  maxOutputTokens: MODEL_BUDGET.MAX_OUTPUT_TOKENS,
} as const;

export interface GenerationCompleteEvent {
  type: "complete";
  finishReason: string;
  usageMetadata?: GenerationUsageMetadata;
}

export type GenerationStreamEvent =
  | { type: "text"; text: string }
  | GenerationCompleteEvent
  | {
      type: "error";
      error: string;
      finishReason?: string;
      usageMetadata?: GenerationUsageMetadata;
    };

export const successfulFinishReason = (reason: string | undefined): reason is "STOP" => reason === "STOP";

export const encodeGenerationEvent = (event: GenerationStreamEvent): string =>
  `${JSON.stringify(event)}\n`;

export const parseGenerationEvent = (line: string): GenerationStreamEvent => {
  const parsed = JSON.parse(line) as Partial<GenerationStreamEvent>;
  if (parsed.type === "text" && typeof parsed.text === "string") {
    return { type: "text", text: parsed.text };
  }
  if (parsed.type === "complete" && typeof parsed.finishReason === "string") {
    return parsed as GenerationCompleteEvent;
  }
  if (parsed.type === "error" && typeof parsed.error === "string") {
    return parsed as Extract<GenerationStreamEvent, { type: "error" }>;
  }
  throw new Error("Invalid generation stream event");
};

/**
 * Extracts complete top-level JSON objects from Gemini's streamed JSON array.
 * Braces inside strings are ignored; an incomplete final object remains buffered.
 */
export function extractJsonObjects(buffer: string): { objects: unknown[]; rest: string } {
  const objects: unknown[] = [];
  let remaining = buffer;

  while (true) {
    const start = remaining.indexOf("{");
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;

    for (let i = start; i < remaining.length; i += 1) {
      const char = remaining[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (inString && char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (char === "{") depth += 1;
      if (char === "}") {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }

    if (end === -1) break;
    objects.push(JSON.parse(remaining.slice(start, end + 1)));
    remaining = remaining.slice(end + 1);
  }

  return { objects, rest: remaining };
}

export async function consumeGenerationStream(
  stream: ReadableStream<Uint8Array>,
  onText: (text: string) => void
): Promise<GenerationCompleteEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completion: GenerationCompleteEvent | null = null;

  const consumeLine = (line: string) => {
    if (!line.trim()) return;
    const event = parseGenerationEvent(line);
    if (event.type === "text") {
      if (completion) throw new Error("Generation stream sent text after completion");
      onText(event.text);
      return;
    }
    if (event.type === "error") {
      const suffix = event.finishReason ? ` (finish reason: ${event.finishReason})` : "";
      throw new Error(`${event.error}${suffix}`);
    }
    if (completion) throw new Error("Generation stream sent more than one completion event");
    completion = event;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    lines.forEach(consumeLine);
  }

  buffer += decoder.decode();
  consumeLine(buffer);

  const finished = completion as GenerationCompleteEvent | null;
  if (!finished) throw new Error("Generation stream ended without a completion event");
  if (!successfulFinishReason(finished.finishReason)) {
    throw new Error(`Generation ended before completion (finish reason: ${finished.finishReason})`);
  }
  return finished;
}
