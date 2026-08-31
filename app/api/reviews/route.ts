import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const foodId = searchParams.get("foodId");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;

    const where = foodId ? { foodId } : {};

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Calculate aggregate metrics if foodId is passed
    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    return NextResponse.json({
      reviews,
      count: reviews.length,
      averageRating,
    });
  } catch (error) {
    console.error("[Get Reviews Error]", error);
    return NextResponse.json({ error: "Failed to fetch reviews." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await req.json();
    const { foodId, foodName, rating, comment } = body;

    if (!foodId) {
      return NextResponse.json({ error: "Food ID is required." }, { status: 400 });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ error: "Please provide a rating between 1 and 5 stars." }, { status: 400 });
    }

    if (!comment?.trim()) {
      return NextResponse.json({ error: "Please write a comment describing your experience." }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        foodId: String(foodId),
        foodName: foodName?.trim() || null,
        rating: parsedRating,
        comment: comment.trim(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("[Create Review Error]", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
