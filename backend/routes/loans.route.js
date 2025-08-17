import { Router } from "express";
import {
  getAllLoans,
  getLoanById,
  getUserLoans,
  createLoan,
  updateLoan,
  deleteLoan,
} from "../controllers/loans.controller.js";

const router = Router();

// GET all loans (with filtering and pagination)
router.get("/", getAllLoans);

// GET loans for specific user
router.get("/user/:userId", getUserLoans);

// GET loan by ID
router.get("/:id", getLoanById);

// POST create new loan
router.post("/", createLoan);

// PUT update loan
router.put("/:id", updateLoan);

// DELETE loan
router.delete("/:id", deleteLoan);

export default router;
