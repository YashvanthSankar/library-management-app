import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "📚 Loans API - Coming soon!" });
});

export default router;
