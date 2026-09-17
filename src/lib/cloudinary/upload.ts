import type { CloudinaryAsset } from "@/types/upload";

interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  error?: { message: string };
}

/**
 * Uploads a single file straight from the browser to Cloudinary's
 * unsigned upload endpoint, using XMLHttpRequest (rather than fetch) so
 * we get real upload-progress events for the progress bar.
 */
export function uploadImageToCloudinary(
  file: File,
  { onProgress, signal }: UploadOptions = {}
): Promise<CloudinaryAsset> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return new Promise((resolve, reject) => {
    if (!cloudName || !uploadPreset) {
      reject(
        new Error(
          "Cloudinary isn't configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local."
        )
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let response: CloudinaryUploadResponse | null = null;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Upload failed: couldn't parse Cloudinary's response."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && response) {
        resolve({
          publicId: response.public_id,
          secureUrl: response.secure_url,
          width: response.width,
          height: response.height,
          bytes: response.bytes,
          format: response.format,
        });
      } else {
        reject(new Error(response?.error?.message || "Upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed due to a network error."));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.send(formData);
  });
}

interface SignedUploadCredentials {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

async function getSignedUploadCredentials(): Promise<SignedUploadCredentials> {
  const response = await fetch("/api/uploads/sign", { method: "POST" });
  const body: SignedUploadCredentials & { success: boolean; error?: string } = await response.json();

  if (!response.ok || !body.success) {
    throw new Error(body.error ?? "Could not get an upload signature.");
  }

  return body;
}

/**
 * Signed variant of uploadImageToCloudinary, used by the Wan 2.2 video
 * flow (per spec: "Use signed upload"). Fetches a short-lived signature
 * from /api/uploads/sign, then uploads straight to Cloudinary — still
 * browser -> Cloudinary directly, not proxied through our server — using
 * that signature instead of an unsigned preset.
 */
export async function uploadImageToCloudinarySigned(
  file: File,
  { onProgress, signal }: UploadOptions = {}
): Promise<CloudinaryAsset> {
  const creds = await getSignedUploadCredentials();

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", creds.apiKey);
    formData.append("timestamp", String(creds.timestamp));
    formData.append("signature", creds.signature);
    formData.append("folder", creds.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      let response: CloudinaryUploadResponse | null = null;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Upload failed: couldn't parse Cloudinary's response."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && response) {
        resolve({
          publicId: response.public_id,
          secureUrl: response.secure_url,
          width: response.width,
          height: response.height,
          bytes: response.bytes,
          format: response.format,
        });
      } else {
        reject(new Error(response?.error?.message || "Upload failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed due to a network error."));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.send(formData);
  });
}
