import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITag extends Document {
  label: string;
}

const tagSchema: Schema = new Schema<ITag>({
  label: { type: String, required: true },
});

// Prevent model overwrite upon recompilation
export const Tag: Model<ITag> =
  mongoose.models.Tag || mongoose.model<ITag>("Tag", tagSchema);
