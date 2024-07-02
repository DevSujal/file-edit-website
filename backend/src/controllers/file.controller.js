import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js"

const fileController = {}

fileController.imageCompress = asyncHandler(async (req, res) => {
    const file = req.file?.path
    console.log(file);
    res.status(200)
    .json(new ApiResponse(200, {},"file uploaded successfully"))
})

export default fileController