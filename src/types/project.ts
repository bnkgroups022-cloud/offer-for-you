import type { GeneratedAdKit } from "@/types/generator";

/**
 * A saved ad kit, persisted to Supabase once the AI Generator (Phase 3)
 * finishes a successful run. camelCase on the app side; the DB table
 * (see src/lib/supabase/mappers.ts) uses snake_case columns.
 */
export interface Project {
  id: string;
  userId: string;
  productName: string;
  category: string;
  language: string;
  imageUrl: string;
  imagePublicId: string;
  adKit: GeneratedAdKit;
  createdAt: string;
}
