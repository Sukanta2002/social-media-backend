import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    getAllPosts,
    getPost,
    postImage
} from "../controllers/post.controller.js"

const router = Router()

router.route("/post-image").post(verifyJWT,upload.single("image"),postImage)
router.route("/get-allposts").get(verifyJWT,getAllPosts)
router.route("/getpost").get(verifyJWT,getPost)

export default router