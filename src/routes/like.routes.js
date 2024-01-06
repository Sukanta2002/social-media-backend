import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { likePost, unLikePost } from "../controllers/like.controller.js";

const router = Router();

router.route("/").post(verifyJWT, likePost).delete(verifyJWT, unLikePost);

export default router;
