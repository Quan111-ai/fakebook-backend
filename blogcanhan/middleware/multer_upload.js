const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        format: async (req, file) => file.mimetype.split("/")[1], 
        public_id: (req, file) => Date.now() + "-" + file.originalname, 
    },
});

const upload = multer({ storage });

module.exports = upload;
