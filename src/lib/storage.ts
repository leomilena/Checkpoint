import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

const BUCKET = process.env.S3_BUCKET;
const REGION = process.env.S3_REGION ?? "auto";
const ENDPOINT = process.env.S3_ENDPOINT;
const ACCESS_KEY = process.env.S3_ACCESS_KEY_ID;
const SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY;
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_BASE_URL;

const s3Configured = Boolean(BUCKET && ACCESS_KEY && SECRET_KEY);

const client = s3Configured
  ? new S3Client({
      region: REGION,
      endpoint: ENDPOINT,
      forcePathStyle: Boolean(ENDPOINT),
      credentials: { accessKeyId: ACCESS_KEY!, secretAccessKey: SECRET_KEY! },
    })
  : null;

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type UploadKind = "cover" | "inline" | "avatar";

const MAX_DIMENSIONS: Record<UploadKind, { width: number; height: number }> = {
  cover: { width: 1600, height: 900 },
  inline: { width: 1400, height: 1400 },
  avatar: { width: 400, height: 400 },
};

/**
 * Sube una imagen redimensionada a S3/R2/MinIO si hay credenciales configuradas;
 * si no, la guarda en disco local bajo /public/uploads (modo desarrollo sin infra externa).
 */
export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  kind: UploadKind = "inline"
): Promise<string> {
  const { width, height } = MAX_DIMENSIONS[kind];

  const resized = await sharp(buffer)
    .rotate()
    .resize({ width, height, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const ext = "webp";
  const safeName = path
    .basename(originalName, path.extname(originalName))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .slice(0, 40);
  const key = `${kind}/${randomUUID()}-${safeName || "imagen"}.${ext}`;

  if (client && BUCKET) {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: resized,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    if (PUBLIC_BASE_URL) {
      return `${PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`;
    }
    return `${ENDPOINT?.replace(/\/$/, "")}/${BUCKET}/${key}`;
  }

  // Fallback local para desarrollo sin S3 configurado.
  const destDir = path.join(LOCAL_UPLOAD_DIR, kind);
  await fs.mkdir(destDir, { recursive: true });
  const fileName = `${randomUUID()}-${safeName || "imagen"}.${ext}`;
  await fs.writeFile(path.join(destDir, fileName), resized);
  return `/uploads/${kind}/${fileName}`;
}

export const isS3Configured = s3Configured;
