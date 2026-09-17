import type { Project } from "@/types/project";
import type { GeneratedAdKit } from "@/types/generator";
import type { VideoProviderId, VideoStatus } from "@/types/video";

/** Raw shape of a row in the `projects` table (snake_case columns). */
export interface ProjectRow {
  id: string;
  user_id: string;
  product_name: string;
  category: string;
  language: string;
  image_url: string;
  image_public_id: string;
  ad_kit: GeneratedAdKit;
  created_at: string;
  video_provider: string | null;
  video_prompt: string | null;
  video_status: string | null;
  video_job_id: string | null;
  video_url: string | null;
  video_error: string | null;
}

export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    productName: row.product_name,
    category: row.category,
    language: row.language,
    imageUrl: row.image_url,
    imagePublicId: row.image_public_id,
    adKit: row.ad_kit,
    createdAt: row.created_at,
    video: {
      provider: (row.video_provider as VideoProviderId | null) ?? null,
      prompt: row.video_prompt ?? null,
      status: (row.video_status as VideoStatus | null) ?? "idle",
      jobId: row.video_job_id ?? null,
      url: row.video_url ?? null,
      error: row.video_error ?? null,
    },
  };
}
