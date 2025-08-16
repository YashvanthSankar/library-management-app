import { prisma } from "../utils/database.js";

// GET ALL LOANS
export const getAllLoans = async (req, res) => {
  try {
    const loans = await prisma.loan.findMany();
    res.json(loans);
  } catch (error) {
    console.error("Error fetching loans:", error);
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

    const validatedData = loanCreateSchema.parse(req.body);
    const { bookId, userId, dueDate } = validatedData;
    const loan = await prisma.loan.create({
      data: {
        book: { connect: { id: bookId } },
        user: { connect: { id: userId } },
        dueDate,
      },
    });
    res.status(201).json(loan);
  } catch (error) {
    console.error("Error creating loan:", error);
    res.status(500).json({ error: "Internal server error" });
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

    const loan = await prisma.loan.update({
      where: { id },
      data: updateData,
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true } },
      },
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