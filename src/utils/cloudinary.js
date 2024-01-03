import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const uploadOnCloudinary = async function (localFilePath) {
    // console.log(localFilePath);
    try {
        //if the path is empty return null
        if (!localFilePath) return null;

        // console.log("hiii 1");
        //main code to upload file
        const responce = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localFilePath);
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
        console.log("Error on cloudnary");
        return null;
    }
};

const deleteOnCloudinary = async function (url) {
    try {
        // check if url is present or not
        if (!url) return null;
        // get the public id from the public url of cloudinary
        const array = url.split("/");
        const publicId = array[array.length - 1].split(".")[0];

        console.log(publicId);
        //delete the file using cloudinary api
        const result = await cloudinary.uploader
            .destroy(publicId.trim())
            .then((result) => console.log(result))
            .catch((err) => console.log(err));
        return result;
    } catch (error) {
        console.log("Error on deleting on cloudinary!!");
        return null;
    }
};
export { uploadOnCloudinary, deleteOnCloudinary };
