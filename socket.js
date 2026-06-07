/*import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Visit } from "./DB/models/visitModel.js";
import { User } from "./DB/models/userModel.js";
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.use((socket, next) => {
    try {
      console.log("trying to connect to socket.io");
      const token = socket.handshake.headers.token;
      if (!token) return next(new Error("no token assigned", { cause: 404 }));

      const decode = jwt.verify(token, process.env.secretKey);

      socket.userId = decode.id;
      next();
    } catch (error) {
      next(new Error(`Authentication error...${error}`, { cause: 401 }));
    }
  });

  io.on("connection", (socket) => {
    console.log("user connected: ", socket.userId);

    socket.join(socket.userId);

    socket.on(
      "sendVisit",
      async ({ toUserId, vRank, vName, vJob, note, unit }) => {
        //logic
        try {
          const reqUser = await User.findById(socket.userId);
          const resUser = await User.findById(toUserId);
          if (!resUser) {
            return socket.emit("error", {
              message: "هذا اليوزر غير موجود تواصل مع فرع النظم",
            });
          }

          if (resUser.slug !== reqUser.slug) {
            return socket.emit("error", {
              message: "ليس لديك الصلاحية لاتخاذ هذا الاجراء",
            });
          }
          const visit = await Visit.create({
            note,
            unit,
            vName,
            vJob,
            vRank,
            user: socket.userId,
          });

          io.to(toUserId).emit("receiveVisit", {
            fromUserId: socket.userId,
            visit,
            message: "you have a new visit request",
          });
        } catch (error) {
          console.log(`error is : ${error}`);
        }
      }
    );

    socket.on("sendResponse", async ({ toUserId, response }) => {
      // logic saving log to DB

      console.log({ toUserId, response });
      io.to(toUserId).emit("receiveResponse", { toUserId, response });
    });

    socket.on("disconnect", () => {
      console.log("user Disconnected", socket.userId);
    });
  });
  return io;
};*/

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import visitSocket from "./src/modules/visitSocket/visitSocket.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  // 🔐 Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.headers.token;
      if (!token) {
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, process.env.secretKey);
      socket.userId = decoded.id;

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("user connected:", socket.userId);

    socket.join(socket.userId);

    // 👈 register visit-related events
    visitSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("user disconnected:", socket.userId);
    });
  });

  return io;
};
