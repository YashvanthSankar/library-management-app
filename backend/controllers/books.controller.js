import { prisma } from "../utils/database.js";
import {
  bookCreateSchema,
  bookUpdateSchema,
} from "../utils/validationSchemas.js";
import { MESSAGES } from "../utils/constants.js";

// GET ALL BOOKS
export const getAllBooks = async (req, res) => {
  try {
    console.log("Fetching all books...");
    const books = await prisma.book.findMany({
      orderBy: { title: "asc" },
    });
    console.log("Books fetched successfully:", books.length);
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET BOOK BY ID
export const getBookById = async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: req.params.id },
      include: {
        loans: {
          where: { status: "active" },
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CREATE NEW BOOK
export const createBook = async (req, res) => {
  try {
    // Validate input data
    const validatedData = bookCreateSchema.parse(req.body);

    // Set availableCopies to equal totalCopies for new books
    validatedData.availableCopies = validatedData.totalCopies;

    const book = await prisma.book.create({
      data: validatedData,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    if (error.code === "P2002") {
      // Unique constraint violation
      return res
        .status(400)
        .json({ error: "Book with this ISBN already exists" });
    }

    console.error("Error creating book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE BOOK
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id },
    });

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Validate input data
    const validatedData = bookUpdateSchema.parse(req.body);

    const book = await prisma.book.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Error updating book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE BOOK
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book has active loans
    const activeLoans = await prisma.loan.count({
      where: {
        bookId: id,
        status: "active",
      },
    });

    if (activeLoans > 0) {
      return res.status(400).json({
        error: "Cannot delete book with active loans",
      });
    }

    const book = await prisma.book.delete({
      where: { id },
    });

    res.json({
      message: "Book deleted successfully",
      book,
    });
  } catch (error) {
    if (error.code === "P2025") {
      // Record not found
      return res.status(404).json({ error: "Book not found" });
    }

    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
