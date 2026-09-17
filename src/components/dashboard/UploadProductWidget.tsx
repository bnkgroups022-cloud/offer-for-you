"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Dropzone } from "@/components/upload/Dropzone";
import { UploadItemCard } from "@/components/upload/UploadItemCard";
import { useImageUpload } from "@/hooks/useImageUpload";

export function UploadProductWidget({ className }: { className?: string }) {
  const { items, addFiles, removeItem } = useImageUpload();
  const successCount = items.filter((item) => item.status === "success").length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 text-brand-accent">
            <Icon name="upload" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Upload Product</p>
            <p className="text-xs text-slate-500">Store product photos on Cloudinary</p>
          </div>
        </div>
        {successCount > 0 && (
          <span className="shrink-0 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
            {successCount} uploaded
          </span>
        )}
      </CardHeader>

      <Dropzone onFilesSelected={addFiles} />

      {items.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {items.map((item) => (
            <UploadItemCard key={item.id} item={item} onRemove={removeItem} />
          ))}
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-600">
        This is general photo storage. To turn a photo into an ad kit, use
        the{" "}
        <Link href="/dashboard/generate" className="text-brand-accent hover:underline">
          AI Generator
        </Link>{" "}
        — it uploads its own product photo as part of that flow.
      </p>
    </Card>
  );
}
