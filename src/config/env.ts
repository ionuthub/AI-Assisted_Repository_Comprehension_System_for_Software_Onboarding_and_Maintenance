const requiredEnvVars = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

type RequiredEnvVar = typeof requiredEnvVars[number];

type EnvMap = Record<RequiredEnvVar, string>;

const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

if (missingVars.length > 0) {
  const formattedList = missingVars.join(", ");
  console.warn(`[Warning] Missing required environment variables: ${formattedList}. Falling back to client-only mocks for offline execution.`);
}

export const env: EnvMap = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
};
