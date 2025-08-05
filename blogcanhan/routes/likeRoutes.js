const express = require("express");
const router = express.Router();
const Like = require("../models/Like");
const { ensureAuth } = require("../middleware/authMiddleware");


router.post("/:postId", ensureAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      await Like.findByIdAndDelete(existingLike._id);
      return res.status(200).json({ message: "Đã huỷ like." });
    } else {
      const newLike = new Like({ user: userId, post: postId });
      await newLike.save();
      return res.status(201).json({ message: "Đã like bài viết!", like: newLike });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thực hiện thao tác like.", error: error.message });
  }
});


router.get("/:postId/count", async (req, res) => {
  try {
    const { postId } = req.params;
    const likeCount = await Like.countDocuments({ post: postId });
    res.status(200).json({ postId, likeCount });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đếm like.", error: error.message });
  }
});


router.get("/:postId/users", async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId }).populate("user", "email");
    res.status(200).json(likes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng.", error: error.message });
  }
});

module.exports = router;
