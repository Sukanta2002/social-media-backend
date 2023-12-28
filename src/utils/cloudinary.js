import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("File pathis empty");
        }

        const responce = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: "auto"
        }
        )

        fs.unlinkSync(localFilePath)
        return responce
    } catch (error) {
        console.log(" some error uploding");
        fs.unlinkSync(localFilePath);
    }
}

export { uploadOnCloudinary }