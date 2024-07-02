import {Router} from "express"
import upload from "../middlewares/multer.middleware.js"
import fileController from "../controllers/file.controller.js"
const router = Router()

router.route("/image-compress").post(upload.single("file"), fileController.imageCompress)

export default router