import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    postImage
} from "../controllers/post.controller.js"

const router = Router()

router.route("/post-image").post(verifyJWT,upload.single("image"),postImage)


export default router