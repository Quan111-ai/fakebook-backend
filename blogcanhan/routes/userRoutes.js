const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: 'Tạo tài khoản thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});


router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});


router.get("/", authMiddleware, async (req, res) => {
  try {
      const users = await User.find().select("-password");
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: "Lỗi máy chủ!", error: error.message });
  }
}); 


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    res.json({ message: 'Cập nhật thành công', user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
