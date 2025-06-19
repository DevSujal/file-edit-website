import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { conf } from "../conf.js";
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique : true,
    },
    email: {
      type: String,
      required: true,
      unique : true
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const hashLevel = 10;

userSchema.pre("save", async function (next) {
  if (this.isModified(this.password)) {
    this.password = await bcrypt.hash(this.password, hashLevel);
  }

  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    conf.refreshTokenSecret,
    {
      expiresIn: conf.refreshTokenExpiry,
    }
  );
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      userName : this.userName,
      email : this.email
    },
    conf.accessTokenSecret,
    {
      expiresIn: conf.accessTokenExpiry,
    }
  );
};

export const User = mongoose.model("User", userSchema);
