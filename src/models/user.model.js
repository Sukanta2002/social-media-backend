import mongoose,{ Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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


User.pre("save", async (next) =>{
    this.password = await bcrypt.hash(this.password,10);
    next();
})

User.methods.isPasswordCorrect = async (password) => {
    return await bcrypt.compare(password,this.password);
}

User.methods.generateAccessToken = async () => {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE
        }
    )
}

User.methods.generateRefreshToken = async () => {
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        }
    )
}


export const User = mongoose.model("User",userSchema)