import type { Project } from "@/types/project";
import type { GeneratedAdKit } from "@/types/generator";

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
  };
}
