export const environment = {
  supabase: {
    // FIX: Replaced `import.meta.env` with `process.env` to access environment variables.
    url: (process.env as any).VITE_SUPABASE_URL,
    // FIX: Replaced `import.meta.env` with `process.env` to access environment variables.
    anonKey: (process.env as any).VITE_SUPABASE_ANON_KEY
  },
  evolutionApi: {
    // FIX: Replaced `import.meta.env` with `process.env` to access environment variables.
    url: (process.env as any).EVOLUTION_API_URL,
    // FIX: Replaced `import.meta.env` with `process.env` to access environment variables.
    apiKey: (process.env as any).EVOLUTION_MASTER_API_KEY
  },
  gemini: {
    // FIX: Updated comment to reflect the source of the Gemini API key.
    // API Key is now handled via process.env.API_KEY in GeminiService
  }
};
