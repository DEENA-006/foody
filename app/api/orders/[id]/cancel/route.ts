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
    const { reason, notes } = body;

    if (!reason?.trim()) {
      return NextResponse.json({ error: "Please provide a reason for cancellation." }, { status: 400 });
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

    // Cancellation is allowed for PENDING and PREPARING status
    if (order.status === "CANCELLED") {
      return NextResponse.json({ error: "This order is already cancelled." }, { status: 400 });
    }

    if (order.status === "OUT_FOR_DELIVERY" || order.status === "DELIVERED") {
      return NextResponse.json({
        error: `Order cannot be cancelled while ${order.status.toLowerCase().replace(/_/g, " ")}. You can request a return after delivery.`,
      }, { status: 400 });
    }

    const fullReason = notes?.trim() ? `${reason.trim()} - ${notes.trim()}` : reason.trim();

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: fullReason,
        cancelledAt: new Date(),
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[Cancel Order Error]", error);
    return NextResponse.json({ error: "Failed to cancel order." }, { status: 500 });
  }
}
