import { User } from "../../../DB/models/userModel.js";
import { Token } from "../../../DB/models/tokenModel.js";

import bjs from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const register = async (req, res, next) => {
  /* const authUser = await User.findById(req.user.id);
  if (authUser.role !== "superAdmin")
    return next(
      new Error("you're not authorized to create a new user", { cause: 403 })
    );*/
  const isUser = await User.findOne({ username: req.body.username });
  if (isUser) return next(new Error("user already exist", { cause: 409 }));

  if (req.body.password !== req.body.confirmPassword)
    return next(new Error("password must match", { cause: 404 }));

  const hashed = bjs.hashSync(
    req.body.password,
    parseInt(process.env.saltRound)
  );

  await User.create({ ...req.body, password: hashed });

  return res
    .status(201)
    .json({ success: true, message: "user Created , please log in " });
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  const isUser = await User.findOne({ username });

  if (!isUser) {
    return next(new Error("wrong username", { cause: 404 }));
  }

  const match = bjs.compareSync(password, isUser.password);

  if (!match) {
    return next(new Error("password is incorrect", { cause: 401 }));
  }

  if (!process.env.secretKey) {
    return next(new Error("JWT secretKey is missing", { cause: 500 }));
  }

  const token = jwt.sign(
    { id: isUser._id, name: isUser.name, role: isUser.role },
    process.env.secretKey
  );

  await Token.create({ token, user: isUser._id });

  return res.status(200).json({
    success: true,
    message: "Signed in successfully",
    token,
    name: isUser.name,
    role: isUser.role,
  });
};

export const logout = async (req, res, next) => {
  const isUser = await User.findById(req.user.id);
  if (!isUser)
    return next(new Error("unauthorized to make this action", { cause: 403 }));
  await Token.findOneAndDelete({ user: isUser });

  return res.status(200).json({ success: true, message: "تم تسجيل الخروج" });
};

export const allUsers = async (req, res, next) => {
  const users = await User.find();
  if (users.length === 0) return next(new Error("no users found "));
  return res.status(200).json({ success: true, results: users });
};

export const specificUser = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(new Error("invalid user Id", { cause: 400 }));

  const isUser = await User.findById(req.params.id);
  if (!isUser) return next(new Error("user not found", { cause: 404 }));

  return res.status(200).json({ success: true, result: isUser });
};

export const updateUser = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(new Error("invalid user Id", { cause: 400 }));

  const isUser = await User.findById(req.params.id);
  if (!isUser) return next(new Error("user not found", { cause: 404 }));

  const duplicatedToken = await Token.find({ user: isUser._id });
  if (duplicatedToken) {
    await Token.deleteMany({ user: isUser._id });
  }

  isUser.username = req.body.username ? req.body.username : isUser.username;
  isUser.name = req.body.name ? req.body.name : isUser.name;
  isUser.job = req.body.job ? req.body.job : isUser.job;
  isUser.slug = req.body.slug ? req.body.slug : isUser.slug;
  isUser.rank = req.body.rank ? req.body.rank : isUser.rank;
  isUser.role = req.body.role ? req.body.role : isUser.role;

  //change password
  if (req.body.password || req.body.confirmPassword) {
    if (req.body.password !== req.body.confirmPassword) {
      return next(new Error("password must match", { cause: 400 }));
    }

    isUser.pass = bjs.hashSync(
      req.body.password,
      parseInt(process.env.saltRound)
    );
  }

  await isUser.save();

  return res
    .status(200)
    .json({ success: true, message: "this user updated successfully" });
};

export const deleteUser = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return next(new Error("invalid User ID", { cause: 400 }));

  const isUser = await User.findById(req.params.id);
  if (!isUser) return next(new Error("user not found", { cause: 404 }));

  await Token.deleteMany({ user: isUser._id });
  await isUser.deleteOne();

  return res
    .status(200)
    .json({ success: true, message: "user deleted Successfully" });
};

export const search = async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    return res.status(200).json({
      success: true,
      result: [],
    });
  }

  const users = await User.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { username: { $regex: q, $options: "i" } },
      { job: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { role: { $regex: q, $options: "i" } },
      { rank: { $regex: q, $options: "i" } },
    ],
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    result: users,
  });
};
