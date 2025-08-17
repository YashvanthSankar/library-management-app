import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log("Checking users in database...");
    const users = await prisma.user.findMany();
    console.log("Current users count:", users.length);

    if (users.length < 3) {
      console.log("Adding more sample users...");

      // Check if librarian exists
      const librarianExists = users.some((u) => u.role === "librarian");
      if (!librarianExists) {
        const librarian = await prisma.user.create({
          data: {
            email: "librarian@example.com",
            name: "Sarah Wilson",
            role: "librarian",
            status: "active",
          },
        });
        console.log("Created librarian:", librarian.name);
      }

      // Add more borrowers
      const borrowersToAdd = [
        {
          email: "alice@example.com",
          name: "Alice Johnson",
          role: "borrower",
          status: "active",
        },
        {
          email: "bob@example.com",
          name: "Bob Smith",
          role: "borrower",
          status: "active",
        },
        {
          email: "charlie@example.com",
          name: "Charlie Brown",
          role: "borrower",
          status: "inactive",
        },
      ];

      for (const userData of borrowersToAdd) {
        const existingUser = users.find((u) => u.email === userData.email);
        if (!existingUser) {
          const newUser = await prisma.user.create({ data: userData });
          console.log("Created user:", newUser.name);
        }
      }
    } else {
      console.log("Existing users:");
      users.forEach((user) => {
        console.log(
          `- ${user.name} (${user.email}) - ${user.role} - ${
            user.status || "no status"
          }`
        );
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
