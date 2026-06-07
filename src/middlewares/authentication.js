import { asyncHandler } from "./asyncHandler.js";
import { Token } from "../../DB/models/tokenModel.js";
import jwt from "jsonwebtoken";
import { User } from "./../../DB/models/userModel.js";

export const authentication = asyncHandler(async (req, res, next) => {
  const token = req.headers.token;
  if (!token) return next(new Error("Token Missing ", { cause: 401 }));
  const tokenDB = await Token.findOne({ token, isValid: true });
  if (!tokenDB)
    return next(
      new Error("token is expired, please sign in again", { cause: 400 })
    );

  const payload = jwt.verify(token, process.env.secretKey);

  const isUser = await User.findById(payload.id);
  if (!isUser) return next(new Error("user not found", { cause: 404 }));

  req.user = isUser;
  return next();
});
