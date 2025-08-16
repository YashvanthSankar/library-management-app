import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

// Load environment variables
config({ path: ".env" });

const prisma = new PrismaClient();

async function addSampleBooks() {
  try {
    // Add some sample books
    const sampleBooks = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "978-0-7432-7356-5",
        category: "Fiction",
        totalCopies: 5,
        availableCopies: 3,
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        isbn: "978-0-06-112008-4",
        category: "Fiction",
        totalCopies: 4,
        availableCopies: 2,
      },
      {
        title: "1984",
        author: "George Orwell",
        isbn: "978-0-452-28423-4",
        category: "Science Fiction",
        totalCopies: 6,
        availableCopies: 4,
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        isbn: "978-0-14-143951-8",
        category: "Romance",
        totalCopies: 3,
        availableCopies: 1,
      },
      {
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        isbn: "978-0-316-76948-0",
        category: "Fiction",
        totalCopies: 4,
        availableCopies: 4,
      },
    ];

    for (const book of sampleBooks) {
      await prisma.book.create({
        data: book,
      });
      console.log(`Added book: ${book.title}`);
    }

    console.log("✅ Sample books added successfully!");
  } catch (error) {
    console.error("Error adding sample books:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleBooks();
