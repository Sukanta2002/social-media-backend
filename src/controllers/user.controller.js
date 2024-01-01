import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// A methord to generate the refresh abd access token
const generateRefreshAccessToken = async (userId) => {
    if (!userId) {
        throw new ApiError(401, "User is required!!")
    }

    const user = await User.findById(userId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    user.save({ validatrBeforeSave: false })

    return {
        refreshToken,
        accessToken
    }
}


// Register the user
const registerUser = asyncHandler(async (req, res) => {
    //get the data from the body 
    // check if the data is avable
    //upload the profile pic to the cloudnary
    //get the cloudnary link
    //check if it is avable
    // save all data to the db 
    // return the responce
    const { userName, password, email, fullName, bio } = req.body

    console.log(req.body);
    if (!userName || !password || !email || !fullName) {
        throw new ApiError(401, "Enter the required parameters");
    }
    const existUser = await User.findOne({
        $or: [{ userName, email }]
    })

    if (existUser) {
        throw new ApiError(400, "User already exist")
    }

    const profilePicLocalUrl = req.files?.profilePic[0].path;
    const coverImageLocalUrl = req.files?.coverImage[0].path;
    console.log(`${profilePicLocalUrl} and ${coverImageLocalUrl}`);

    if (!profilePicLocalUrl) {
        throw new ApiError(401, "Profile Pic is required")
    }

    const profilePicUrl = await uploadOnCloudinary(profilePicLocalUrl);

    if (!profilePicUrl) {
        throw new ApiError(401, "Profile Pic is required")
    }
    let coverImageUrl
    if (coverImageLocalUrl) {
        coverImageUrl = await uploadOnCloudinary(coverImageLocalUrl)
    }

    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        fullName,
        password,
        profilePic: profilePicUrl.url,
        coverImage: coverImageUrl?.url || "",
        bio,

    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // return res
    res.status(200).json(
        new ApiResponce(200, createdUser, "User Registered Sucessfully")
    )
})

// Login the user
const loginUser = asyncHandler(async (req, res) => {
    // recive the email or username and the password from the frontend
    // check it is not empty
    // check if the user exist or not
    // compair the password 
    // generate the refresh and access token
    // check if it exist
    // return the responce with the cookies 

    const { userName, email, password } = req.body;

    if ((!userName && !email) || !password) {
        throw new ApiError(401, "Username or emil and password is missing!!!")
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!user) {
        throw new ApiError(404, "User not found!!!")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if (!isPasswordCorrect) {
        throw new ApiError(402, "Wrong password!!!")
    }

    const { refreshToken, accessToken } = await generateRefreshAccessToken(user._id);

    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponce(200, logedInUser, "User logged in sucessfully!!")
        )

})

// logout the user
const logoutUser = asyncHandler(async (req, res) => {
    // verify that the access token is valid or not
    // get the user from the req
    // run a query to update the refresh token in db
    // return the responce and clear the cookies

    await User.findByIdAndUpdate(req.user._id,
        {
            refreshToken: undefined
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponce(200, {}, "User logged out Sucessfully!!")
        )
})

// for refresh the access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // get the refresh token from the frontend
    // decord the refresh token
    // get the user by the id from the access token
    // compair the refresh token in db with the user given refresh token
    // generate new tokens
    // update the user in db with new tokens
    // return the responce with cookies 

    const currentRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!currentRefreshToken) {
        throw new ApiError(401, "Unauthorized access!!!")
    }

    const decodedToken = await jwt.verify(currentRefreshToken, process.env.REFERSH_TOKEN_SECRET)

    const user = await User.findById(decodedToken._id)

    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (user.refreshToken !== currentRefreshToken) {
        throw new ApiError(401, "Refresh token expaired")
    }

    const { refreshToken, accessToken } = await generateRefreshAccessToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(200, {
                refreshToken,
                accessToken
            },
                "Access Token refreshed sucessfully"
            )
        )
})

// update the profile pic
const updateProfilePic = asyncHandler(async (req, res) => {
    // console.log(req);
    const profilePicLocalUrl = req.file.path;

    if (!profilePicLocalUrl) {
        throw new ApiError(402, "Profile pic is required!!")
    }

    const profilePicUrl = await uploadOnCloudinary(profilePicLocalUrl)

    if (!profilePicUrl) {
        throw new ApiError(402, "Profile pic is required!!")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            profilePic: profilePicUrl.url
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(402, "Some error in db!!")
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, user, "Profilepic updated Sucessfully!")
        )
})

// update the profile pic
const updateCoverImage = asyncHandler(async (req, res) => {
    // console.log(req);
    const coverImageLocalUrl = req.file.path;

    if (!coverImageLocalUrl) {
        throw new ApiError(402, "Profile pic is required!!")
    }

    const coverImageUrl = await uploadOnCloudinary(coverImageLocalUrl)

    if (!coverImageUrl) {
        throw new ApiError(402, "Profile pic is required!!")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            profilePic: coverImageUrl.url
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(402, "Some error in db!!")
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, user, "Cover Image updated Sucessfully!")
        )
})

// get the current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponce(200, req.user, "Current user fetched sucessfully")
        )
})

// update user details
const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, bio, } = req.body

    if (!fullName || !bio) {
        throw new ApiError(401, "fullname and bio is missing")
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        fullName,
        bio
    }, {
        new: true
    }).select("-password -refreshToken")

    return res
        .status(200)
        .json(
            new ApiResponce(200, user, "User detail update sucessfully")
        )
})

// get the user profile including follower and following
const getUserProfile = asyncHandler(async (req, res) => {
    const userName = req.params

    if (!userName) {
        new ApiError(402, "User name is missing")
    }

    const userProfile = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user._id) }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "toFollowing",
                as: "follower"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "following"
            }
        },
        {
            $addFields: {
                follower: {
                    $size: "$follower"
                },
                following: {
                    $size: "$following"
                },
                isFollowed: {
                    $cond: {
                        if: { $in: [req.user._id, "$follower"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0
            }
        }
    ])

    if (!userProfile) {
        throw new ApiError(404, "User not found!")
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, userProfile, "User profile fetched sucessfully")
        )
})

const changePassword = asyncHandler(async (req, res) => {
    // get the current password and new password from the body
    // check if the field are not empty
    // get the user 
    // compair the password
    // set the new password
    // save the user
    const { newPassword, currentPassword } = req.body

    if (!currentPassword || !newPassword) {
        throw new ApiError(402, "current password or new password is missing")
    }

    const user = await User.findById(req.user._id)

    if (!user) {
        throw new ApiError(401, "Unauthorized access")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "wrong password")
    }

    user.password = newPassword

    await user.save()

    return res
        .status(200)
        .json(
            new ApiResponce(200, {}, "Password Changed sucessfully!!")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateProfilePic,
    getCurrentUser,
    updateCoverImage,
    updateUserDetails,
    getUserProfile,
    changePassword
}