import crypto from "crypto";

/**
 * Upload de fichiers vers Cloudinary via l'API REST (sans SDK).
 * Activé uniquement si CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET sont définis ;
 * sinon les appelants utilisent le repli disque local.
 */

const configured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

/** Signature SHA1 des paramètres triés + secret (protocole d'upload signé Cloudinary). */
function signParams(params) {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(sorted + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");
}

/**
 * Envoie un buffer vers Cloudinary.
 * @returns {{ url: string, publicId: string, bytes: number } | null} null si non configuré.
 */
export async function uploadBuffer(buffer, { filename = "fichier", resourceType = "auto", folder = "etdv" } = {}) {
  if (!configured()) return null;

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ folder, timestamp });

  const form = new FormData();
  form.append("file", new Blob([buffer]), filename);
  form.append("api_key", process.env.CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: form }
  );
  const json = await response.json().catch(() => null);
  if (!response.ok || !json?.secure_url) {
    throw new Error(json?.error?.message || "Upload Cloudinary échoué.");
  }
  return { url: json.secure_url, publicId: json.public_id, bytes: json.bytes ?? 0 };
}
