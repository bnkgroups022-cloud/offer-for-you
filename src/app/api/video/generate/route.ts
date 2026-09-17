import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateVideoSchema } from "@/lib/supabase/schema";
import { getVideoProvider } from "@/lib/video/registry";
import type { ProjectRow } from "@/lib/supabase/mappers";

/**
 * POST /api/video/generate — starts a video-generation job for a saved
 * project through the chosen provider (Hailuo / PixVerse / Kling) and
 * saves the prompt + job as "processing" on the project row. The actual
 * result is picked up later by GET /api/video/status, since these
 * providers are async (the video isn't ready in the same request).
 *
 * Same trust model as every other route in this project so far (see the
 * Security notes in /api/projects) — `uid` is trusted as given by the
 * client, not verified server-side against a real session.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = generateVideoSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { projectId, uid, provider, prompt, imageUrl } = parsed.data;

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Supabase isn't configured." },
      { status: 500 }
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  const row = existing as ProjectRow;
  if (row.user_id !== uid) {
    return NextResponse.json({ success: false, error: "This project doesn't belong to you." }, { status: 403 });
  }

  const adapter = getVideoProvider(provider);
  if (!adapter.isConfigured()) {
    return NextResponse.json(
      { success: false, error: `${adapter.label} isn't configured yet.` },
      { status: 501 }
    );
  }

  let jobId: string;
  try {
    const result = await adapter.submit({ prompt, imageUrl });
    jobId = result.jobId;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not start video generation." },
      { status: 502 }
    );
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      video_provider: provider,
      video_prompt: prompt,
      video_status: "processing",
      video_job_id: jobId,
      video_url: null,
      video_error: null,
    })
    .eq("id", projectId);

  if (updateError) {
    console.error("[api/video/generate]", updateError);
    return NextResponse.json({ success: false, error: "Could not save the video job." }, { status: 500 });
  }

  return NextResponse.json({ success: true, jobId, status: "processing" });
}
