import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.food.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Dish removed successfully" });
  } catch (error) {
    console.error("[Admin Delete Food Error]", error);
    return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 });
  }
}

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

    const updated = await prisma.food.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, food: updated });
  } catch (error) {
    console.error("[Admin Update Food Error]", error);
    return NextResponse.json({ error: "Failed to update dish" }, { status: 500 });
  }
}
