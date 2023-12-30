import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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


export {
    registerUser,
    loginUser
}