import dbConnect from "@/lib/mongoose";
import { createTaskWithTags } from "@/services/taskService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const taskData = await req.json();
    const task = await createTaskWithTags(taskData);
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
