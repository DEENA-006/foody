import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
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
    const { status, returnStatus, refundAmount } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (returnStatus) dataToUpdate.returnStatus = returnStatus;
    if (refundAmount !== undefined) dataToUpdate.refundAmount = Number(refundAmount);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("[Admin Update Order Error]", error);
    return NextResponse.json({ error: "Failed to update order status." }, { status: 500 });
  }
}
