import { PrismaClient } from "@prisma/client";
import { buildActionDays } from "../lib/calendar-seed";

const prisma = new PrismaClient();

async function main() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  for (const year of years) {
    const events = buildActionDays(year);
    for (const event of events) {
      const existing = await prisma.calendarEvent.findFirst({
        where: { title: event.title, date: event.date },
      });
      if (existing) continue;
      await prisma.calendarEvent.create({
        data: {
          title: event.title,
          date: event.date,
          category: event.category,
          recurring: event.recurring,
          description: event.description,
          isCustom: false,
        },
      });
    }
  }

  console.log("Aktionstage-Kalender befüllt.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
