import { PrismaClient } from "@prisma/client";

// Create a single Prisma instance to be shared across the app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"], // Log queries and errors in development
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  // Handle process termination
  await prisma.$disconnect(); // Disconnect Prisma client
});

export { prisma };
