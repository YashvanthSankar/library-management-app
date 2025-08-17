import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import limiter from "./middlewares/rate-limiter.js";
import { initScheduledTasks } from "./utils/scheduler.js";

dotenv.config({ path: "./.env" });

import BooksRouter from "./routes/books.route.js";
import UsersRouter from "./routes/users.route.js";
import LoansRouter from "./routes/loans.route.js";
import FinesRouter from "./routes/fines.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(limiter);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Welcome to the backend server!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//routes
app.use("/api/books", BooksRouter);
app.use("/api/users", UsersRouter);
app.use("/api/loans", LoansRouter);
app.use("/api/fines", FinesRouter);

//error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Something went wrong!",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize scheduled tasks for automatic fine calculation
  initScheduledTasks();
});

export default app;
