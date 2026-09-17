"use client";

import { useCallback, useState } from "react";
import type { GenerateInput, GeneratedAdKit } from "@/types/generator";

export type GeneratorStatus = "idle" | "generating" | "success" | "error";

interface GenerateResponse {
  success: boolean;
  result?: GeneratedAdKit;
  error?: string;
}

export function useAdGenerator() {
  const [status, setStatus] = useState<GeneratorStatus>("idle");
  const [result, setResult] = useState<GeneratedAdKit | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Kept alongside `result` so the page can auto-save the finished ad kit
  // to Supabase (Phase 4) without the form having to hold onto it too.
  const [lastInput, setLastInput] = useState<GenerateInput | null>(null);

  const generate = useCallback(async (input: GenerateInput) => {
    setStatus("generating");
    setError(null);
    setLastInput(input);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const body: GenerateResponse = await response.json();

      if (!response.ok || !body.success || !body.result) {
        throw new Error(body.error ?? "Generation failed. Please try again.");
      }

      setResult(body.result);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed. Please try again.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setLastInput(null);
  }, []);

  return { status, result, error, lastInput, generate, reset };
}
