import { Router } from "express";
import userController from "../controllers/user.controller";

const router = Router()

router.route("/register", userController.registerUser)
router.route("/login", userController.loginUser)

export default router