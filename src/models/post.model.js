import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        caption: {
            type: String,
        },
        image: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
