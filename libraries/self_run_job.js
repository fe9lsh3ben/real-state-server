const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Delete all notifications older than 30 days
async function deleteOldNotifications() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  await prisma.notification.deleteMany({
    where: { Created_At: { lt: cutoff } }
  });

  console.log("✅ Old notifications deleted at", new Date());
}

// Run every night at 2 AM
cron.schedule("0 2 * * *", () => {
  deleteOldNotifications();
});
