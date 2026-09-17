import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { deleteProjectQuerySchema } from "@/lib/supabase/schema";
import { cloudinary } from "@/lib/cloudinary/server";
import type { ProjectRow } from "@/lib/supabase/mappers";

/**
 * DELETE /api/projects/[id]?uid=... — removes a saved project.
 *
 * Security note: `uid` is trusted as given (see the note in
 * src/app/api/projects/route.ts). Checking `project.user_id === uid`
 * below stops one signed-in user from accidentally deleting another
 * user's row by guessing an id, but it is NOT a real security boundary
 * — a malicious client could send any uid it wants. Real ownership
 * enforcement needs Firebase Admin ID-token verification server-side.
 *
 * Deletes the Cloudinary image first (best-effort — logged but not
 * blocking) and then the Supabase row, so a Cloudinary hiccup never
 * leaves an un-deletable "stuck" project behind.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const parsed = deleteProjectQuerySchema.safeParse({
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

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !project) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  const row = project as ProjectRow;
  if (row.user_id !== parsed.data.uid) {
    return NextResponse.json({ success: false, error: "This project doesn't belong to you." }, { status: 403 });
  }

  try {
    const result = await cloudinary.uploader.destroy(row.image_public_id, { resource_type: "image" });
    if (result.result !== "ok" && result.result !== "not found") {
      console.warn(`[api/projects DELETE] Cloudinary destroy returned "${result.result}" for ${row.image_public_id}`);
    }
  } catch (error) {
    // Don't block the delete on a Cloudinary failure — an orphaned image
    // is recoverable manually; a project the user can't delete is worse.
    console.error("[api/projects DELETE] Cloudinary cleanup failed:", error);
  }

  const { error: deleteError } = await supabase.from("projects").delete().eq("id", id);

  if (deleteError) {
    console.error("[api/projects DELETE]", deleteError);
    return NextResponse.json({ success: false, error: "Could not delete the project." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
