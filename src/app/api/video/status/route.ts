import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { videoStatusQuerySchema } from "@/lib/supabase/schema";
import { getVideoProvider } from "@/lib/video/registry";
import { rowToProject, type ProjectRow } from "@/lib/supabase/mappers";
import type { VideoProviderId } from "@/types/video";

/**
 * GET /api/video/status?projectId=...&uid=... — polls the provider for a
 * project's in-flight video job. If the job has settled (completed or
 * failed) since the last check, persists that result to Supabase (this is
 * where video_url actually gets saved) before returning the up-to-date
 * project. If there's no job in flight, just returns the project as-is —
 * this route is safe to call any time, not only while "processing".
 *
 * Extended beyond the platform default: the "Free" (Hugging Face
 * ZeroGPU) provider's checkStatus() can block up to ~8s reading an SSE
 * stream per call (see src/lib/providers/huggingface.ts) — give it room.
 */
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const parsed = videoStatusQuerySchema.safeParse({
    projectId: request.nextUrl.searchParams.get("projectId") ?? undefined,
    uid: request.nextUrl.searchParams.get("uid") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Supabase isn't configured." },
      { status: 500 }
    );
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", parsed.data.projectId)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  const row = data as ProjectRow;
  if (row.user_id !== parsed.data.uid) {
    return NextResponse.json({ success: false, error: "This project doesn't belong to you." }, { status: 403 });
  }

  if (row.video_status !== "processing" || !row.video_job_id || !row.video_provider) {
    return NextResponse.json({ success: true, project: rowToProject(row) });
  }

  const adapter = getVideoProvider(row.video_provider as VideoProviderId);

  let statusResult;
  try {
    statusResult = await adapter.checkStatus(row.video_job_id);
  } catch (err) {
    statusResult = {
      status: "failed" as const,
      error: err instanceof Error ? err.message : "Status check failed.",
    };
  }

  if (statusResult.status === "processing") {
    return NextResponse.json({ success: true, project: rowToProject(row) });
  }

  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({
      video_status: statusResult.status,
      video_url: statusResult.status === "completed" ? statusResult.videoUrl ?? null : null,
      video_error: statusResult.status === "failed" ? statusResult.error ?? "Generation failed." : null,
    })
    .eq("id", row.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    console.error("[api/video/status]", updateError);
    return NextResponse.json({ success: false, error: "Could not save video status." }, { status: 500 });
  }

  return NextResponse.json({ success: true, project: rowToProject(updated as ProjectRow) });
}
