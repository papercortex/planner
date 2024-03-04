import dbConnect from "@/lib/mongoose";
import { createDayTasks } from "@/services/taskService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const dayData = await req.json();
    const task = await createDayTasks(dayData);
    return NextResponse.json(
      {
        status: "ok",
        task,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: {
          message: "Failed to create task.",
        },
      },
      {
        status: 500,
      }
    );
  }
}
