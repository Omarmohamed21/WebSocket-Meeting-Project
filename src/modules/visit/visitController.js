import mongoose, { Mongoose } from "mongoose";
import { User } from "../../../DB/models/userModel.js";
import { Visit } from "../../../DB/models/visitModel.js";

export const allVisits = async (req, res, next) => {
  //super admin
  const visits = await Visit.find();
  if (!visits)
    return next(new Error("There's no Visits Right now", { cause: 404 }));

  return res.status(200).json({ succes: true, result: visits });
};

export const adminVisits = async (req, res, next) => {
  //admin
  const visits = await Visit.find({ rUser: req.user.id }).sort({
    createdAt: -1,
  });
  if (visits.length === 0)
    return next(new Error("You don't have any meetings yet", { cause: 404 }));

  return res.status(200).json({ success: true, result: visits });
};

export const specificVisit = async (req, res, next) => {
  const visit = await Visit.findById(req.params.id);
  if (!visit) return next(new Error("Visit not found", { cause: 404 }));

  const user = await User.findById(req.user.id);
  console.log(user.role);

  if (user.role !== "admin" && user.role !== "superAdmin")
    return next(new Error("Unauthorized", { cause: 403 }));

  return res.status(200).json({ success: true, result: { visit } });
};

export const searchVisit = async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(200).json({ success: true, result: [] });
  }

  const visits = await Visit.find({
    $or: [
      { note: { $regex: q, $options: "i" } },
      { status: { $regex: q, $options: "i" } },
      { unit: { $regex: q, $options: "i" } },
      { vName: { $regex: q, $options: "i" } },
      { vRank: { $regex: q, $options: "i" } },
      { vJob: { $regex: q, $options: "i" } },
      { isFinished: { $regex: q, $options: "i" } },
    ],
  }).sort({ createdAt: -1 });

  return res.status(200).json({ success: true, results: { visits } });
};

export const deliveredVisits = async (req, res, next) => {
  const visits = await Visit.find({ user: req.user.id });
  if (visits.length === 0)
    return next(new Error("No Visits Right Now", { cause: 404 }));

  return res.status(200).json({ success: true, results: { visits } });
};

export const updateVisit = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(new Error("Invalid VisitId"));

  const visit = await Visit.findById(req.params.id);
  if (!visit) return next(new Error("This Visit is not found", { cause: 404 }));

  const user = await User.findById(req.user.id);

  const isResponsibleAdmin = visit.rUser.toString() === user._id.toString();

  const isOwner = visit.user.toString() === user._id.toString();

  if (isResponsibleAdmin) {
    /*visit.isFinished =
      req.body.isFinished !== undefined
        ? req.body.isFinished
        : visit.isFinished;

    visit.isAccepted =
      req.body.isAccepted !== undefined
        ? req.body.isAccepted
        : visit.isAccepted;*/
    visit.status = req.body.status ?? visit.status;

    visit.note = req.body.note ?? visit.note;
    visit.unit = req.body.unit ?? visit.unit;
    visit.vName = req.body.vName ?? visit.vName;
    visit.vRank = req.body.vRank ?? visit.vRank;
    visit.vJob = req.body.vJob ?? visit.vJob;
  } else if (isOwner) {
    // if (
    //req.body.isFinished !== undefined ||
    //  req.body.isAccepted !== undefined
    //) {
    //  return next(new Error("You are not allowed to update this status"));
    // }
    visit.note = req.body.note ?? visit.note;
    visit.unit = req.body.unit ?? visit.unit;
    visit.vName = req.body.vName ?? visit.vName;
    visit.vRank = req.body.vRank ?? visit.vRank;
    visit.vJob = req.body.vJob ?? visit.vJob;
  } else {
    return next(new Error("unauthorized to make this change", { cause: 403 }));
  }
  await visit.save();

  return res
    .status(200)
    .json({ success: true, message: "this visit updated successfully" });
};

export const deleteVisit = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new Error("Invalid Visit Id", { cause: 404 }));
  }

  const visit = await Visit.findById(req.params.id);
  if (!visit) {
    return next(new Error("This Visit not found", { cause: 404 }));
  }

  const user = await User.findById(req.user.id);

  const isAdminOwner = visit.rUser.toString() === user._id.toString();
  const isVisitOwner = visit.user.toString() === user._id.toString();
  const isSuperAdmin = user.role === "superAdmin";

  // 🔐 authorization first
  if (!isAdminOwner && !isVisitOwner && !isSuperAdmin) {
    return next(
      new Error("Unauthorized to perform this action", { cause: 403 })
    );
  }

  // 🧠 business rule
  if (!visit.isFinished) {
    return next(new Error("This Visit still not finished", { cause: 400 }));
  }

  await visit.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Deleted Successfully",
  });
};

export const adminSearch = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new Error("This user is not found", { cause: 404 }));

  if (user.role !== "admin") {
    return next(
      new Error("Unauthorized to perform this action", { cause: 403 })
    );
  }

  const { q } = req.query;

  if (!q) {
    return res.status(200).json({ success: true, result: [] });
  }

  const visits = await Visit.find({
    rUser: user._id,
    $or: [
      { note: { $regex: q, $options: "i" } },
      { status: { $regex: q, $options: "i" } },
      { unit: { $regex: q, $options: "i" } },
      { vName: { $regex: q, $options: "i" } },
      { vRank: { $regex: q, $options: "i" } },
      { vJob: { $regex: q, $options: "i" } },
    ],
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    result: visits,
  });
};

export const userVisit = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user)
    return next(new Error("User Not Found, log in again", { cause: 404 }));

  const visits = await Visit.find({ user: user._id }).sort({
    createdAt: -1,
  });

  if (visits.length === 0)
    return next(new Error("No visits found", { cause: 404 }));

  return res.status(200).json({
    success: true,
    result: visits,
  });
};
