"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from "react";
import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/cloudinary/validate";

interface DropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
  /** Allow selecting/dropping more than one file at once. Defaults to true. */
  multiple?: boolean;
}

const maxMb = MAX_FILE_SIZE_BYTES / (1024 * 1024);

export function Dropzone({ onFilesSelected, disabled, multiple = true }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files?.length) {
      onFilesSelected(e.dataTransfer.files);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      onFilesSelected(e.target.files);
    }
    // Reset so selecting the same file again still fires onChange.
    e.target.value = "";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openPicker();
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
        disabled
          ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60"
          : "cursor-pointer bg-white/[0.02] hover:border-white/25",
        isDragging && !disabled ? "border-brand-accent bg-brand-accent/5" : "border-white/15"
      )}
    >
      <Icon
        name="upload"
        className={clsx("h-7 w-7", isDragging ? "text-brand-accent" : "text-slate-500")}
      />
      <p className="text-sm text-slate-300">
        <span className="font-medium text-white">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-slate-600">
        JPG, PNG or WebP, up to {maxMb}MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
