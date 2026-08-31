/**
 * Seed demo coupons into the SQLite database.
 * Run: node prisma/seed-coupons.mjs
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const coupons = [
    { code: "WELCOME10", discountPercent: 10, maxUses: 1000 },
    { code: "FOODIEE20", discountPercent: 20, maxUses: 500 },
    { code: "SAVE5", discountPercent: 5, maxUses: 9999 },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    console.log(`✅ Seeded coupon: ${c.code} (${c.discountPercent}% off)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
