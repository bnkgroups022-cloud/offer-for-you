import { z } from "zod";

/**
 * Validates the body of POST /api/projects (saving a finished ad kit).
 * `uid` is the client-supplied Firebase UID — see the Security note in
 * src/app/api/projects/route.ts for what that trust model does and
 * doesn't guarantee.
 */
export const createProjectSchema = z.object({
  uid: z.string().min(1, "uid is required."),
  productName: z.string().min(1, "productName is required.").max(200),
  category: z.string().min(1, "category is required.").max(120),
  language: z.string().min(1, "language is required.").max(60),
  imageUrl: z.string().url("imageUrl must be a valid URL."),
  imagePublicId: z.string().min(1, "imagePublicId is required."),
  adKit: z.object({
    analysis: z.string(),
    hooks: z.array(z.string()),
    script: z.string(),
    klingPrompt: z.string(),
    whatsappMessage: z.string(),
    instagramCaption: z.string(),
    hashtags: z.array(z.string()),
  }),
});

/** Validates the ?uid= query param used by GET /api/projects. */
export const listProjectsQuerySchema = z.object({
  uid: z.string().min(1, "uid is required."),
});

/** Validates the ?uid= query param used by DELETE /api/projects/[id]. */
export const deleteProjectQuerySchema = z.object({
  uid: z.string().min(1, "uid is required."),
});

/** Validates the body of POST /api/video/generate. */
export const generateVideoSchema = z.object({
  projectId: z.string().min(1, "projectId is required."),
  uid: z.string().min(1, "uid is required."),
  provider: z.enum(["hailuo", "pixverse", "kling"]),
  prompt: z.string().min(1, "A prompt is required."),
  imageUrl: z.string().url().optional(),
});

/** Validates the query params used by GET /api/video/status. */
export const videoStatusQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required."),
  uid: z.string().min(1, "uid is required."),
});
