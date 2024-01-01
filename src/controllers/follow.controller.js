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

const unFollow = asyncHandler(async(req,res) =>{
    // get the username from the params
    // check the user name exist
    // check is the logged in user follow the user
    // delete the document in the db
    const userName = req.params.userName

    if (!userName) {
        throw new ApiError(402,"User name is missing")
    }

    const toBeUnfollowedUser = await User.findOne({
        userName
    })

    if (!toBeUnfollowedUser) {
        throw new ApiError(404,"User not found")
    }

    const follow = await Follow.findOne({
        $and:[
            {follower:req.user._id},
            {toFollowing:toBeUnfollowedUser._id}
        ]
    })

    if (!follow) {
        return res.status(200).json(
            new ApiResponce(200,{},"User is already unfollowed")
        )
    }

    const deletedData = await Follow.deleteOne(
        {
            _id:follow._id
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponce(200,deletedData,"User unfollowed sucessfully!!!")
    )
})

export {
    toFollow,
    unFollow
}
