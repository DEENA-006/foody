import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { addresses: { orderBy: { createdAt: "desc" } } },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ addresses: user.addresses });
  } catch (error) {
    console.error("[Get Addresses Error]", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { label, street, city, state, zip, isDefault } = await req.json();

    if (!street?.trim() || !city?.trim() || !state?.trim() || !zip?.trim()) {
      return NextResponse.json({ error: "All address fields are required." }, { status: 400 });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: label?.trim() || "Home",
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        isDefault: Boolean(isDefault),
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("[Save Address Error]", error);
    return NextResponse.json({ error: "Failed to save address" }, { status: 500 });
  }
}
