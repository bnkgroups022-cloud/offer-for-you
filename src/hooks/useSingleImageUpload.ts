"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { validateImageFile } from "@/lib/cloudinary/validate";
import { uploadImageToCloudinary, uploadImageToCloudinarySigned } from "@/lib/cloudinary/upload";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/delete";
import type { CloudinaryAsset } from "@/types/upload";

export type SingleUploadStatus = "empty" | "uploading" | "success" | "error";

/**
 * A single-image variant of useImageUpload, for forms that need exactly
 * one product photo (like the AI Generator) rather than a managed list.
 * Reuses the same Cloudinary upload/delete/validate helpers from Phase 2.
 *
 * `signed: true` (used by the Wan 2.2 video flow) uploads via the signed
 * endpoint instead of the unsigned preset — every existing caller omits
 * this option and keeps its current unsigned behavior unchanged.
 */
export function useSingleImageUpload({ signed = false }: { signed?: boolean } = {}) {
  const [status, setStatus] = useState<SingleUploadStatus>("empty");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [asset, setAsset] = useState<CloudinaryAsset | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const assetRef = useRef<CloudinaryAsset | null>(null);
  previewUrlRef.current = previewUrl;
  assetRef.current = asset;

  const reset = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = null;

    const previousAsset = assetRef.current;
    const previousPreview = previewUrlRef.current;

    setStatus("empty");
    setProgress(0);
    setError(null);
    setPreviewUrl(null);
    setAsset(null);

    if (previousPreview) URL.revokeObjectURL(previousPreview);
    if (previousAsset) {
      // Best-effort: don't leave an orphaned file on Cloudinary, but
      // don't block the UI reset on it either.
      deleteCloudinaryAsset(previousAsset.publicId).catch(() => {});
    }
  }, []);

  const selectFile = useCallback((file: File) => {
    // Replace whatever was there before.
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    if (assetRef.current) deleteCloudinaryAsset(assetRef.current.publicId).catch(() => {});
    controllerRef.current?.abort();

    const validation = validateImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAsset(null);

    if (!validation.valid) {
      setStatus("error");
      setError(validation.error);
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    controllerRef.current = controller;

    const uploadFn = signed ? uploadImageToCloudinarySigned : uploadImageToCloudinary;

    uploadFn(file, {
      signal: controller.signal,
      onProgress: setProgress,
    })
      .then((uploaded) => {
        setAsset(uploaded);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload failed.");
      });
  }, [signed]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  return { status, progress, error, previewUrl, asset, selectFile, reset };
}
