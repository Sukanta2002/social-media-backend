import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const createPost = asyncHandler(async (req, res) => {
    // get the image, caption from the req
    // check if the image and caption is exist
    // upload the image in the cloudinary
    // save the details in db

    const { caption } = req.body;

    const imageLocalUrl = req.file.path;

    if (!imageLocalUrl) {
        throw new ApiError(402, "Image is missing");
    }

    const imageUrl = await uploadOnCloudinary(imageLocalUrl);

    if (!imageUrl) {
        throw new ApiError(402, "Image is missing");
    }

    const post = await Post.create({
        image: imageUrl?.url,
        caption,
        owner: req.user?._id,
    });

    return res
        .status(200)
        .json(new ApiResponce(200, post, "Post created sucessfully!!"));
});

const getAllPosts = asyncHandler(async (req, res) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized access");
    }

    const posts = await Post.find({
        owner: user._id,
    });

    if (posts.length === 0) {
        return res.status(200).json(new ApiResponce(200, posts, "No post"));
    }

    return res
        .status(200)
        .json(new ApiResponce(200, posts, "All posts fetched sucessfully!"));
});

const getPostById = asyncHandler(async (req, res) => {
    const postId = req.body.postId;

    if (!postId) {
        throw new ApiError(402, "Post is missing");
    }

    const post = await Post.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(postId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            fullName: 1,
                            profilePic: 1,
                            coverImage: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);

    if (post.length === 0) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, post[0], "post fetched sucessfully"));
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        throw new ApiError(404, "Post not found");
    }

    const post = await Post.findOne({ _id: postId });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const imageUrl = post.image;

    const deletedPost = await Post.deleteOne({
        _id: post._id,
    });

    if (!deletedPost) {
        throw new ApiError(400, "Post is not deleted");
    }

    await deleteOnCloudinary(imageUrl);
    return res
        .status(200)
        .json(new ApiResponce(200, deletedPost, "Post deleted Sucesfully!"));
});

const updatePost = asyncHandler(async (req, res) => {
    const { caption, postId } = req.body;

    const post = await Post.findOne({ _id: postId });

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const oldImageUrl = post.image;
    const imageLocalUrl = req.file?.path;

    if (!imageLocalUrl) {
        const updatedPost = await Post.findByIdAndUpdate(
            post._id,
            {
                caption,
            },
            {
                new: true,
            }
        );
        if (!updatedPost) {
            throw new ApiError(402, "Error in updating db");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(200, updatedPost, "Post updated Sucessfully")
            );
    }

    const imageUrl = await uploadOnCloudinary(imageLocalUrl);

    if (!imageUrl) {
        throw new ApiResponce(402, "Image is missing");
    }

    const updatedPost = await Post.findByIdAndUpdate(
        post._id,
        {
            caption,
            image: imageUrl.url,
        },
        {
            new: true,
        }
    );

    await deleteOnCloudinary(oldImageUrl);
    if (!updatedPost) {
        throw new ApiError(402, "Error in updating db");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, updatedPost, "Post updated sucesfully"));
});

const getPostByUsername = asyncHandler(async (req, res) => {
    const userName = req.params.userName;

    if (!userName) {
        throw new ApiError(402, "Username is missing");
    }

    const user = await User.findOne({ userName });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const posts = await Post.find({ owner: user._id });

    if (posts.length === 0) {
        throw new ApiError(404, "No post found");
    }

    return res
        .status(200)
        .json(
            new ApiResponce(200, posts, "All posts are fetched successfully")
        );
});

export {
    createPost,
    getAllPosts,
    getPostById,
    deletePost,
    updatePost,
    getPostByUsername,
};

// TODO: getBookMarkedPosts
// TODO: getLikedPosts
// TODO: modify the get posts to show how many likes are their
