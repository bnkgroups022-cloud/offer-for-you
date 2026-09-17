/**
 * Client-side file validation, run before a file is ever sent to
 * Cloudinary. This is a UX/cost safeguard, not a security boundary —
 * the unsigned upload preset should also restrict formats and size on
 * Cloudinary's side (see README > Cloudinary Console Setup).
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export type FileValidationResult = { valid: true } | { valid: false; error: string };

export function validateImageFile(file: File): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { valid: false, error: "Unsupported file type. Use JPG, PNG or WebP." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return { valid: false, error: `File is too large. Maximum size is ${maxMb}MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: "This file is empty." };
  }

  return { valid: true };
}
