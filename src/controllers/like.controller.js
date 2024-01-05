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

    const post = await Post.findOne({ _id: postId });

    if (!post) {
        throw new ApiError(404, "Post not found");
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

export { likePost };
