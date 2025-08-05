const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig"); 


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", 
    format: async (req, file) => "png", 
    public_id: (req, file) => file.originalname.split(".")[0], 
  },
});

const upload = multer({ storage });

module.exports = upload;
