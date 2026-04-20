


import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "vehicle-rental-system/vehicles",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    resource_type: "image",
  }),
});

const upload = multer({ storage });

export default upload;