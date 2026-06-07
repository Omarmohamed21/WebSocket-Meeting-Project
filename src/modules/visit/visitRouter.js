import { Router } from "express";
import { asyncHandler } from "./../../middlewares/asyncHandler.js";
import { authentication } from "./../../middlewares/authentication.js";
import { authorization } from "./../../middlewares/authorization.js";
import * as visitController from "./visitController.js";

const router = Router();

router.get(
  "/allVisits",
  authentication,
  authorization("superAdmin"),
  asyncHandler(visitController.allVisits)
);

router.get(
  "/searchVisit",
  authentication,
  authorization("superAdmin"),
  asyncHandler(visitController.searchVisit)
);
//duplicate this request for admin

router.get(
  "/adminVisits",
  authentication,
  authorization("admin"),
  asyncHandler(visitController.adminVisits)
);

router.get(
  "/adminSearch",
  authentication,
  authorization("admin"),
  asyncHandler(visitController.adminSearch)
);

router.get(
  "/specificVisit/:id",
  authentication,
  //authorization in the controller
  asyncHandler(visitController.specificVisit)
);
//duplicate this request for admin

router.get(
  "/deliveredVisits",
  authentication,
  asyncHandler(visitController.deliveredVisits)
);

router.patch(
  "/updateVisit/:id",
  authentication,
  asyncHandler(visitController.updateVisit)
);

router.delete(
  "/deleteVisit/:id",
  authentication,
  //authorization in the controller
  asyncHandler(visitController.deleteVisit)
);
//duplicate this request for admin
router.get(
  "/userVisit",
  authentication,
  asyncHandler(visitController.userVisit)
);
export default router;
