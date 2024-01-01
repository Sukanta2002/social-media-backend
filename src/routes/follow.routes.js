import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    toFollow
} from "../controllers/follow.controller.js"

const router = Router()

router.route("/to-follow/:userName").post(verifyJWT,toFollow)


export default router;