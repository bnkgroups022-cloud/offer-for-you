import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { createProjectSchema, listProjectsQuerySchema } from "@/lib/supabase/schema";
import { rowToProject, type ProjectRow } from "@/lib/supabase/mappers";

/**
 * Security note (same trust model as every other API route in this
 * project so far — see /api/generate and /api/uploads/delete):
 * there's no Firebase Admin SDK here to verify ID tokens server-side,
 * so `uid` is trusted as given by the client rather than verified
 * against a real session. That's an accepted limitation for this
 * single-tenant testing phase, called out again in the README. Before
 * this is production-hardened for multiple real users, verify the
 * Firebase ID token server-side and derive `uid` from it instead of
 * trusting the request body/query string.
 */

// GET /api/projects?uid=... — list a user's saved ad kits, newest first.
export async function GET(request: NextRequest) {
  const parsed = listProjectsQuerySchema.safeParse({
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
    .eq("user_id", parsed.data.uid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[api/projects GET]", error);
    return NextResponse.json({ success: false, error: "Could not load projects." }, { status: 500 });
  }

  const projects = (data as ProjectRow[]).map(rowToProject);
  return NextResponse.json({ success: true, projects });
}

// POST /api/projects — save a finished ad kit as a project.
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = createProjectSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." },
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

  const input = parsed.data;

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: input.uid,
      product_name: input.productName,
      category: input.category,
      language: input.language,
      image_url: input.imageUrl,
      image_public_id: input.imagePublicId,
      ad_kit: input.adKit,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[api/projects POST]", error);
    return NextResponse.json({ success: false, error: "Could not save the project." }, { status: 500 });
  }

  return NextResponse.json({ success: true, project: rowToProject(data as ProjectRow) });
}
