import { z } from "zod";

// Book validation schemas (only ones actually used)
export const bookCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  author: z.string().min(1, "Author is required").max(255),
  isbn: z.string().min(10).max(17).optional(),
  category: z.string().max(100).optional(),
  totalCopies: z
    .number()
    .int()
    .positive("Total copies must be positive")
    .default(1),
});

export const bookUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().min(1).max(255).optional(),
  isbn: z.string().min(10).max(17).optional(),
  category: z.string().max(100).optional(),
  totalCopies: z.number().int().positive().optional(),
});
