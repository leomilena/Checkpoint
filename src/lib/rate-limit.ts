const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Limitador de tasa en memoria (best-effort, por instancia). Suficiente para
 * mitigar abuso básico en un único proceso; en despliegues multi-instancia
 * se recomienda sustituirlo por un store compartido (Redis / Upstash).
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
