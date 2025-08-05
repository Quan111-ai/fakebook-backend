const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { ensureAuth } = require("../middleware/authMiddleware");

router.post("/", ensureAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server!", details: error.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Lỗi server!", details: error.message });
  }
});



router.delete('/', ensureAuth, async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này!' });
      }
  
      await Category.deleteMany({});
      res.json({ message: 'Tất cả Category đã được xoá thành công!' });
    } catch (error) {
      console.error('🚨 Lỗi khi xoá tất cả category:', error);
      res.status(500).json({ message: 'Lỗi server!', error: error.message });
    }
  });


router.put('/:id', ensureAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên category không được để trống' });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Không tìm thấy category' });
    }
    res.status(200).json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật category', error: err.message });
  }
});

module.exports = router;
