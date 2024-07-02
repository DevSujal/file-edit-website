import { Router } from "express";
import userController from "../controllers/user.controller.js";
import verifyJwt from "../middlewares/verifyJwt.middleware.js";


const router = Router();
router.route("/register").post(userController.registerUser);
router.route("/login").post(userController.loginUser);
router.route("/logout").post(verifyJwt, userController.logoutUser);
router.route("/refresh-access-token").post(userController.refreshAccessToken);
router
  .route("/update-user-profile")
  .post(verifyJwt, userController.updateUserProfile);
router
  .route("/update-password")
  .post(verifyJwt, userController.updatePassword);

  
export default router;
