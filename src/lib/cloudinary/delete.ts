/**
 * Client helper for the "Delete" feature: asks our own API route to
 * destroy the asset on Cloudinary (deleting requires a signed request,
 * which can only safely happen server-side — see
 * src/app/api/uploads/delete/route.ts).
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  const response = await fetch("/api/uploads/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Couldn't delete this file. Please try again.");
  }
}
