import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { conf } from "./conf.js";

const app = express();

const limit = "16kb";

app.use(
  cors({
    origin: conf.origin,
    credentials: true,
  })
);

app.use(express.json({ limit }));

app.use(
  express.urlencoded({
    extended: true,
    limit,
  })
);

app.use(express.static("public"));

app.use(cookieParser());

// routes

import userRouter from "./routes/user.router.js";
import fileRouter from "./routes/file.router.js";

app.use("/api/v1/users", userRouter)
// http://localhost:8000/api/v1/users/register
app.use("/api/v1/files", fileRouter)

export default app;
