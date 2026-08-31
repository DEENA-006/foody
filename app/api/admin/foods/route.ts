import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ foods });
  } catch (error) {
    console.error("[Admin Get Foods Error]", error);
    return NextResponse.json({ error: "Failed to fetch dishes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, price, image, description, calories, protein, carbs, fat, spiceLevel, dietary } = body;

    if (!name?.trim() || !category?.trim() || !price) {
      return NextResponse.json({ error: "Name, category, and price are required." }, { status: 400 });
    }

    const food = await prisma.food.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        price: parseFloat(price),
        image: image?.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop",
        description: description?.trim() || "Delicious freshly prepared meal.",
        calories: parseInt(calories) || 500,
        protein: protein?.trim() || "25g",
        carbs: carbs?.trim() || "45g",
        fat: fat?.trim() || "15g",
        spiceLevel: parseInt(spiceLevel) || 0,
        dietary: dietary?.trim() || "Chef Special",
        isAvailable: true,
      },
    });

    return NextResponse.json({ success: true, food }, { status: 201 });
  } catch (error) {
    console.error("[Admin Create Food Error]", error);
    return NextResponse.json({ error: "Failed to add dish." }, { status: 500 });
  }
}
