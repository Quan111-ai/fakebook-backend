const bcrypt = require('bcrypt');

const password = "123456";

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error("🚨 Lỗi hash mật khẩu:", err);
    } else {
        console.log("🔒 Mật khẩu mới được hash:", hash);
        
        bcrypt.compare(password, hash, (err, result) => {
            console.log("🔍 Kết quả so sánh với hash mới:", result);
        });
    }
});


const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://tominhnhat:0123@nhat123.ssnn7.mongodb.net/blogcanhan";
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Kết nối MongoDB thành công"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));