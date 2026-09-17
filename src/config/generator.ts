/**
 * Options shown in the AI Generator form. Values are internal keys used
 * only for the <select>; labels are what's actually sent to the model
 * (see GeneratorForm, which resolves the label before calling onGenerate).
 */
export const CATEGORY_OPTIONS = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "home", label: "Home & Kitchen" },
  { value: "health", label: "Health & Wellness" },
  { value: "food", label: "Food & Beverages" },
  { value: "baby", label: "Toys & Baby Products" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "jewelry", label: "Jewelry & Accessories" },
  { value: "other", label: "Other" },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish (Hindi + English)" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "bengali", label: "Bengali" },
  { value: "marathi", label: "Marathi" },
] as const;
