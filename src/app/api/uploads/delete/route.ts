import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/server";

/**
 * Deletes a Cloudinary asset by public_id. This has to be a server route
 * because deleting requires a signed (authenticated) Cloudinary request —
 * the browser only ever holds the unsigned upload preset.
 *
 * TODO(Phase 3+): once uploads are tied to a signed-in user via Supabase,
 * verify the requester actually owns `publicId` before destroying it.
 * For now this is a single-tenant Phase 2 build with no such table yet.
 */
export async function POST(request: NextRequest) {
  let publicId: unknown;

  try {
    const body = await request.json();
    publicId = body?.publicId;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!publicId || typeof publicId !== "string") {
    return NextResponse.json({ error: "publicId is required." }, { status: 400 });
  }

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary isn't configured on the server (missing API key/secret)." },
      { status: 500 }
    );
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { error: `Cloudinary could not delete this asset (${result.result}).` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/uploads/delete]", error);
    return NextResponse.json({ error: "Unexpected server error while deleting." }, { status: 500 });
  }
}
