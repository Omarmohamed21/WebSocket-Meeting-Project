import mongoose from "mongoose";

export const connectionDB = async () => {
  return await mongoose
    .connect(process.env.mongoURI)
    .then(() => console.log("DB connected"))
    .catch((err) => console.log(`DB failed to connect ... ${err}`));
};
