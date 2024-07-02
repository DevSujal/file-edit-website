import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { conf } from "../conf.js";
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.header("Authorization").split(" ")[1];

    if (!accessToken) {
      throw new ApiError(401, "Unauthrized request");
    }

    const decodedToken = jwt.verify(accessToken, conf.accessTokenSecret);

    if (!decodedToken) {
      throw new ApiError(401, "Unauthrized request");
    }

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(
      401,
      error?.messsage ||
        "something went wrong while validating the users access token"
    );
  }
});

export default verifyJwt
