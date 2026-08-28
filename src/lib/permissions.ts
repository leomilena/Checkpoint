import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
  banned?: boolean;
};

export function isAdmin(user?: SessionUser | null) {
  return user?.role === "ADMIN";
}

export function isWriterOrAdmin(user?: SessionUser | null) {
  return user?.role === "WRITER" || user?.role === "ADMIN";
}

export function canEditArticle(
  user: SessionUser | null | undefined,
  article: { authorId: string; coauthorIds?: string[] }
) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (user.role !== "WRITER") return false;
  return (
    article.authorId === user.id ||
    Boolean(article.coauthorIds?.includes(user.id))
  );
}

export function canLockComments(
  user: SessionUser | null | undefined,
  article: { authorId: string; coauthorIds?: string[] }
) {
  return canEditArticle(user, article);
}

export function canModerate(user?: SessionUser | null) {
  return isAdmin(user);
}

export const CATEGORY_COLOR_PALETTE = [
  "#FF8A65",
  "#F06292",
  "#4DD0E1",
  "#AED581",
];

export function nextCategoryColor(existingCount: number) {
  return CATEGORY_COLOR_PALETTE[existingCount % CATEGORY_COLOR_PALETTE.length];
}

export const TRASH_RETENTION_DAYS = 30;
