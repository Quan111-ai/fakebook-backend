const mongoose = require('mongoose');
const Information = require('../models/Information');
const User = require('../models/User'); // Thêm User model để lấy role
const router = require('express').Router();
const { ensureAuth } = require('../middleware/authMiddleware');

router.post('/', ensureAuth, async (req, res) => {
  console.log('🟢 req.user:', req.user);
  try {
    const { fullName, hobbies, hometown, birthdate, phoneNumber } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'Người dùng không xác thực!' });
    }

    const newInfo = new Information({
      user: req.user._id,
      fullName,
      hobbies,
      hometown,
      birthdate: birthdate ? new Date(birthdate) : undefined,
      phoneNumber,
    });

    const savedInfo = await newInfo.save();
    res.status(201).json(savedInfo);
  } catch (error) {
    console.error('🚨 Lỗi khi tạo thông tin:', error);
    res.status(500).json({ error: 'Lỗi server!', details: error.message });
  }
});

// ✅ Lấy thông tin kèm role
router.get('/', ensureAuth, async (req, res) => {
  try {
    const info = await Information.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id); // Lấy thông tin user

    if (!info) return res.status(404).json({ error: 'Không tìm thấy thông tin!' });

    // Trả về thêm `role`
    res.json({ ...info.toObject(), role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server!', details: error.message });
  }
});

router.put('/', ensureAuth, async (req, res) => {
  try {
    const { fullName, hobbies, hometown, birthdate, phoneNumber } = req.body;

    if (phoneNumber) {
      const existingInfo = await Information.findOne({
        phoneNumber,
        user: { $ne: req.user._id }
      });

      if (existingInfo) {
        return res.status(400).json({ error: 'Số điện thoại đã tồn tại!' });
      }
    }

    const updatedInfo = await Information.findOneAndUpdate(
      { user: req.user._id },
      { fullName, hobbies, hometown, birthdate, phoneNumber },
      { new: true, runValidators: true }
    );

    if (!updatedInfo) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin!' });
    }

    res.json(updatedInfo);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi server!', details: error.message });
  }
});

router.delete('/', ensureAuth, async (req, res) => {
  try {
    const deletedInfo = await Information.findOneAndDelete({ user: req.user._id });

    if (!deletedInfo) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin để xóa!' });
    }

    res.json({ message: 'Xóa thông tin thành công!', deletedInfo });
  } catch (error) {
    console.error('🚨 Lỗi khi xóa thông tin:', error);
    res.status(500).json({ error: 'Lỗi server!', details: error.message });
  }
});

module.exports = router;
