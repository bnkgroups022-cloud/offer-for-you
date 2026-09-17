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

/**
 * Validates the body of POST /api/video/generate. Two modes, both
 * validated by this one schema (the route branches on whether
 * `projectId` is present):
 *  - Existing project (Phase 6, e.g. the Download Assets page): send
 *    `projectId` + `prompt`.
 *  - Direct image -> video, no project yet (Phase 1 Wan flow on
 *    /dashboard/generate): omit `projectId`, send `imageUrl`,
 *    `imagePublicId` and `productName` instead — the route creates the
 *    project row itself and auto-generates the prompt if none is given.
 */
export const generateVideoSchema = z.object({
  projectId: z.string().min(1).optional(),
  uid: z.string().min(1, "uid is required."),
  provider: z.enum(["hailuo", "pixverse", "kling", "wan"]),
  prompt: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().min(1).optional(),
  productName: z.string().min(1).max(200).optional(),
  category: z.string().max(120).optional(),
  language: z.string().max(60).optional(),
  style: z.enum(["ugc", "cinematic", "luxury", "tech"]).optional(),
});

/** Validates the query params used by GET /api/video/status. */
export const videoStatusQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required."),
  uid: z.string().min(1, "uid is required."),
});
