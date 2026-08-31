import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ take: 3 });
  if (users.length === 0) {
    console.log("No users found to attach reviews.");
    return;
  }

  const demoReviews = [
    {
      userId: users[0].id,
      foodId: "52772",
      foodName: "Teriyaki Chicken Casserole",
      rating: 5,
      comment: "Incredible depth of flavor! The teriyaki sauce was perfectly balanced and the chicken was tender. Best meal this week!",
    },
    {
      userId: users[0].id,
      foodId: "52874",
      foodName: "Beef and Mustard Pie",
      rating: 5,
      comment: "Warm, flaky crust with rich savory filling. Arrived piping hot in under 25 minutes. 10/10 recommend!",
    },
    {
      userId: users[0].id,
      foodId: "52855",
      foodName: "Banana Pancakes",
      rating: 5,
      comment: "Light, fluffy and naturally sweet. Perfect breakfast treat. Delivery packaging was super clean!",
    },
    {
      userId: users[0].id,
      foodId: "52772",
      foodName: "Teriyaki Chicken Casserole",
      rating: 4,
      comment: "Very tasty and fresh ingredients. Generous portion size. Would definitely order again.",
    },
  ];

  for (const r of demoReviews) {
    await prisma.review.create({ data: r });
  }

  console.log("✅ Seeded customer reviews successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
