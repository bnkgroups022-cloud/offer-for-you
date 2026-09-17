export type UploadStatus = "queued" | "uploading" | "success" | "error" | "deleting";

export interface CloudinaryAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface UploadItem {
  id: string;
  file: File;
  /** Local blob: URL for an instant preview — revoked once the item is removed. */
  previewUrl: string;
  status: UploadStatus;
  /** 0-100 */
  progress: number;
  error?: string;
  asset?: CloudinaryAsset;
}
