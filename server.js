import express from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { connectionDB } from "./DB/connection.js";
import { initSocket } from "./socket.js";
import userRouter from "./src/modules/user/userRouter.js";
import visitRouter from "./src/modules/visit/visitRouter.js";

// import { Server } from "socket.io";
dotenv.config();

const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const port = process.env.port || 5000;

app.use(express.json());
app.use(express.static("public"));
app.use(cors());

app.use("/user", userRouter);
app.use("/visit", visitRouter);

app.use((error, req, res, next) => {
  const statusCode = error.cause || 500;
    console.error("ERROR:", error);
  return res.status(statusCode).json({
    success: false,
    message: error.message,
    stack: error.stack,
  });
});

await connectionDB();
// io.on("connection", (socket) => {
//   console.log("a user connected");
// });
initSocket(server);
server.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
