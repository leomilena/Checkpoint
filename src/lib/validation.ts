import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(60),
  email: z.string().email("Email no válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  bio: z.string().max(280).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const articleInputSchema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(220).optional().nullable(),
  body: z.string().max(60000),
  topicId: z.string().min(1),
  categoryId: z.string().min(1),
  coverImageUrl: z.string().url().optional().nullable(),
  coverGradient: z.number().int().min(0).max(5).optional(),
  coauthorIds: z.array(z.string()).optional(),
  writerRating: z.number().min(0).max(5).multipleOf(0.5).optional().nullable(),
});

export const commentSchema = z.object({
  articleId: z.string().min(1),
  body: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export const ratingSchema = z.object({
  articleId: z.string().min(1),
  value: z.number().min(0).max(5).multipleOf(0.5),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});
