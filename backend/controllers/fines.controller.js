import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/fines - Get all fines (for librarians)
export const getAllFines = async (req, res) => {
  try {
    const { status, userId } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;

    const fines = await prisma.fine.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { 
          include: { 
            book: { select: { id: true, title: true, author: true } } 
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: fines,
    });
  } catch (error) {
    console.error("Error fetching fines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fines",
      error: error.message,
    });
  }
};

// GET /api/fines/user/:userId - Get fines for specific user
export const getUserFines = async (req, res) => {
  try {
    const { userId } = req.params;

    const fines = await prisma.fine.findMany({
      where: { userId },
      include: {
        loan: { 
          include: { 
            book: { select: { id: true, title: true, author: true } } 
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: fines,
    });
  } catch (error) {
    console.error("Error fetching user fines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user fines",
      error: error.message,
    });
  }
};

// GET /api/fines/:id - Get specific fine details
export const getFineById = async (req, res) => {
  try {
    const { id } = req.params;

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { 
          include: { 
            book: { select: { id: true, title: true, author: true } } 
          } 
        },
      },
    });

    if (!fine) {
      return res.status(404).json({
        success: false,
        message: "Fine not found",
      });
    }

    res.json({
      success: true,
      data: fine,
    });
  } catch (error) {
    console.error("Error fetching fine:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fine",
      error: error.message,
    });
  }
};

// POST /api/fines - Create a new fine
export const createFine = async (req, res) => {
  try {
    const { userId, loanId, amount, reason } = req.body;

    if (!userId || !loanId || !amount) {
      return res.status(400).json({
        success: false,
        message: "userId, loanId, and amount are required",
      });
    }

    const fine = await prisma.fine.create({
      data: {
        userId,
        loanId,
        amount: parseFloat(amount),
        reason: reason || "overdue",
        status: "unpaid",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { 
          include: { 
            book: { select: { id: true, title: true, author: true } } 
          } 
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Fine created successfully",
      data: fine,
    });
  } catch (error) {
    console.error("Error creating fine:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create fine",
      error: error.message,
    });
  }
};

// PATCH /api/fines/:id/status - Update fine status (pay/unpay)
export const updateFineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["paid", "unpaid"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status (paid/unpaid) is required",
      });
    }

    const fine = await prisma.fine.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        loan: { 
          include: { 
            book: { select: { id: true, title: true, author: true } } 
          } 
        },
      },
    });

    res.json({
      success: true,
      message: `Fine marked as ${status}`,
      data: fine,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Fine not found",
      });
    }

    console.error("Error updating fine status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update fine status",
      error: error.message,
    });
  }
};

// DELETE /api/fines/:id - Delete a fine
export const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.fine.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Fine deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Fine not found",
      });
    }

    console.error("Error deleting fine:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete fine",
      error: error.message,
    });
  }
};

// POST /api/fines/auto-generate - Auto-generate fines for overdue books
export const autoGenerateFines = async (req, res) => {
  try {
    const fineAmountPerDay = 10.0; // ₹10 per day overdue
    const now = new Date();

    // Find all overdue loans that don't have fines yet
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: "active",
        dueAt: { lt: now },
        fines: { none: {} }, // No existing fines
      },
      include: {
        book: { select: { title: true } },
        user: { select: { name: true } },
      },
    });

    const createdFines = [];

    for (const loan of overdueLoans) {
      const daysOverdue = Math.ceil((now - loan.dueAt) / (1000 * 60 * 60 * 24));
      const fineAmount = daysOverdue * fineAmountPerDay;

      const fine = await prisma.fine.create({
        data: {
          userId: loan.userId,
          loanId: loan.id,
          amount: fineAmount,
          reason: `Overdue book: ${loan.book.title} (${daysOverdue} days)`,
          status: "unpaid",
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          loan: { 
            include: { 
              book: { select: { id: true, title: true, author: true } } 
            } 
          },
        },
      });

      createdFines.push(fine);
    }

    res.json({
      success: true,
      message: `Generated ${createdFines.length} fines for overdue books`,
      data: createdFines,
    });
  } catch (error) {
    console.error("Error auto-generating fines:", error);
    res.status(500).json({
      success: false,
      message: "Failed to auto-generate fines",
      error: error.message,
    });
  }
};
