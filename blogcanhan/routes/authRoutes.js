const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureGuest, ensureAuth } = require("../middleware/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    let { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu!" });
    }

    email = email.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email đã được sử dụng!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    console.log("✅ Người dùng đã đăng ký:", email);
    res.status(201).json({ message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("🚨 Lỗi khi đăng ký:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});


router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập email và mật khẩu!" });
    }

    email = email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Sai email hoặc mật khẩu!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Sai email hoặc mật khẩu!" });
    }

    const token = jwt.sign(
      { _id: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,  
      { expiresIn: "1h" }      
    );
    
    console.log("🔑 Token đã tạo:", token);

    res.json({
      message: "Đăng nhập thành công!",
      token,
      userId: user._id,  
      author: {           
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("🚨 Lỗi khi đăng nhập:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
});


router.post("/logout", ensureAuth, (req, res) => {
  console.log("🔓 Người dùng đã đăng xuất:", req.user.email);
  res.json({ message: "Đăng xuất thành công! Vui lòng xóa token khỏi client." });
});

module.exports = router;
