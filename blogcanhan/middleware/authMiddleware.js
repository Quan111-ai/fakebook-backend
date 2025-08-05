const jwt = require("jsonwebtoken");
const User = require("../models/User");


console.log(" JWT_SECRET:", process.env.JWT_SECRET);

const ensureGuest = (req, res, next) => {
    if (req.headers["authorization"]) {
        return res.status(403).json({ message: "Bạn đã đăng nhập! Không thể truy cập trang này." });
    }
    next();
};

const ensureAuth = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization?.split(" ")[1];
        console.log(" Token:", token);
        if (!token) return res.status(401).json({ message: "Không có token!" });

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(" Decoded Token:", decoded);

        
        const user = await User.findById(decoded._id).select("_id email role");
        console.log(" User from DB:", user);

        if (!user) {
            return res.status(401).json({ message: "Người dùng không tồn tại!" });
        }

        
        req.user = user;
        console.log(" User sau khi xác thực:", req.user);
        next();
    } catch (error) {
        console.error(" Lỗi xác thực:", error);
        return res.status(401).json({ message: "Xác thực thất bại!", error: error.message });
    }
};

module.exports = { ensureAuth, ensureGuest };
