const express = require("express");
const mongoose = require("mongoose");
const Image = require("../models/Image");
const upload = require("../middleware/uploadMiddleware"); 
const cloudinary = require("../config/cloudinaryConfig"); 

const router = express.Router();


router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một ảnh!" });
    }

    const newImage = new Image({
      filename: req.file.originalname,
      url: req.file.path, 
      mimetype: req.file.mimetype,
      size: req.file.size,
      cloudinary_id: req.file.filename, 
    });

    await newImage.save();
    res.status(201).json({ message: "Upload ảnh thành công!", image: newImage });
  } catch (error) {
    console.error("Lỗi khi upload ảnh:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
});


router.get("/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json({ images });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ảnh:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
});


router.get("/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Không tìm thấy ảnh!" });
    }
    res.json({ image });
  } catch (error) {
    console.error("Lỗi khi lấy ảnh:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
});


router.put("/images/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Không tìm thấy ảnh!" });
    }

    if (req.file && image.cloudinary_id) {
      await cloudinary.uploader.destroy(image.cloudinary_id);
    }

    if (req.file) {
      image.filename = req.file.originalname;
      image.url = req.file.path; 
      image.mimetype = req.file.mimetype;
      image.size = req.file.size;
      image.cloudinary_id = req.file.filename; 
    }

    await image.save();
    res.json({ message: "Cập nhật ảnh thành công!", image });
  } catch (error) {
    console.error("Lỗi khi cập nhật ảnh:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
});


router.delete("/images/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Không tìm thấy ảnh!" });
    }

    if (image.cloudinary_id) {
      await cloudinary.uploader.destroy(image.cloudinary_id);
    }

    await Image.findByIdAndDelete(id);
    res.json({ message: "Xóa ảnh thành công!" });
  } catch (error) {
    console.error("Lỗi khi xoá ảnh:", error);
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
});

module.exports = router;
