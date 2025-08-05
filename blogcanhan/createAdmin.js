const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Đường dẫn tới model User
require('./server'); // Import để tái sử dụng kết nối từ server.js

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const newAdmin = new User({
      username: 'newAdmin',
      email: 'newadmin2@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    await newAdmin.save();
    console.log('Admin created successfully!');
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    mongoose.connection.close();
  }
};

// Chạy hàm tạo admin
createAdmin();
