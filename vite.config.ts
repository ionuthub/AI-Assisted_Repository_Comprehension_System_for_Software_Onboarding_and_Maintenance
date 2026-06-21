import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
              "connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co wss://*.supabase.co https://api.github.com https://raw.githubusercontent.com; " +
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
              const { messages, skillLevel, systemContext, stream } = body;

              const GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

              if (!GEMINI_API_KEY) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'GEMINI_API_KEY not set in .env check log for setup instructions' }));
                return;
              }

              const skillPrompts: Record<string, string> = {
                beginner: "Explain like a friendly tutor using analogies.",
                intermediate: "Focus on patterns and 'why'.",
                advanced: "Senior architect view. Performance, trade-offs."
              };

              const systemPrompt = `You are a Code Tutor. Level: ${skillLevel}. 
              ${skillPrompts[skillLevel] || skillPrompts.beginner}
              ${systemContext ? `Project Context:\n${systemContext}` : ''}`;

              const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
              const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:${endpoint}?key=${GEMINI_API_KEY}`;

              const geminiPayload = {
                contents: messages.map((m: { role: string; content: string }) => ({
                  role: m.role,
                  parts: [{ text: m.content }]
                })),
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
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
                const data = await apiResponse.json();
                const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ explanation }));
                return;
              }

              res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              });

              if (apiResponse.body) {
                const reader = apiResponse.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });

                  while (true) {
                    let openBraces = 0;
                    let inString = false;
                    let escape = false;
                    let startIndex = -1;
                    let endIndex = -1;

                    for (let i = 0; i < buffer.length; i++) {
                      const char = buffer[i];
                      if (escape) { escape = false; continue; }
                      if (char === '\\') { escape = true; continue; }
                      if (char === '"') { inString = !inString; continue; }
                      if (inString) continue;

                      if (char === '{') {
                        if (openBraces === 0) startIndex = i;
                        openBraces++;
                      } else if (char === '}') {
                        openBraces--;
                        if (openBraces === 0 && startIndex !== -1) {
                          endIndex = i;
                          break;
                        }
                      }
                    }

                    if (endIndex !== -1) {
                      const jsonStr = buffer.substring(startIndex, endIndex + 1);
                      buffer = buffer.substring(endIndex + 1);
                      try {
                        const data = JSON.parse(jsonStr);
                        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) {
                          res.write(text);
                        }
                      } catch (e) {
                        void e; // Ignore JSON parsing errors for incomplete chunks
                      }
                    } else {
                      break;
                    }
                  }
                }
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
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
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
