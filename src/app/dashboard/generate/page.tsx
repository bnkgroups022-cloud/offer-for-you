"use client";

import { useEffect, useRef, useState } from "react";
import { GeneratorForm } from "@/components/generator/GeneratorForm";
import { GeneratorResults } from "@/components/generator/GeneratorResults";
import { WanVideoGeneratorCard } from "@/components/generator/WanVideoGeneratorCard";
import { useAdGenerator } from "@/hooks/useAdGenerator";
import { useAuth } from "@/hooks/useAuth";
import { createProject } from "@/lib/projects/client";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function GeneratePage() {
  const { user } = useAuth();
  const { status, result, error, lastInput, generate, reset } = useAdGenerator();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Guards against saving the same successful result twice (e.g. if this
  // effect re-runs from an unrelated state change while status stays
  // "success").
  const savedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "success" || !result || !lastInput || !user) return;

    // Use the image's public id as the "have we saved this one" key —
    // simple and unique per generation.
    if (savedForRef.current === lastInput.imagePublicId) return;
    savedForRef.current = lastInput.imagePublicId;

    setSaveState("saving");
    setSaveError(null);

    createProject({
      uid: user.uid,
      productName: lastInput.productName,
      category: lastInput.category,
      language: lastInput.language,
      imageUrl: lastInput.imageUrl,
      imagePublicId: lastInput.imagePublicId,
      adKit: result,
    })
      .then(() => setSaveState("saved"))
      .catch((err: unknown) => {
        setSaveState("error");
        setSaveError(err instanceof Error ? err.message : "Could not save this project.");
      });
  }, [status, result, lastInput, user]);

  function handleReset() {
    reset();
    setSaveState("idle");
    setSaveError(null);
    savedForRef.current = null;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">AI Generator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Upload a product photo, tell us a bit about it, and get a complete
          ad kit back in one pass. Every result is saved to{" "}
          <span className="text-slate-300">My Projects</span> automatically.
        </p>
      </div>

      {status === "success" && (
        <div className="mb-4">
          {saveState === "saving" && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
              Saving this ad kit to your projects…
            </div>
          )}
          {saveState === "saved" && (
            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              Saved to My Projects.
            </div>
          )}
          {saveState === "error" && (
            <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {saveError ?? "Could not save this project."} Your ad kit above is unaffected — you can still
              copy or note it down manually.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <GeneratorForm onGenerate={generate} isGenerating={status === "generating"} />
        <GeneratorResults
          status={status}
          result={result}
          error={error}
          videoStyle={lastInput?.videoStyle}
          onReset={handleReset}
        />
      </div>

      <div className="mt-6">
        <WanVideoGeneratorCard />
      </div>
    </div>
  );
}
