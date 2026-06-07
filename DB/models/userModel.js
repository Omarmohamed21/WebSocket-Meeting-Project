import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    job: { type: String, required: true },
    slug: { type: String, required: true, unique: false },
    password: { type: String, required: true, min: 6 },
    rank: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);
