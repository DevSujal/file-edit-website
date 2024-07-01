import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { conf } from "./conf";

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

export default app;
