import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toFollow,
    unFollow
} from "../controllers/follow.controller.js"

const router = Router()

router.route("/to-follow/:userName").post(verifyJWT, toFollow)
router.route("/unfollow/:userName").post(verifyJWT, unFollow)


export default router;