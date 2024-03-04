import mongoose, { Document, Model, Schema } from "mongoose";
import { ITag } from "./Tag";

export interface ITask extends Document {
  title: string;
  status: "NEW" | "DONE";
  date: Date;
  fromTime: string;
  toTime: string;
  tags: ITag["_id"][]; // Reference to Tag model by ID
  priority: "default" | "minor" | "major" | "blocker";
  traceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema: Schema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    status: { type: String, required: true, enum: ["NEW", "DONE"] },
    date: { type: Date, required: true },
    fromTime: { type: String, required: true },
    toTime: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    priority: {
      type: String,
      required: true,
      enum: ["default", "minor", "major", "blocker"],
    },
    traceId: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

// Prevent model overwrite upon recompilation
export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", taskSchema);
