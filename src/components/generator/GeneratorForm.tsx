"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProductImagePicker } from "@/components/generator/ProductImagePicker";
import { CATEGORY_OPTIONS, LANGUAGE_OPTIONS } from "@/config/generator";
import { useSingleImageUpload } from "@/hooks/useSingleImageUpload";
import type { GenerateInput } from "@/types/generator";

const fieldLabel = "mb-1.5 block text-xs font-medium text-slate-400";
const fieldControl =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-accent focus:outline-none";

export function GeneratorForm({
  onGenerate,
  isGenerating,
}: {
  onGenerate: (input: GenerateInput) => void;
  isGenerating: boolean;
}) {
  const image = useSingleImageUpload();
  const [productName, setProductName] = useState("");
  const [categoryValue, setCategoryValue] = useState<string>(CATEGORY_OPTIONS[0].value);
  const [customCategory, setCustomCategory] = useState("");
  const [language, setLanguage] = useState<string>(LANGUAGE_OPTIONS[0].value);

  const categoryLabel = useMemo(() => {
    if (categoryValue === "other") return customCategory.trim();
    return CATEGORY_OPTIONS.find((option) => option.value === categoryValue)?.label ?? "";
  }, [categoryValue, customCategory]);

  const languageLabel = useMemo(
    () => LANGUAGE_OPTIONS.find((option) => option.value === language)?.label ?? language,
    [language]
  );

  const isValid =
    image.status === "success" &&
    !!image.asset &&
    productName.trim().length > 0 &&
    categoryLabel.length > 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || !image.asset) return;

    onGenerate({
      imageUrl: image.asset.secureUrl,
      imagePublicId: image.asset.publicId,
      productName: productName.trim(),
      category: categoryLabel,
      language: languageLabel,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="flex flex-col gap-4 lg:sticky lg:top-20">
        <div>
          <span className={fieldLabel}>Product Image</span>
          <ProductImagePicker image={image} />
        </div>

        <div>
          <label htmlFor="productName" className={fieldLabel}>
            Product Name
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Wireless Neckband Earphones"
            maxLength={120}
            className={fieldControl}
          />
        </div>

        <div>
          <label htmlFor="category" className={fieldLabel}>
            Category
          </label>
          <select
            id="category"
            value={categoryValue}
            onChange={(e) => setCategoryValue(e.target.value)}
            className={fieldControl}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {categoryValue === "other" && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Describe the category"
              maxLength={60}
              className={`${fieldControl} mt-2`}
            />
          )}
        </div>

        <div>
          <label htmlFor="language" className={fieldLabel}>
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={fieldControl}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="lg" fullWidth isLoading={isGenerating} disabled={!isValid}>
          Generate Ad Kit
        </Button>

        {!isValid && !isGenerating && (
          <p className="text-center text-xs text-slate-600">
            Upload a product photo and fill in the name and category to continue.
          </p>
        )}
      </Card>
    </form>
  );
}
