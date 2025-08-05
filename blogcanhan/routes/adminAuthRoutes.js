const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User"); // Import model User
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        let admin = await Admin.findOne({ email });
        if (admin) return res.status(400).json({ message: "Admin đã tồn tại!" });

        admin = new Admin({ email, password });
        await admin.save();

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});
// Lấy danh sách người dùng
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, "-password"); // Ẩn mật khẩu
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ message: "Email không tồn tại!" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign({ id: admin._id, role: "admin" }, "SECRET_KEY", { expiresIn: "1h" });

        res.json({
            token,
            role: admin.role 
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
    router.delete("/users/:id", async (req, res) => {
        try {
            const { id } = req.params;
    
            // Kiểm tra xem người dùng có tồn tại không
            const user = await User.findById(id);
            if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });
    
            // Xóa người dùng
            await User.findByIdAndDelete(id);
            res.json({ message: "Người dùng đã được xóa thành công!" });
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
        }
    });
router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, role } = req.body;
        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại!" });
        // Cập nhật thông tin người dùng
        user.email = email || user.email;
        user.role = role || user.role;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        await user.save();
        res.json({ message: "Người dùng đã được cập nhật thành công!", user });
    } catch (error) {
        console.error("Lỗi khi cập nhật người dùng:", error);
        res.status(500).json({ message: "Lỗi server khi cập nhật người dùng" });
    }
    });
});


module.exports = router;
