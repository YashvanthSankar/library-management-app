import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users - Get all library members
export const getAllMembers = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const members = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch library members",
      error: error.message,
    });
  }
};

// GET /api/users/:id - Get specific member details
export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.user.findUnique({
      where: { id: id }, // Use string ID directly
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch member details",
      error: error.message,
    });
  }
};

// PATCH /api/users/:id/status - Update member status (active/inactive)
export const updateMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (active or inactive)",
      });
    }

    const updatedMember = await prisma.user.update({
      where: { id: id }, // Use string ID directly
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    });

    res.json({
      success: true,
      message: `Member status updated to ${status}`,
      data: updatedMember,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

      console.error("Error updating member status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update member status",
      error: error.message,
    });
  }
};

// POST /api/users - Create or get user (for session-based user creation)
export const createOrGetUser = async (req, res) => {
  try {
    const { id, name, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({
        success: false,
        message: "User ID and email are required",
      });
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          id,
          name: name || "Anonymous User",
          email,
          role: "borrower",
          status: "active",
        },
      });
    }

    res.json({
      success: true,
      message: user.createdAt ? "User created successfully" : "User found",
      data: user,
    });
  } catch (error) {
    console.error("Error creating/getting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create or get user",
      error: error.message,
    });
  }
};