import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import router for user
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

// import router for follow
import followRouter from "./routes/follow.routes.js";

app.use("/api/v1/follow", followRouter);

// import router for post
import postRouter from "./routes/post.routes.js";

app.use("/api/v1/post", postRouter);

export default app;
