import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { uploadImage, type UploadKind } from "@/lib/storage";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_KINDS: UploadKind[] = ["cover", "inline", "avatar"];

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const kindRaw = formData?.get("kind");
  const kind: UploadKind = ALLOWED_KINDS.includes(kindRaw as UploadKind)
    ? (kindRaw as UploadKind)
    : "inline";

  const canUploadArticleImages = user.role === "WRITER" || user.role === "ADMIN";
  if (kind !== "avatar" && !canUploadArticleImages) {
    return NextResponse.json({ error: "No tienes permiso para subir imágenes" }, { status: 403 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no válido" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Formato de imagen no soportado" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "La imagen supera los 8MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(buffer, file.name, kind);

  return NextResponse.json({ url });
}
