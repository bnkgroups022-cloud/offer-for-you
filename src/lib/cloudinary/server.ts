import { v2 as cloudinary } from "cloudinary";

/**
 * Server-only Cloudinary Admin SDK config. Never import this file from
 * a "use client" component — it reads CLOUDINARY_API_SECRET, which must
 * never reach the browser bundle.
 */
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };
