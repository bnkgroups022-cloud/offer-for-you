"use client";

import { Dropzone } from "@/components/upload/Dropzone";
import { ProgressBar } from "@/components/upload/ProgressBar";
import type { useSingleImageUpload } from "@/hooks/useSingleImageUpload";

type ImageState = ReturnType<typeof useSingleImageUpload>;

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductImagePicker({ image }: { image: ImageState }) {
  function handleFilesSelected(files: FileList | File[]) {
    const file = Array.from(files)[0];
    if (file) image.selectFile(file);
  }

  if (image.previewUrl) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: preview */}
          <img
            src={image.previewUrl}
            alt="Product preview"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => image.reset()}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
          >
            <CloseIcon />
          </button>
        </div>

        {image.status === "uploading" && <ProgressBar percent={image.progress} />}
        {image.status === "error" && <p className="text-xs text-red-400">{image.error}</p>}
        {image.status === "success" && <p className="text-xs text-emerald-400">Image uploaded ✓</p>}
      </div>
    );
  }

  return <Dropzone onFilesSelected={handleFilesSelected} multiple={false} />;
}
