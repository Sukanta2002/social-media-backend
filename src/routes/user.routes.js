import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {
    changePassword,
    getCurrentUser,
    getUserProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateCoverImage,
    updateProfilePic,
    updateUserDetails
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.route("/register").post(upload.fields([
    {
        name: "profilePic",
        maxCount: 1
    },


    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

router.route("/login").post(loginUser)

// Secure route
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/update-profile-pic").patch(verifyJWT, upload.single("profilePic"), updateProfilePic)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/update-user-details").patch(verifyJWT, updateUserDetails)
router.route("/get-user-profile/:userName").get(verifyJWT, getUserProfile)
router.route("/change-password").patch(verifyJWT,changePassword)

export default router;