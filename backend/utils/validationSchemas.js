import { z } from "zod";
import { LOAN_STATUS } from "./constants.js";

// User validation schemas
export const userCreateSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100),
  role: z.enum(["librarian", "borrower"]).default("borrower"),
  image: z.string().url().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["librarian", "borrower"]).optional(),
});

// Book validation schemas
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

// Loan validation schemas
export const loanCreateSchema = z.object({
  bookId: z.string().cuid("Invalid book ID"),
  dueAt: z.date().min(new Date(), "Due date must be in the future"),
});

export const loanUpdateSchema = z.object({
  status: z.enum(["active", "returned", "overdue"]).optional(),
  returnedAt: z.date().optional(),
});

// Fine validation schemas
export const fineCreateSchema = z.object({
  loanId: z.string().cuid("Invalid loan ID"),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().min(1, "Reason is required").default("overdue"),
});

export const fineUpdateSchema = z.object({
  status: z.enum(["unpaid", "paid"]),
});

// Search and filter schemas
export const bookSearchSchema = z.object({
  query: z.string().min(1).optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const loanFilterSchema = z.object({
  status: z.enum(["active", "returned", "overdue"]).optional(),
  userId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
