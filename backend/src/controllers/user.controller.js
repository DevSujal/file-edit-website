import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { conf } from "../conf.js";
import jwt from "jsonwebtoken";
const userController = {};

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false,
    });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

userController.registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName || !email || !password) {
    throw new ApiError(400, "all fields are required");
  }

  if ([userName, email, password].some((field) => field.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!email.includes("@", ".")) {
    throw new ApiError(400, "email is not valid");
  }

  if (existedUser) {
    throw new ApiError(409, "user with email or username already exist");
  }

  const user = await User.create({
    userName,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

userController.loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "userName or email is required");
  }

  if(!password){
    throw new ApiError(400, "password is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (!user.isPasswordCorrect(password)) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

userController.logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!user) {
    throw new ApiError(500, "something went wrong while logout");
  }

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

userController.refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized requiest");
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      conf.refreshTokenSecret
    );

    const user = await User.findById(decodedRefreshToken._id);

    if (!user) {
      throw new ApiError(404, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message ||
        "something went wrong while validating the refresh token"
    );
  }
});

userController.updateUserProfile = asyncHandler(async (req, res) => {
  const { userName, email } = req.body;

  if (!userName && !email) {
    throw new ApiError(400, "userName or email is required to change");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        userName: userName ? userName : req.user.userName,
        email: email ? email : req.user.email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "something went wrong while updating user profile");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

userController.updatePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if(!password) {
    throw new ApiError(400, "password is required");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { password },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "something went wrong while updating password");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "password updated successfully"));
});

export default userController;
