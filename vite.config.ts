import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {
  DEFAULT_GEMINI_MODEL,
  encodeGenerationEvent,
  GENERATION_CONFIG,
  successfulFinishReason,
  type GenerationUsageMetadata,
} from "./src/lib/generationProtocol";
import {
  buildSystemPrompt,
  clampSystemContext,
  systemContextFitsBudget,
} from "./src/lib/promptBuilder";
import {
  buildAnswerAuditPrompt,
  buildAnswerRepairPrompt,
  buildAnswerReviewPrompt,
  extractEvidencePathsFromContext,
  verifyGeneratedAnswer,
} from "./src/lib/answerVerification";
import { MODEL_BUDGET } from "./src/constants/appConstants";

interface DevMessage {
  role: 'user' | 'model';
  content: string;
}

interface DevGeminiResult {
  text: string;
  finishReason: string;
  usageMetadata?: GenerationUsageMetadata;
}

const toGeminiContents = (messages: DevMessage[]) =>
  messages.map((message) => ({
    role: message.role,
    parts: [{ text: message.content }],
  }));

async function countDevInputTokens(
  messages: DevMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string,
  signal: AbortSignal
): Promise<number> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generateContentRequest: {
          model: `models/${model}`,
          contents: toGeminiContents(messages),
          systemInstruction: { parts: [{ text: systemPrompt }] },
        },
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Token count request failed (${response.status}): ${await response.text()}`);
  }
  const data = await response.json() as { totalTokens?: number };
  if (!Number.isFinite(data.totalTokens)) throw new Error('Token count request returned no usable total');
  return data.totalTokens as number;
}

async function callDevGemini(
  messages: DevMessage[],
  systemPrompt: string,
  model: string,
  apiKey: string,
  signal: AbortSignal
): Promise<DevGeminiResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: toGeminiContents(messages),
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: GENERATION_CONFIG,
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Model request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    usageMetadata?: GenerationUsageMetadata;
  };
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text || '').join('').trim() ?? '';
  const finishReason = candidate?.finishReason;
  if (!text || !successfulFinishReason(finishReason)) {
    throw new Error(text ? `Generation ended before completion (${finishReason ?? 'unknown'})` : 'Generation returned no answer');
  }

  return { text, finishReason, usageMetadata: data.usageMetadata };
}

async function generateVerifiedDevAnswer(
  messages: DevMessage[],
  systemContext: string,
  model: string,
  apiKey: string,
  signal: AbortSignal
) {
  const systemPrompt = buildSystemPrompt(systemContext);
  const evidence = extractEvidencePathsFromContext(systemContext).map((path) => ({ path }));
  const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? '';
  const checkedInputTokens = await countDevInputTokens(messages, systemPrompt, model, apiKey, signal);

  if (checkedInputTokens > MODEL_BUDGET.MAX_INPUT_TOKENS) {
    throw new Error(`INPUT_BUDGET_EXCEEDED:${checkedInputTokens}:${MODEL_BUDGET.MAX_INPUT_TOKENS}`);
  }

  let promptTokenCount = 0;
  let candidatesTokenCount = 0;
  let totalTokenCount = 0;
  let modelCalls = 0;
  const addUsage = (usage?: GenerationUsageMetadata) => {
    promptTokenCount += usage?.promptTokenCount ?? 0;
    candidatesTokenCount += usage?.candidatesTokenCount ?? 0;
    totalTokenCount += usage?.totalTokenCount ?? 0;
    modelCalls += 1;
  };

  const draft = await callDevGemini(messages, systemPrompt, model, apiKey, signal);
  addUsage(draft.usageMetadata);

  let reviewed = await callDevGemini(
    [{ role: 'user', content: buildAnswerReviewPrompt(question, draft.text) }],
    systemPrompt,
    model,
    apiKey,
    signal
  );
  addUsage(reviewed.usageMetadata);

  reviewed = await callDevGemini(
    [{ role: 'user', content: buildAnswerAuditPrompt(question, reviewed.text) }],
    systemPrompt,
    model,
    apiKey,
    signal
  );
  addUsage(reviewed.usageMetadata);

  let verification = verifyGeneratedAnswer(reviewed.text, evidence);
  for (
    let attempt = 0;
    !verification.passed && attempt < MODEL_BUDGET.MAX_VERIFICATION_ATTEMPTS;
    attempt += 1
  ) {
    reviewed = await callDevGemini(
      [{ role: 'user', content: buildAnswerRepairPrompt(question, reviewed.text, verification.reasons) }],
      systemPrompt,
      model,
      apiKey,
      signal
    );
    addUsage(reviewed.usageMetadata);
    verification = verifyGeneratedAnswer(reviewed.text, evidence);
  }

  if (!verification.passed) {
    throw new Error(`Answer withheld by evidence gate: ${verification.reasons.join(' ')}`);
  }

  return {
    answer: reviewed.text,
    usageMetadata: {
      model,
      promptTokenCount,
      candidatesTokenCount,
      totalTokenCount,
      modelCalls,
      checkedInputTokens,
      verifiedBeforeRelease: true,
    } satisfies GenerationUsageMetadata,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            res.setHeader(
              'Content-Security-Policy',
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
              "font-src 'self' https://fonts.gstatic.com; " +
              "img-src 'self' data: https:; " +
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.github.com https://raw.githubusercontent.com; " +
              "frame-ancestors 'none';"
            );
            next();
          });
        }
      },
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/explain-code', async (req, res, next) => {
            if (req.method !== 'POST') return next();

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90_000);

            try {
              const buffers: Buffer[] = [];
              let size = 0;
              for await (const chunk of req) {
                const buffer = Buffer.from(chunk);
                size += buffer.length;
                if (size > MODEL_BUDGET.MAX_REQUEST_BODY_CHARS) {
                  res.writeHead(413, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Request exceeds the Q&A size budget' }));
                  clearTimeout(timeoutId);
                  return;
                }
                buffers.push(buffer);
              }

              const body = JSON.parse(Buffer.concat(buffers).toString()) as {
                messages?: DevMessage[];
                systemContext?: string;
                stream?: boolean;
              };
              const { messages, systemContext, stream = false } = body;

              if (!messages?.length) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'messages must be a non-empty array' }));
                clearTimeout(timeoutId);
                return;
              }
              if (!systemContextFitsBudget(systemContext)) {
                res.writeHead(413, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Repository context exceeds the server context budget' }));
                clearTimeout(timeoutId);
                return;
              }

              const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set' }));
                clearTimeout(timeoutId);
                return;
              }

              const model = (env.GEMINI_MODEL || process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim();
              const verified = await generateVerifiedDevAnswer(
                messages,
                clampSystemContext(systemContext),
                model,
                apiKey,
                controller.signal
              );
              clearTimeout(timeoutId);

              if (!stream) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
                res.end(JSON.stringify({
                  explanation: verified.answer,
                  finishReason: 'STOP',
                  usageMetadata: verified.usageMetadata,
                }));
                return;
              }

              res.writeHead(200, {
                'Content-Type': 'application/x-ndjson; charset=utf-8',
                'Cache-Control': 'no-store',
                'Connection': 'keep-alive',
              });
              res.write(encodeGenerationEvent({ type: 'text', text: verified.answer }));
              res.write(encodeGenerationEvent({
                type: 'complete',
                finishReason: 'STOP',
                usageMetadata: verified.usageMetadata,
              }));
              res.end();
            } catch (error) {
              clearTimeout(timeoutId);
              const message = error instanceof Error ? error.message : 'Generation failed';
              const isTimeout = error instanceof Error && error.name === 'AbortError';
              const inputBudgetExceeded = message.startsWith('INPUT_BUDGET_EXCEEDED:');
              if (!res.headersSent) {
                res.writeHead(inputBudgetExceeded ? 413 : isTimeout ? 504 : 502, {
                  'Content-Type': 'application/json',
                });
              }
              res.end(JSON.stringify({
                error: inputBudgetExceeded
                  ? 'Repository context exceeds the model input-token budget'
                  : isTimeout
                    ? 'Request timeout'
                    : message,
              }));
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      target: 'ES2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  };
});
