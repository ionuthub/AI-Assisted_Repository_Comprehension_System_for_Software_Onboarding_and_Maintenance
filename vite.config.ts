import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {
  encodeGenerationEvent,
  extractJsonObjects,
  GENERATION_CONFIG,
  successfulFinishReason,
  type GenerationUsageMetadata,
} from "./src/lib/generationProtocol";
import { buildSystemPrompt, clampSystemContext } from "./src/lib/promptBuilder";

// https://vitejs.dev/config/
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
            // Security headers for development
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

            try {
              const buffers = [];
              for await (const chunk of req) {
                buffers.push(chunk);
              }
              const body = JSON.parse(Buffer.concat(buffers).toString());
              const { messages, systemContext, stream } = body;

              const GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

              if (!GEMINI_API_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set in .env check log for setup instructions' }));
                return;
              }

              // Same builder as the deployed function, so a pilot session run against
              // this server exercises the prompt a participant meets in production.
              const systemPrompt = buildSystemPrompt(clampSystemContext(systemContext));

              const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
              const GEMINI_MODEL = (env.GEMINI_MODEL || process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim();
              const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${endpoint}?key=${GEMINI_API_KEY}`;

              const geminiPayload = {
                contents: messages.map((m: { role: string; content: string }) => ({
                  role: m.role,
                  parts: [{ text: m.content }]
                })),
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: GENERATION_CONFIG,
              };

              const apiResponse = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
              });

              if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                res.writeHead(apiResponse.status, { 'Content-Type': 'application/json' });
                res.end(errorText);
                return;
              }

              if (!stream) {
                // State the shape we rely on at the point of parsing; reading
                // properties off an untyped response is how silent contract
                // drift gets in.
                const data = await apiResponse.json() as {
                  candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                    finishReason?: string;
                  }>;
                  usageMetadata?: Record<string, unknown>;
                };
                const candidate = data.candidates?.[0];
                const explanation = candidate?.content?.parts
                  ?.map((part: { text?: string }) => part.text || '')
                  .join('');
                const finishReason = candidate?.finishReason;
                const usageMetadata = data.usageMetadata;
                const complete = Boolean(explanation) && successfulFinishReason(finishReason);
                res.writeHead(complete ? 200 : 502, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(
                  complete
                    ? { explanation, finishReason, usageMetadata }
                    : {
                        error: explanation
                          ? 'Generation ended before completion'
                          : 'Generation returned no answer',
                        finishReason,
                        usageMetadata,
                      }
                ));
                return;
              }

              res.writeHead(200, {
                'Content-Type': 'application/x-ndjson; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              });

              let finishReason: string | undefined;
              let usageMetadata: GenerationUsageMetadata | undefined;
              const emit = (event: Parameters<typeof encodeGenerationEvent>[0]) =>
                res.write(encodeGenerationEvent(event));

              try {
                if (!apiResponse.body) throw new Error('Gemini response body was empty');
                const reader = apiResponse.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                const consumeObjects = (objects: unknown[]) => {
                  for (const raw of objects) {
                    const data = raw as {
                      candidates?: Array<{
                        content?: { parts?: Array<{ text?: string }> };
                        finishReason?: string;
                      }>;
                      usageMetadata?: GenerationUsageMetadata;
                    };
                    const candidate = data.candidates?.[0];
                    const text = candidate?.content?.parts
                      ?.map((part) => part.text || '')
                      .join('');
                    if (text) emit({ type: 'text', text });
                    if (candidate?.finishReason) finishReason = candidate.finishReason;
                    if (data.usageMetadata) usageMetadata = data.usageMetadata;
                  }
                };

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const parsed = extractJsonObjects(buffer);
                  buffer = parsed.rest;
                  consumeObjects(parsed.objects);
                }

                buffer += decoder.decode();
                const parsed = extractJsonObjects(buffer);
                buffer = parsed.rest;
                consumeObjects(parsed.objects);
                if (buffer.replace(/\s/g, '').replaceAll(',', '').replaceAll('[', '').replaceAll(']', '')) {
                  throw new Error('Gemini stream ended with incomplete JSON');
                }

                if (successfulFinishReason(finishReason)) {
                  emit({ type: 'complete', finishReason, usageMetadata });
                } else {
                  emit({
                    type: 'error',
                    error: finishReason
                      ? 'Generation ended before completion'
                      : 'Generation ended without a finish reason',
                    finishReason,
                    usageMetadata,
                  });
                }
              } catch (error) {
                emit({
                  type: 'error',
                  error: error instanceof Error ? error.message : 'Generation stream failed',
                  finishReason,
                  usageMetadata,
                });
              }
              res.end();

            } catch (error) {
              const err = error as Error;
              console.error('Proxy Error:', err);
              if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
              res.end();
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
          // Only the framework is split out. A 'ui' chunk previously force-bundled three
          // Radix packages that no reachable component imported, shipping 40 kB of code no
          // user executed; the components that used them have been removed.
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
