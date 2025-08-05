require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use('/uploads', express.static('uploads'));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://tominhnhat:0123@nhat123.ssnn7.mongodb.net/blogcanhan";
mongoose.connect(MONGO_URI)
    .then(() => console.log(" Kết nối MongoDB thành công"))
    .catch(err => console.error(" Lỗi kết nối MongoDB:", err));

const authRoutes = require("./routes/authRoutes")
app.use("/auth", authRoutes); 
const postRouters = require('./routes/postRoutes')
app.use('/api', postRouters);
const commentRoutes = require("./routes/commentsRoutes");
app.use("/comments", commentRoutes);
const informationRoutes = require("./routes/information");
app.use("/information", informationRoutes);
const categoryRoutes = require("./routes/categoryRoutes");
app.use("/categories", categoryRoutes);
const tagRoutes = require("./routes/tagRoutes");
app.use("/tags", tagRoutes);
const likeRoutes = require("./routes/likeRoutes");
app.use("/likes", likeRoutes);
const imageRoutes = require("./routes/imageRoutes"); 
app.use("/api", imageRoutes);
const adminAuthRoutes = require("./routes/adminAuthRoutes");
app.use("/api/admin", adminAuthRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server chạy tại: http://localhost:${PORT}`));