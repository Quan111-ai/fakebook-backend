const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  filename: String,
  url: String, 
  mimetype: String,
  size: Number,
  cloudinary_id: String, 
}, { timestamps: true });

module.exports = mongoose.model("Image", ImageSchema);
