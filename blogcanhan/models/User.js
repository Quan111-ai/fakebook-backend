const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email không được để trống'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu không được để trống'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true 
  }
);

// Mã hóa mật khẩu trước khi lưu vào database
userSchema.pre('save', async function (next) {
  console.log("📝 Trước khi lưu user, mật khẩu hiện tại:", this.password);

  if (!this.isModified('password')) {
    console.log("🔹 Mật khẩu không đổi, không hash lại");
    return next();
  }

  // Kiểm tra nếu đã hash rồi thì không hash lại nữa
  if (this.password.startsWith('$2b$')) {
    console.log("⚠️ Mật khẩu đã hash trước đó, bỏ qua");
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("✅ Mật khẩu sau khi hash:", this.password);
    next();
  } catch (error) {
    console.error("❌ Lỗi khi hash mật khẩu:", error);
    next(error);
  }
});




userSchema.methods.matchPassword = async function (enteredPassword) {
  console.log("🔑 Mật khẩu nhập vào:", enteredPassword);
  console.log("🔒 Mật khẩu hash trong DB:", this.password);
  
  const result = await bcrypt.compare(enteredPassword, this.password);
  console.log("🔍 Kết quả bcrypt.compare():", result);
  
  return result;
};



// Ẩn mật khẩu khi trả về JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema, "user");
