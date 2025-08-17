import { prisma } from "../utils/database.js";

// HELPER FUNCTION: Auto-generate fines for overdue loans
const autoGenerateOverdueFines = async (userId = null) => {
  try {
    const currentDate = new Date();

    // Find overdue loans
    const overdueLoans = await prisma.loan.findMany({
      where: {
        ...(userId && { userId }),
        status: "active",
        dueAt: {
          lt: currentDate,
        },
      },
      include: {
        user: true,
        book: { select: { title: true } },
      },
    });

    for (const loan of overdueLoans) {
      // Calculate days overdue
      const daysOverdue = Math.ceil(
        (currentDate - new Date(loan.dueAt)) / (1000 * 60 * 60 * 24)
      );

      // Check if fine already exists for this loan
      const existingFine = await prisma.fine.findFirst({
        where: {
          loanId: loan.id,
        },
      });

      if (!existingFine && daysOverdue > 0) {
        // Create fine (₹20 per day)
        const fineAmount = daysOverdue * 20;

        await prisma.fine.create({
          data: {
            userId: loan.userId,
            loanId: loan.id,
            amount: fineAmount,
            reason: `Overdue return - ${daysOverdue} day(s) late`,
            status: "UNPAID",
          },
        });

        console.log(
          `Generated fine of ₹${fineAmount} for loan ${loan.id} (${daysOverdue} days overdue)`
        );
      } else if (existingFine && existingFine.status === "UNPAID") {
        // Update existing fine amount if still unpaid
        const newFineAmount = daysOverdue * 20;

        if (newFineAmount !== existingFine.amount) {
          await prisma.fine.update({
            where: { id: existingFine.id },
            data: {
              amount: newFineAmount,
              reason: `Overdue return - ${daysOverdue} day(s) late`,
            },
          });
          console.log(`Updated fine to ₹${newFineAmount} for loan ${loan.id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error auto-generating fines:", error);
  }
};

// GET ALL LOANS
export const getAllLoans = async (req, res) => {
  try {
    // First, auto-generate fines for overdue loans
    await autoGenerateOverdueFines();

    const loans = await prisma.loan.findMany({
      include: {
        book: { select: { id: true, title: true, author: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET LOANS FOR SPECIFIC USER
export const getUserLoans = async (req, res) => {
  try {
    const { userId } = req.params;

    // Auto-generate fines for this user's overdue loans
    await autoGenerateOverdueFines(userId);

    const loans = await prisma.loan.findMany({
      where: { userId },
      include: {
        book: { select: { id: true, title: true, author: true } },
      },
      orderBy: { loanedAt: "desc" },
    });
    res.json(loans);
  } catch (error) {
    console.error("Error fetching user loans:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET LOAN BY ID
export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await prisma.loan.findUnique({
      where: { id },
    });
    if (!loan) {
      return res.status(404).json({ error: "Loan not found" });
    }
    res.json(loan);
  } catch (error) {
    console.error("Error fetching loan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// CREATE NEW LOAN
export const createLoan = async (req, res) => {
  try {
    const { bookId, userId, dueDate } = req.body;

    console.log("Creating loan with data:", { bookId, userId, dueDate });

    // Validate required fields
    if (!bookId || !userId) {
      console.log("Missing required fields:", {
        bookId: !!bookId,
        userId: !!userId,
      });
      return res.status(400).json({ error: "bookId and userId are required" });
    }

    // Check if book exists and has available copies
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    console.log(
      "Found book:",
      book
        ? {
            id: book.id,
            title: book.title,
            availableCopies: book.availableCopies,
          }
        : "Not found"
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.availableCopies <= 0) {
      return res
        .status(400)
        .json({ error: "No available copies of this book" });
    }

    // Check if user exists, create if not
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      // For production, we should not auto-create users with placeholder names
      return res.status(404).json({
        error:
          "User not found. Please ensure you are logged in with a valid account.",
      });
    }

    // BORROWING VALIDATION RULES
    // 1. Check if user status is active
    if (user.status !== "active") {
      return res.status(400).json({
        error:
          "Your account is not active. Please contact a librarian to activate your account.",
      });
    }

    // 2. Check if user has outstanding unpaid fines
    const outstandingFines = await prisma.fine.findFirst({
      where: {
        userId: userId,
        status: "UNPAID",
      },
    });

    if (outstandingFines) {
      return res.status(400).json({
        error:
          "Cannot borrow books while you have outstanding fines. Please pay all fines first.",
      });
    }

    // Check if user already has an active loan for this book
    const existingLoan = await prisma.loan.findFirst({
      where: {
        userId,
        bookId,
        status: "active",
      },
    });

    if (existingLoan) {
      console.log(
        "User already has active loan for this book:",
        existingLoan.id
      );
      return res
        .status(400)
        .json({ error: "You already have an active loan for this book" });
    }

    // Set default due date to 14 days from now if not provided
    const loanDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    console.log("Creating loan with due date:", loanDueDate);

    // Create loan and update book availability in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the loan
      const loan = await tx.loan.create({
        data: {
          bookId,
          userId,
          dueAt: loanDueDate,
          status: "active",
        },
        include: {
          book: { select: { id: true, title: true, author: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Update book available copies
      await tx.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1,
          },
        },
      });

      return loan;
    });

    console.log("Loan created successfully:", result.id);

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      loan: result,
    });
  } catch (error) {
    console.error("Error creating loan:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
};

// UPDATE LOAN
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { dueAt, status, returnedAt } = req.body;

    // Build update data object
    const updateData = {};

    // Update due date (for renewals/extensions)
    if (dueAt) {
      updateData.dueAt = new Date(dueAt);
    }

    // Update status (active, returned, overdue)
    if (status) {
      updateData.status = status;

      // If marking as returned, set returnedAt to now
      if (status === "returned" && !returnedAt) {
        updateData.returnedAt = new Date();
      }
    }

    // Explicitly set return date
    if (returnedAt) {
      updateData.returnedAt = new Date(returnedAt);
      // If setting return date, also mark as returned
      if (!status) {
        updateData.status = "returned";
      }
    }

    const loan = await prisma.$transaction(async (tx) => {
      // Update the loan
      const updatedLoan = await tx.loan.update({
        where: { id },
        data: updateData,
        include: {
          book: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // If marking as returned, increment book's available copies
      if (updateData.status === "returned") {
        await tx.book.update({
          where: { id: updatedLoan.bookId },
          data: {
            availableCopies: {
              increment: 1,
            },
          },
        });
      }

      return updatedLoan;
    });

    res.json(loan);
  } catch (error) {
    console.error("Error updating loan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.loan.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting loan:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
