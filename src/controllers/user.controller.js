import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    //get the data from the body 
    // check if the data is avable
    //upload the profile pic to the cloudnary
    //get the cloudnary link
    //check if it is avable
    // save all data to the db 
    // return the responce
    const { userName, password, email, fullName, bio } = req.body

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



export {
    registerUser,
}