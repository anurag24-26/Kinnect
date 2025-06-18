const cloudinary = require("../config/cloudinary");

exports.uploadToCloudinary = async (filePath, folder = "kinnect/uploads") => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "auto",
  });
  return result.secure_url;
};
