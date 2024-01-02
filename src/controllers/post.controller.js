import {Post} from "../models/post.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/apiResponce.js"
import mongoose from "mongoose"


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

const getAllPosts = asyncHandler(async(req,res) => {
    const user = req.user

    if (!user) {
        throw new ApiError(401,"Unauthorized access")
    }

    const posts = await Post.find({
        "owner": user._id
    })

    if (posts.length === 0) {
        return res
        .status(200)
        .json(
            new ApiResponce(200,posts,"No post")
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200,posts,"All posts fetched sucessfully!")
    )
})

const getPost = asyncHandler(async(req,res)=>{
    const postId = req.body.postId

    if (!postId) {
        throw new ApiError(402,"Post is missing")
    }

    const post = await Post.aggregate([
        {
          '$match': {
            '_id': new mongoose.Types.ObjectId(postId)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'owner', 
            'foreignField': '_id', 
            'as': 'owner', 
            'pipeline': [
              {
                '$project': {
                  'userName': 1, 
                  'fullName': 1, 
                  'profilePic': 1, 
                  'coverImage': 1
                }
              }
            ]
          }
        }, {
          '$addFields': {
            'owner': {
              '$first': '$owner'
            }
          }
        }
      ])

    if (post.length === 0) {
        throw new ApiError(404,"Post not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponce(200,post[0],"post fetched sucessfully")
    )
})

export {
    postImage,
    getAllPosts,
    getPost
}