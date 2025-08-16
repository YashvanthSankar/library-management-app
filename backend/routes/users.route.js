import { Router } from "express";
import {
  getAllMembers,
  getMemberById,
  updateMemberStatus,
} from "../controllers/users.controller.js";

const router = Router();

// GET /api/users - Get all library members
router.get("/", getAllMembers);

// GET /api/users/:id - Get specific member details
router.get("/:id", getMemberById);

// PATCH /api/users/:id/status - Update member status (active/inactive)
router.patch("/:id/status", updateMemberStatus);

export default router;
