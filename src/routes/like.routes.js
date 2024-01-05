import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likePost } from "../controllers/like.controller.js";

const router = Router();

router.route("/").post(verifyJWT, likePost);

export default router;
