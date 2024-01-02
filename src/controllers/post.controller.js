import {Post} from "../models/post.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/apiResponce.js"


const postImage = asyncHandler(async (req, res) => {
    // get the image, caption from the req
    // check if the image and caption is exist
    // upload the image in the cloudinary
    // save the details in db

    const { caption } = req.body

    const imageLocalUrl = req.file.path

    if (!imageLocalUrl) {
        throw new ApiError(402, "Image is missing")
    }

    const imageUrl = await uploadOnCloudinary(imageLocalUrl)

    if (!imageUrl) {
        throw new ApiError(402, "Image is missing")
    }

    const post = await Post.create({
        image: imageUrl?.url,
        caption,
        owner: req.user?._id
    })

    return res
        .status(200)
        .json(
            new ApiResponce(200, post, "Post created sucessfully!!")
        )
})



export {
    postImage
}