import { z } from "zod";

/**
 * Validates the request body for POST /api/generate.
 */
export const generateRequestSchema = z.object({
  imageUrl: z.string().url("A valid uploaded product image is required."),
  productName: z.string().trim().min(1, "Product name is required.").max(120),
  category: z.string().trim().min(1, "Category is required.").max(60),
  language: z.string().trim().min(1, "Language is required.").max(40),
});

/**
 * Validates OpenAI's JSON response before we trust it. This is a
 * defense-in-depth check on top of Structured Outputs (json_schema
 * below) — the model/API should already conform, but this guarantees
 * the shape the UI renders never sees anything malformed.
 */
export const adKitSchema = z.object({
  analysis: z.string().min(1),
  hooks: z.array(z.string().min(1)).length(3),
  script: z.string().min(1),
  klingPrompt: z.string().min(1),
  whatsappMessage: z.string().min(1),
  instagramCaption: z.string().min(1),
  hashtags: z.array(z.string().min(1)).length(10),
});

export type AdKit = z.infer<typeof adKitSchema>;

/**
 * Mirrors adKitSchema as JSON Schema for OpenAI's Structured Outputs
 * feature (response_format: json_schema), so the model is constrained
 * to return exactly this shape.
 */
export const adKitJsonSchema = {
  name: "ad_kit",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      analysis: { type: "string" },
      hooks: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
      script: { type: "string" },
      klingPrompt: { type: "string" },
      whatsappMessage: { type: "string" },
      instagramCaption: { type: "string" },
      hashtags: { type: "array", items: { type: "string" }, minItems: 10, maxItems: 10 },
    },
    required: [
      "analysis",
      "hooks",
      "script",
      "klingPrompt",
      "whatsappMessage",
      "instagramCaption",
      "hashtags",
    ],
  },
} as const;
