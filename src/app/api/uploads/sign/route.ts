import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary/server";

/**
 * POST /api/uploads/sign — issues a short-lived signature for a signed
 * Cloudinary upload. Used by the Wan 2.2 video flow (signed upload, per
 * spec) rather than the unsigned-preset upload the rest of the app uses
 * — the browser still uploads directly to Cloudinary, this route only
 * computes the signature server-side so CLOUDINARY_API_SECRET never
 * reaches the client.
 */
export async function POST() {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json(
      { success: false, error: "Cloudinary isn't configured on the server." },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "offer-for-you/wan-video";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return NextResponse.json({ success: true, timestamp, signature, apiKey, cloudName, folder });
}
