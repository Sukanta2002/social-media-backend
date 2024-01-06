import { Like } from "../models/like.model.js";
import { Post } from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";

const likePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        throw new ApiError(402, "Post is missing");
    }
    const user = req.user;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = await Like.findOne({
        $and: [
            {likedBy: user._id},
            {likedTo: post._id}
        ]
    })

    if (alreadyLiked) {
        res
        .status(200)
        .json(
            new ApiResponce(200,alreadyLiked,"Post already liked")
        )
    }
    const result = await Like.create({
        likedBy: user._id,
        likedTo: post._id,
    });

    if (!result) {
        throw new ApiError(400, "Something Went wrong");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, result, "Post liked successfully"));
});

const unLikePost = asyncHandler(async (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        throw new ApiError(402, "Post id is missing");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = await Like.findOne({
        $and: [
            {likedBy: req.user._id},
            {likedTo: post._id}
        ]
    });

    if (!alreadyLiked) {
        throw new ApiError(404, "The post is already unliked");
    }

    const deletedData = await Like.deleteOne({
        _id: alreadyLiked._id,
    });

    res.status(200).json(
        new ApiResponce(200, deletedData, "post unliked sucessfully")
    );
});

export { likePost, unLikePost };
