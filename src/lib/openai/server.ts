import OpenAI from "openai";

let client: OpenAI | null = null;

/**
 * Lazily creates the OpenAI client so a missing API key doesn't crash
 * the app at import/build time — the route that calls this catches the
 * thrown error and returns a clear message instead.
 */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local — see README > OpenAI Setup."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/** Must be a vision-capable model that supports Structured Outputs. */
export const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-4o";
