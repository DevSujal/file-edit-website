import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import fileController from "../controllers/file.controller.js";
const router = Router();

router
  .route("/image-compress")
  .post(upload.single("file"), fileController.imageCompress);
router
  .route("/type-convert")
  .post(upload.single("file"), fileController.typeConverter);
router
  .route("/pdf-to-images")
  .post(upload.single("file"), fileController.pdfToImages);
router
  .route("/images-to-pdf")
  .post(upload.array("files", 100), fileController.imagesToPdf);

export default router;
