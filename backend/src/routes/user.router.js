import { Router } from "express";
import userController from "../controllers/user.controller.js";

const router = Router()

router.route("/register").post(userController.registerUser)
router.route("/login").post(userController.loginUser)

export default router