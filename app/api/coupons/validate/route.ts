import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code?.trim()) {
      return NextResponse.json({ error: "Please enter a coupon code." }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }

    const discountAmount = ((subtotal || 0) * coupon.discountPercent) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: Math.round(discountAmount * 100) / 100,
      message: `${coupon.discountPercent}% off applied!`,
    });
  } catch (error) {
    console.error("[Coupon Validate Error]", error);
    return NextResponse.json({ error: "Failed to validate coupon." }, { status: 500 });
  }
}
