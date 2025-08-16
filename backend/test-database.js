// Test script to verify database connection and basic operations
import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("🚀 Testing database connection...");

    // Test 1: Add a sample book
    console.log("\n📚 Adding a sample book...");
    const book1 = await prisma.book.create({
      data: {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        isbn: "9780743273565",
        category: "Fiction",
        totalCopies: 3,
        availableCopies: 3,
      },
    });
    console.log("✅ Book added:", book1.title);

    // Test 2: Add another book
    const book2 = await prisma.book.create({
      data: {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        totalCopies: 2,
        availableCopies: 2,
      },
    });
    console.log("✅ Book added:", book2.title);

    // Test 3: Add a sample user
    console.log("\n👤 Adding a sample user...");
    const user = await prisma.user.create({
      data: {
        email: "john@example.com",
        name: "John Doe",
        role: "borrower",
      },
    });
    console.log("✅ User added:", user.name);

    // Test 4: Create a loan
    console.log("\n📖 Creating a sample loan...");
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 14 days from now

    const loan = await prisma.loan.create({
      data: {
        userId: user.id,
        bookId: book1.id,
        dueAt: dueDate,
      },
    });
    console.log("✅ Loan created for:", user.name);

    // Test 5: Update book availability
    await prisma.book.update({
      where: { id: book1.id },
      data: { availableCopies: book1.availableCopies - 1 },
    });
    console.log("✅ Book availability updated");

    // Test 6: Query all books
    console.log("\n📊 Fetching all books...");
    const allBooks = await prisma.book.findMany();
    console.log(`📚 Total books in library: ${allBooks.length}`);

    allBooks.forEach((book) => {
      console.log(
        `  - ${book.title} by ${book.author} (${book.availableCopies}/${book.totalCopies} available)`
      );
    });

    // Test 7: Query loans with user and book details
    console.log("\n📋 Fetching loans with details...");
    const loans = await prisma.loan.findMany({
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true, author: true } },
      },
    });

    loans.forEach((loan) => {
      console.log(
        `  - ${loan.user.name} borrowed "${
          loan.book.title
        }" (due: ${loan.dueAt.toDateString()})`
      );
    });

    console.log(
      "\n🎉 All database tests passed! Your setup is working perfectly!"
    );
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabase();
