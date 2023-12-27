import { mongoose, Schema } from "mongoose";

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    bio: {
        type: String
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

export const User = mongoose.model("Profile", userSchema)

