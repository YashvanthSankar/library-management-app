import { Router } from "express";
import {
  getAllFines,
  getFineById,
  getUserFines,
  createFine,
  updateFineStatus,
  deleteFine,
  autoGenerateFines,
} from "../controllers/fines.controller.js";

const router = Router();

// GET all fines (with filtering)
router.get("/", getAllFines);

// GET fines for specific user
router.get("/user/:userId", getUserFines);

// POST auto-generate fines for overdue books
router.post("/auto-generate", autoGenerateFines);

// GET fine by ID
router.get("/:id", getFineById);

// POST create new fine
router.post("/", createFine);

// PATCH update fine status
router.patch("/:id/status", updateFineStatus);

// DELETE fine
router.delete("/:id", deleteFine);

export default router;
