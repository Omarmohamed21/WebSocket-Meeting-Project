import { Visit } from "../../../DB/models/visitModel.js";
import {
  callSecret,
  sendVisit,
  visitEnding,
  visitResponse,
} from "./visitServices.js";

export default function visitSocket(io, socket) {
  socket.on("sendVisit", async (data) => {
    if (!socket.userId)
      return socket.emit("sendVisitError", { message: "Unauthorized" });

    try {
      const visit = await sendVisit({
        fromUserId: socket.userId,
        ...data,
      });

      // 🔥 notify ONLY the matched admin
      io.to(visit.rUser.toString()).emit("newVisit", {
        visit,
        message: "you have a new visit request",
      });

      socket.emit("sendVisitSuccess", { visit });
    } catch (err) {
      socket.emit("sendVisitError", {
        message: err.message,
      });
    }
  });

  socket.on("visitResponse", async (data) => {
    try {
      console.log("ADMIN SOCKET USER:", socket.userId); // 👈 مهم
      console.log("DATA: ", data);

      const visit = await visitResponse({
        fromUserId: socket.userId,
        ...data,
      });

      io.to(visit.user.toString()).emit("receiveResponse", {
        visitId: visit._id,
        status: visit.status,
      });
      // بعد update الزيارة
      io.to(socket.userId).emit("adminVisitUpdated", {
        visitId: visit._id,
        status: visit.status,
      });
    } catch (err) {
      socket.emit("sendResponseError", {
        message: err.message,
      });
    }
  });

  //todo /* to be tested */
  socket.on("visitEnding", async (data) => {
    try {
      const visit = await visitEnding({
        fromUserId: socket.userId,
        ...data,
      });

      io.to(visit.user.toString()).emit("endVisit", {
        visitId: visit._id,
        isFinished: visit.isFinished,
      });
      // بعد update الزيارة
      io.to(socket.userId).emit("adminVisitUpdated", {
        visitId: visit._id,
        status: visit.status,
      });
    } catch (error) {
      socket.emit("endVisitError", {
        message: error.message,
      });
    }
  });

  socket.on("ringUser", async (data) => {
    try {
      const ring = await callSecret({
        fromUserId: socket.userId,
        ...data,
      });
      io.to(ring.user.toString()).emit("ringing", {
        message: "call for support",
      });
    } catch (error) {
      socket.emit("ringingError", { message: error.message });
    }
  });

  /*socket.on("ringUser", async (data) => {
    try {
      const ring = await callSecret({
        fromUserId: socket.userId,
        ...data,
      });

      io.to(ring.user.toString()).emit("ringing", {
        message: "call for support",
        visitId: ring._id,
      });
    } catch (error) {
      socket.emit("ringingError", {
        message: error.message,
      });
    }
  });
  /*socket.on("ringUser", async () => {
    try {
      if (!socket.userId) throw new Error("Unauthorized");

      // 👤 admin
      const admin = await User.findById(socket.userId);
      if (!admin || admin.role !== "admin") throw new Error("Forbidden");

      // 👥 users بنفس الـ slug
      const users = await User.find({
        role: "user",
        slug: admin.slug,
      }).select("_id");

      if (!users.length) return;

      // 🔔 رن على كل اليوزرز
      users.forEach((u) => {
        io.to(u._id.toString()).emit("ringing", {
          message: "Admin is calling you",
        });
      });
    } catch (error) {
      socket.emit("ringingError", {
        message: error.message,
      });
    }
  });*/
}
