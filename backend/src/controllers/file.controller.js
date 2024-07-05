import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import ApiError from "../utils/ApiError.js";
import { PDFDocument } from "pdf-lib";
import pdfPoppler from "pdf-poppler";
import { exec } from "child_process";
sharp.cache(false); // internally, sharp maintains a cache of (open) files, which will block the original file from being deleted. thats why we have to do cache false it prevents from cache saving
const fileController = {};

const getFileUrl = (req, fileName, name) =>
  `${req.protocol}://${req.get("host")}/temp/${name}-${fileName}`;

const compressFile = async (inputFilePath, outputFilePath, quality) => {
  try {
    const image = sharp(inputFilePath);
    await image.jpeg({ quality }).toFile(outputFilePath);
    fs.unlinkSync(inputFilePath);
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while compressing image"
    );
  }
};

const convertType = async (inputFile, outputFile) => {
  try {
    const image = sharp(inputFile);
    await image.toFile(outputFile);
    fs.unlinkSync(inputFile);
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while converting file type"
    );
  }
};

const pdfToImages = async (pdfPath, pageOffset = 1) => {
  try {
    let opts = {
      format: "jpeg",
      out_dir: path.resolve("public/temp"),
      out_prefix: path.basename(pdfPath, path.extname(pdfPath)),
      page: pageOffset,
    };

    await pdfPoppler.convert(pdfPath, opts);
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Something went wrong while converting PDF to image"
    );
  }
};

const deleteFile = (filePath) => {
  try {
    setTimeout(() => {
      fs.unlinkSync(filePath);
    }, 60000);
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while deleting file"
    );
  }
};
async function createPdfFromImages(imagePaths, outputPdfPath) {
  const pdfDoc = await PDFDocument.create();

  for (const imagePath of imagePaths) {
    const imageBytes = fs.readFileSync(imagePath);
    const image = await pdfDoc.embedJpg(imageBytes);

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    fs.unlinkSync(imagePath);
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPdfPath, pdfBytes);
}

fileController.imageCompress = asyncHandler(async (req, res) => {
  try {
    const fileName = req.file?.filename;
    const inputFilePath = path.resolve(`public/temp/${fileName}`);
    const outputFilePath = path.resolve(`public/temp/compressed-${fileName}`);
    const { quality } = req.body;

    await compressFile(inputFilePath, outputFilePath, quality);

    const fileUrl = getFileUrl(req, `${fileName}`, "compressed");
    // delete file after 1 minute
    deleteFile(outputFilePath);
    res
      .status(200)
      .json(new ApiResponse(200, { fileUrl }, "Image compressed successfully"));
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while compressing image"
    );
  }
});

fileController.typeConverter = asyncHandler(async (req, res) => {
  try {
    const inputFile = req.file?.path;
    console.log("inputFile", inputFile);
    const fileName = path.basename(inputFile).split(".")[0];
    const { type } = req.body;
    if (!inputFile || !type) {
      throw new ApiError(400, "file not found or type not provided");
    }
    const outputFile = path.resolve(
      `public/temp/typeChanged-${fileName}.${type}`
    );
    await convertType(inputFile, outputFile);
    deleteFile(outputFile);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fileUrl: getFileUrl(req, `${fileName}.${type}`, "typeChanged") },
          "File type converted successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while conveting file type"
    );
  }
});

fileController.pdfToImages = asyncHandler(async (req, res) => {
  try {
    const pdfPath = req.file?.path;
    const pdfName = path.basename(pdfPath).split(".")[0];
    if (!pdfPath) {
      throw new ApiError(400, "pdf not found");
    }

    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const numPages = pdfDoc.getPageCount();
    const outputFilePath = [];
    const fileUrl = [];
    for (let i = 0; i < numPages; i++) {
      await pdfToImages(pdfPath, i + 1);
      outputFilePath.push(path.resolve(`public/temp/${pdfName}-${i + 1}.jpg`));
      fileUrl.push(getFileUrl(req, `${i + 1}.jpg`, pdfName));
    }
    fs.unlinkSync(pdfPath);

    // delete file after 1 minute
    outputFilePath.forEach((file) => deleteFile(file));
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { fileUrl },
          "Pdf converted to images successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while converting pdf to images"
    );
  }
});

fileController.imagesToPdf = asyncHandler(async (req, res) => {
  try {
    const files = req?.files;
    if (!files || files.length === 0) {
      throw new ApiError(400, "files not found");
    }

    const filePaths = files.map((file) => file?.path);

    await createPdfFromImages(
      filePaths,
      path.resolve(`public/temp/merged.pdf`)
    );
    deleteFile(path.resolve(`public/temp/merged.pdf`));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          fileUrl: `${req.protocol}://${req.get("host")}/temp/merged.pdf`,
        },
        "Images merged to pdf successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "somthing went wrong while merging images to pdf"
    );
  }
});

export default fileController;
