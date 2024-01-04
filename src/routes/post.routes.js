import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    createPost,
    deletePost,
    getAllPosts,
    getPostById,
    getPostByUsername,
    updatePost,
} from "../controllers/post.controller.js";

const router = Router();

router
    .route("/create-post")
    .post(verifyJWT, upload.single("image"), createPost);
router.route("/get-allposts").get(verifyJWT, getAllPosts);
router.route("/getpost").get(verifyJWT, getPostById);
router.route("/delete-post").delete(verifyJWT, deletePost);
router
    .route("/update-post")
    .patch(verifyJWT, upload.single("image"), updatePost);

router.route("/get-allpost-byuser/:userName").get(verifyJWT, getPostByUsername);

export default router;
