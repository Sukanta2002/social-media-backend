import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPost,
} from "../controllers/post.controller.js";

const router = Router();

router.route("/post-image").post(verifyJWT, upload.single("image"), createPost);
router.route("/get-allposts").get(verifyJWT, getAllPosts);
router.route("/getpost").get(verifyJWT, getPost);
router.route("/delete-post").delete(verifyJWT, deletePost);

export default router;
