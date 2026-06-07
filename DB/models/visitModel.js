import { model, Schema, Types } from "mongoose";

const visitSchema = new Schema(
  {
    note: { type: String },
    //isAccepted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    user: { type: Types.ObjectId, ref: "User" },
    unit: { type: String, required: true },
    vName: { type: String, required: true },
    vRank: { type: String, required: true },
    vJob: { type: String, required: true },
    rUser: { type: Types.ObjectId, ref: "User" },
    isFinished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Visit = model("Visit", visitSchema);
