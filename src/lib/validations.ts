import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.string().optional(),
});

export const chatCompletionSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
  max_tokens: z.number().int().positive().optional(),
});

export const createCheckoutSchema = z.object({
  packageId: z.string().min(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const tokenPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokens: z.number().int().positive(),
  price: z.number().positive(),
  bonus: z.number().int().min(0).default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChatCompletionInput = z.infer<typeof chatCompletionSchema>;
export type TokenPackage = z.infer<typeof tokenPackageSchema>;