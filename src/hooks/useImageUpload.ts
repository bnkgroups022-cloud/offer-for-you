"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { validateImageFile } from "@/lib/cloudinary/validate";
import { uploadImageToCloudinary } from "@/lib/cloudinary/upload";
import { deleteCloudinaryAsset } from "@/lib/cloudinary/delete";
import type { UploadItem } from "@/types/upload";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Owns the full lifecycle of the upload widget's file list: validation,
 * uploading with progress, and delete (which cancels an in-flight
 * upload, or calls Cloudinary's destroy API for an already-uploaded
 * file). Kept as a hook so the UI components stay pure rendering.
 */
export function useImageUpload() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const itemsRef = useRef<UploadItem[]>([]);
  itemsRef.current = items;

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const startUpload = useCallback(
    (item: UploadItem) => {
      const controller = new AbortController();
      controllersRef.current.set(item.id, controller);

      updateItem(item.id, { status: "uploading", progress: 0, error: undefined });

      uploadImageToCloudinary(item.file, {
        signal: controller.signal,
        onProgress: (percent) => updateItem(item.id, { progress: percent }),
      })
        .then((asset) => {
          updateItem(item.id, { status: "success", progress: 100, asset });
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          updateItem(item.id, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed.",
          });
        })
        .finally(() => {
          controllersRef.current.delete(item.id);
        });
    },
    [updateItem]
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const newItems: UploadItem[] = files.map((file) => {
        const validation = validateImageFile(file);
        const id = createId();
        const previewUrl = URL.createObjectURL(file);

        return validation.valid
          ? { id, file, previewUrl, status: "queued" as const, progress: 0 }
          : {
              id,
              file,
              previewUrl,
              status: "error" as const,
              progress: 0,
              error: validation.error,
            };
      });

      setItems((prev) => [...prev, ...newItems]);
      newItems.filter((item) => item.status === "queued").forEach(startUpload);
    },
    [startUpload]
  );

  const removeItem = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;

      // Cancel an in-flight upload rather than letting it finish unused.
      controllersRef.current.get(id)?.abort();
      controllersRef.current.delete(id);

      if (item.status === "success" && item.asset) {
        updateItem(id, { status: "deleting" });
        try {
          await deleteCloudinaryAsset(item.asset.publicId);
        } catch (error) {
          updateItem(id, {
            status: "error",
            error: error instanceof Error ? error.message : "Couldn't delete this file.",
          });
          return;
        }
      }

      URL.revokeObjectURL(item.previewUrl);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [updateItem]
  );

  // Revoke every remaining object URL on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  return { items, addFiles, removeItem };
}
