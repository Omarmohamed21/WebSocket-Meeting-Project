import { User } from "../../../DB/models/userModel.js";
import { Visit } from "../../../DB/models/visitModel.js";

export async function sendVisit({
  fromUserId,
  vRank,
  vName,
  vJob,
  note,
  unit,
}) {
  const reqUser = await User.findById(fromUserId);
  if (!reqUser) throw new Error("User not found");

  if (reqUser.role !== "user") throw new Error("forbidden unauthorized");

  // 🔥 get admin by SAME slug
  const resUser = await User.findOne({
    role: "admin",
    slug: reqUser.slug,
  });

  if (!resUser) throw new Error("No admin found for this user");

  const visit = await Visit.create({
    note,
    unit,
    vJob,
    vName,
    vRank,
    user: fromUserId,
    rUser: resUser._id,
  });

  return visit;
}

export async function visitResponse({ fromUserId, visitId, status }) {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new Error("هذه المقابله غير موجودة");

  const admin = await User.findById(fromUserId);
  if (!admin || admin.role !== "admin")
    throw new Error("ليس لديك الصلاحية لعمل هذا الاجراء");

  // ✅ CORRECT CHECK
  if (visit.rUser.toString() !== fromUserId.toString())
    throw new Error("لا يمكنك تعديل هذه الزيارة");

  visit.status = status;
  await visit.save();

  return visit;
}

export async function visitEnding({ fromUserId, visitId, isFinished }) {
  const visit = await Visit.findById(visitId);
  if (!visit) throw new Error("هذه المقابله غير موجودة");

  const admin = await User.findById(fromUserId);
  if (!admin || admin.role !== "admin")
    throw new Error("ليس لديك الصلاحية لعمل هذا الاجراء");

  // ✅ CORRECT CHECK
  if (visit.rUser.toString() !== fromUserId.toString())
    throw new Error("لا يمكنك تعديل هذه الزيارة");

  visit.isFinished = isFinished === true || isFinished === "true";
  await visit.save();

  return visit;
}

export async function callSecret({ fromUserId, toUserId }) {
  if (!toUserId) throw new Error("Target user is required");

  const user = await User.findById(fromUserId);
  if (!user) throw new Error("User not found");

  if (user.role !== "admin") throw new Error("Not authorized");

  const ringVisit = await Visit.findOne({
    user: toUserId,
  });

  if (!ringVisit) throw new Error("No active visit for this user");

  return ringVisit;
}
