const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");
const { ensureAuth } = require("../middleware/authMiddleware");


router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tên tag không được để trống!" });

    const newTag = new Tag({ name });
    await newTag.save();
    res.status(201).json({ message: "Tag được tạo thành công!", tag: newTag });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo tag!", error: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách tag!", error: error.message });
  }
});


router.put("/:id", ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tên tag không được để trống!" });

    const updatedTag = await Tag.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updatedTag) return res.status(404).json({ message: "Không tìm thấy tag!" });

    res.status(200).json({ message: "Tag đã được cập nhật!", tag: updatedTag });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật tag!", error: error.message });
  }
});


router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const deletedTag = await Tag.findByIdAndDelete(req.params.id);
    if (!deletedTag) return res.status(404).json({ message: "Không tìm thấy tag!" });

    res.status(200).json({ message: "Tag đã được xoá!", tag: deletedTag });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá tag!", error: error.message });
  }
});

module.exports = router;