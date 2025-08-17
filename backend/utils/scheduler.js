// import cron from 'node-cron';
import { prisma } from "../utils/database.js";

// Initialize scheduled fine calculation
export const initScheduledTasks = () => {
  // Run fine calculation on server startup
  console.log("Calculating initial fines on server startup...");
  calculateDailyFines();

  // Set up interval to run every 24 hours (86400000 ms)
  setInterval(() => {
    console.log("Running daily fine calculation...");
    calculateDailyFines();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

const calculateDailyFines = async () => {
  try {
    const currentDate = new Date();

    // Find all overdue active loans
    const overdueLoans = await prisma.loan.findMany({
      where: {
        status: "active",
        dueAt: {
          lt: currentDate,
        },
      },
      include: {
        user: true,
        book: { select: { title: true } },
      },
    });

    let finesGenerated = 0;
    let finesUpdated = 0;

    for (const loan of overdueLoans) {
      // Calculate days overdue
      const daysOverdue = Math.ceil(
        (currentDate - new Date(loan.dueAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue <= 0) continue;

      // Check if fine already exists for this loan
      const existingFine = await prisma.fine.findFirst({
        where: {
          loanId: loan.id,
        },
      });

      const fineAmount = daysOverdue * 20; // ₹20 per day

      if (!existingFine) {
        // Create new fine
        await prisma.fine.create({
          data: {
            userId: loan.userId,
            loanId: loan.id,
            amount: fineAmount,
            reason: `Overdue return - ${daysOverdue} day(s) late`,
            status: "UNPAID",
          },
        });
        finesGenerated++;
        console.log(
          `Generated fine of ₹${fineAmount} for loan ${loan.id} (${daysOverdue} days overdue)`
        );
      } else if (existingFine.status === "UNPAID") {
        // Update existing unpaid fine
        if (fineAmount !== existingFine.amount) {
          await prisma.fine.update({
            where: { id: existingFine.id },
            data: {
              amount: fineAmount,
              reason: `Overdue return - ${daysOverdue} day(s) late`,
            },
          });
          finesUpdated++;
          console.log(`Updated fine to ₹${fineAmount} for loan ${loan.id}`);
        }
      }
    }

    console.log(
      `Fine calculation completed: ${finesGenerated} new fines generated, ${finesUpdated} fines updated`
    );
  } catch (error) {
    console.error("Error calculating daily fines:", error);
  }
};

export { calculateDailyFines };
