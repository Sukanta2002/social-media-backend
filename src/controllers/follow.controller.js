import { Follow } from "../models/follow.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponce } from "../utils/apiResponce.js";

const toFollow = asyncHandler(async (req, res) => {
    // get the user name from the params
    // insert the userid of the current user in follow
    // insert the userid of the user to whome he follow

    const userName = req.params.userName

    if (!userName) {
        throw new ApiError(402, "User name is missing")
    }

    const userToFollow = await User.findOne({ userName })

    if (!userToFollow) {
        throw new ApiError(404, "User not found!!")
    }

    const isFollowed = await Follow.findOne({
        $and:[
            {follower:req.user._id},
            {toFollowing:userToFollow._id}
        ]
    })

    if (isFollowed) {
        return res
        .status(200)
        .json(
            new ApiResponce(200,isFollowed,"Already Followed")
        )
    }
    const follow = await Follow.create({
        follower: req.user._id,
        toFollowing: userToFollow._id
    })

    return res
        .status(200)
        .json(
            new ApiResponce(200, follow, "Followed Successfully")
        )
})

export {
    toFollow
}
