import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { reason, details, returnType, pickupAddress } = body;

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Please select a return reason." }, { status: 400 });
    }

    if (!details?.trim()) {
      return NextResponse.json({ error: "Please provide specific details explaining the return request." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Only DELIVERED orders can be returned (or existing RETURN_REQUESTED can be updated)
    if (order.status !== "DELIVERED" && order.status !== "RETURN_REQUESTED") {
      return NextResponse.json({
        error: "Return requests can only be submitted for delivered orders.",
      }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "RETURN_REQUESTED",
        returnReason: reason.trim(),
        returnDetails: details.trim(),
        returnStatus: "REQUESTED",
        returnPickup: pickupAddress?.trim() || order.address,
        refundAmount: order.total,
        returnedAt: new Date(),
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully. Our support team will process your refund.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[Return Order Error]", error);
    return NextResponse.json({ error: "Failed to submit return request." }, { status: 500 });
  }
}
