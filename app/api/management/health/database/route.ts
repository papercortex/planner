import clientPromise from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const mongodb = await clientPromise;
    return NextResponse.json({ status: "ok", message: "Database is healthy" });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database is not healthy",
      },
      {
        status: 500,
      }
    );
  }
}
