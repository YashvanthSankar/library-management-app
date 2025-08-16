import { Router } from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/books.controller.js";

const router = Router();

// GET all books
router.get("/", getAllBooks);

// GET book by ID
router.get("/:id", getBookById);

// POST create new book
router.post("/", createBook);

// PUT update book
router.put("/:id", updateBook);

// DELETE book
router.delete("/:id", deleteBook);

export default router;
