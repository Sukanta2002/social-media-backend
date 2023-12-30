import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

const uploadOnCloudinary = async function (localFilePath) {
    // console.log(localFilePath);
    try {
        //if the path is empty return null
        if (!localFilePath) return null;

        console.log("hiii 1");
        //main code to upload file
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(responce);
        fs.unlinkSync(localFilePath);
        return responce
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        console.log("Error on cloudnary");
        return null;
    }

}

export { uploadOnCloudinary }