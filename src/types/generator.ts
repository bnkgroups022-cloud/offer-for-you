export interface GenerateInput {
  imageUrl: string;
  /** Cloudinary public_id for the uploaded photo — carried through so a
   *  successful generation can be saved as a Project (Phase 4) without
   *  re-uploading, and so its image can be cleaned up on delete. Not
   *  sent to OpenAI; the API route strips unrecognized keys via zod. */
  imagePublicId: string;
  productName: string;
  /** Human-readable label, e.g. "Fashion & Apparel" — already resolved
   *  from the form's select (including the "Other" free-text case). */
  category: string;
  /** Human-readable label, e.g. "Hinglish (Hindi + English)". */
  language: string;
}

export interface GeneratedAdKit {
  analysis: string;
  hooks: string[];
  script: string;
  klingPrompt: string;
  whatsappMessage: string;
  instagramCaption: string;
  hashtags: string[];
}
