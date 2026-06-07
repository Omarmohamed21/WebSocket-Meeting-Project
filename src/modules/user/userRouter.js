import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import * as userController from "./userController.js";
import { authentication } from "./../../middlewares/authentication.js";
import { authorization } from "../../middlewares/authorization.js";
const router = Router();

router.post(
  "/register",
  //authentication,
 // authorization("superAdmin"),
  asyncHandler(userController.register)
);

router.post("/login", asyncHandler(userController.login));

router.post("/logout", authentication, asyncHandler(userController.logout));

router.get(
  "/allUsers",
  authentication,
  authorization("superAdmin"),
  asyncHandler(userController.allUsers)
);
router.get(
  "/specificUser/:id",
  authentication,
  authorization("superAdmin"),
  asyncHandler(userController.specificUser)
);
router.patch(
  "/updateUser/:id",
  authentication,
  authorization("superAdmin"),
  asyncHandler(userController.updateUser)
);

router.delete(
  "/deleteUser/:id",
  authentication,
  authorization("superAdmin"),
  asyncHandler(userController.deleteUser)
);

router.get(
  "/search",
  authentication,
  authorization("superAdmin"),
  asyncHandler(userController.search)
);
export default router;
