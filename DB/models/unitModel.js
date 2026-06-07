import { model, Schema, Types } from "mongoose";

const unitSchema = new Schema(
  {
    name: { type: String, required: true },
    user: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Unit = model("Unit", unitSchema);
