import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateVideoSchema } from "@/lib/supabase/schema";
import { getVideoProvider } from "@/lib/video/registry";
import { buildWanPrompt } from "@/lib/providers/wanPrompt";
import type { ProjectRow } from "@/lib/supabase/mappers";

/**
 * POST /api/video/generate — starts a video-generation job through the
 * chosen provider (Hailuo / PixVerse / Kling / Wan 2.2) and saves the
 * prompt + job as "processing" on the project row. The actual result is
 * picked up later by GET /api/video/status, since these providers are
 * async (the video isn't ready in the same request).
 *
 * Two request shapes, both handled here:
 *  - `projectId` given (Phase 6 — Download Assets page, or a Wan retry
 *    on the same image): dispatch a video job for that already-saved
 *    project.
 *  - `projectId` omitted (first Wan generation on /dashboard/generate):
 *    `imageUrl` + `imagePublicId` + `productName` are required instead;
 *    a new project row is created first (with a placeholder ad kit,
 *    since no AI Generator text output exists for this flow).
 *
 * In both branches, an explicit `prompt` is used if given (Phase 6's
 * card always sends one); otherwise one is auto-generated from the
 * product name/category/style — this is what lets the Wan card on
 * /dashboard/generate skip writing its own prompt.
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

  const { projectId, uid, provider, imageUrl, imagePublicId, productName, category, language, style } =
    parsed.data;
  let prompt = parsed.data.prompt;

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Supabase isn't configured." },
      { status: 500 }
    );
  }

  let row: ProjectRow;

  if (projectId) {
    // Existing project — Phase 6's card, or a Wan retry on the same image.
    const { data: existing, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    row = existing as ProjectRow;
    if (row.user_id !== uid) {
      return NextResponse.json({ success: false, error: "This project doesn't belong to you." }, { status: 403 });
    }

    if (!prompt) {
      prompt = buildWanPrompt({
        productName: productName ?? row.product_name,
        category: category ?? row.category,
        style: style ?? "ugc",
      });
    }
  } else {
    // Phase 1 Wan flow — no project exists yet, create one from the
    // uploaded image + form fields.
    if (!imageUrl || !imagePublicId || !productName) {
      return NextResponse.json(
        { success: false, error: "imageUrl, imagePublicId and productName are required to start a new video." },
        { status: 400 }
      );
    }

    if (!prompt) {
      prompt = buildWanPrompt({ productName, category, style: style ?? "ugc" });
    }

    const placeholderAdKit = {
      analysis: "",
      hooks: [],
      script: "",
      klingPrompt: prompt,
      whatsappMessage: "",
      instagramCaption: "",
      hashtags: [],
    };

    const { data: created, error: createError } = await supabase
      .from("projects")
      .insert({
        user_id: uid,
        product_name: productName,
        category: category ?? "",
        language: language ?? "",
        image_url: imageUrl,
        image_public_id: imagePublicId,
        ad_kit: placeholderAdKit,
      })
      .select("*")
      .single();

    if (createError || !created) {
      console.error("[api/video/generate] project create", createError);
      return NextResponse.json({ success: false, error: "Could not create the project." }, { status: 500 });
    }

    row = created as ProjectRow;
  }

  if (!prompt) {
    // Unreachable in practice — both branches above resolve `prompt` —
    // kept as a guard so TypeScript (and any future caller) can rely on
    // it being a string from here on.
    return NextResponse.json({ success: false, error: "A prompt is required." }, { status: 400 });
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
    const result = await adapter.submit({ prompt, imageUrl: imageUrl ?? row.image_url });
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
    .eq("id", row.id);

  if (updateError) {
    console.error("[api/video/generate]", updateError);
    return NextResponse.json({ success: false, error: "Could not save the video job." }, { status: 500 });
  }

  return NextResponse.json({ success: true, jobId, status: "processing", projectId: row.id });
}
