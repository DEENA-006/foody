import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const body = await req.json();
    const { items, address, paymentMethod, couponCode, subtotal, discount, tax, deliveryFee, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    // Create Order and associated OrderItems
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        address: address.trim(),
        paymentMethod: paymentMethod || "cod",
        couponCode: couponCode || null,
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        tax: Number(tax) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        total: Number(total) || 0,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            foodId: String(item.id),
            name: item.name,
            image: item.image,
            price: Number(item.price),
            quantity: Number(item.quantity) || 1,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // If coupon was used, increment usage count
    if (couponCode) {
      try {
        await prisma.coupon.update({
          where: { code: couponCode.trim().toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      } catch (err) {
        console.warn("Could not increment coupon usedCount:", err);
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("[Create Order Error]", error);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("[Get Orders Error]", error);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}
