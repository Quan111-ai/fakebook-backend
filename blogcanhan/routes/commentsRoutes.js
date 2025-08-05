const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments");
const { ensureAuth } = require("../middleware/authMiddleware");


router.post("/", ensureAuth, async (req, res) => {
  try {
    const { content, postId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ error: "Nội dung và postId là bắt buộc!" });
    }

    const newComment = new Comment({
      content,
      postId,
      userId: req.user._id,
    });

    await newComment.save();
    res.status(201).json({ message: "Bình luận đã được tạo!", comment: newComment });
  } catch (error) {
    console.error("🚨 Lỗi khi tạo bình luận:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});


router.get("/:postId", ensureAuth, async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ postId }).populate("userId", "email");
    if (!comments.length) {
      return res.status(404).json({ error: "Không có bình luận nào cho bài viết này!" });
    }

    res.json(comments);
  } catch (error) {
    console.error("🚨 Lỗi khi lấy bình luận theo bài viết:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});


router.put("/:id", ensureAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Không tìm thấy bình luận!" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền chỉnh sửa bình luận này!" });
    }

    comment.content = content || comment.content;
    await comment.save();
    res.json({ message: "Bình luận đã được cập nhật!", comment });
  } catch (error) {
    console.error("🚨 Lỗi khi cập nhật bình luận:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});


router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: "Không tìm thấy bình luận!" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền xóa bình luận này!" });
    }

    await comment.deleteOne();
    res.json({ message: "Bình luận đã được xóa!" });
  } catch (error) {
    console.error("🚨 Lỗi khi xóa bình luận:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});

module.exports = router;
