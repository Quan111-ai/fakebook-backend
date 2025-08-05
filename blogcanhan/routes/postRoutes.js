const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User'); 
const { ensureAuth } = require("../middleware/authMiddleware");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require("../config/cloudinaryConfig");


router.post("/posts", ensureAuth, upload.single("image"), async (req, res) => {
    try {
        console.log("DEBUG - req.user:", req.user);

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Người dùng chưa xác thực!" });
        }

        const { title, content, category, tags } = req.body;
        const author = req.user._id;

        console.log("DEBUG - Dữ liệu nhận được:", { title, content, category, author, tags });

        if (!title || !content) {
            return res.status(400).json({ message: "Tiêu đề và nội dung không được để trống!" });
        }

        
        const image = req.file ? req.file.path.replace(/^\/uploads\//, '') : null;

        
        const tagList = tags ? tags.split(",").map(tag => tag.trim()) : [];

        
        const newPost = new Post({
            title,
            content,
            author,
            category,  
            image,  
            tags: tagList
        });

        await newPost.save();

        res.status(201).json({ message: "Bài viết được tạo thành công!", post: newPost });
    } catch (error) {
        console.error("Lỗi tạo bài viết:", error);
        res.status(500).json({ message: "Lỗi tạo bài viết", error: error.message });
    }
});
router.get("/posts/:id", ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID bài viết không hợp lệ!" });
        }

        const post = await Post.findById(id)
            .populate("author", "email role")
            .populate("category", "name");

        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết!" });
        }

        
        const imageUrl = post.image ? post.image : null;

        res.json({ 
            message: "Lấy bài viết thành công!", 
            post: { ...post.toObject(), image: imageUrl } 
        });
    } catch (error) {
        console.error("🚨 Lỗi khi lấy chi tiết bài viết:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


router.put("/posts/:id", ensureAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID bài viết không hợp lệ!" });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết!" });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền sửa bài viết này!" });
        }

        if (title) post.title = title;
        if (content) post.content = content;

        // Kiểm tra và xử lý tags trước khi cập nhật
        if (tags) {
            // Nếu tags là một chuỗi, thì split thành mảng, nếu không thì bỏ qua
            const tagList = typeof tags === 'string' ? tags.split(",").map(tag => tag.trim()) : [];
            post.tags = tagList;
        }

        await post.save();
        res.json({ message: "Bài viết đã được cập nhật!", post });
    } catch (error) {
        console.error("🚨 Lỗi khi cập nhật bài viết:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


router.get("/posts", ensureAuth, async (req, res) => {
    try {
        const posts = await Post.aggregate([
            {
                $lookup: {
                    from: "likes", 
                    localField: "_id", 
                    foreignField: "post", 
                    as: "likes" 
                }
            },
            {
                $addFields: {
                    likeCount: { $size: "$likes" } 
                }
            },
            {
                $sort: { likeCount: -1 } 
            },
            {
                $project: {
                    title: 1,
                    content: 1,
                    author: 1,
                    category: 1,
                    image: 1,
                    tags: 1,
                    likeCount: 1, 
                }
            }
        ]);

        res.json({ message: "Lấy danh sách bài viết thành công!", posts });
    } catch (error) {
        console.error("🚨 Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


router.get("/categories/:categoryId/posts", ensureAuth, async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "ID category không hợp lệ!" });
        }

        const posts = await Post.find({ category: categoryId })
            .populate("author", "email")
            .populate("category", "name") 
            .sort({ createdAt: -1 });

        res.json({ message: "Lấy danh sách bài viết theo category thành công!", posts });
    } catch (error) {
        console.error("🚨 Lỗi khi lấy bài viết theo category:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


router.get("/", async (req, res) => {
    try {
      const { tag } = req.query;
      let query = {};
      
      if (tag) {
        query.tags = { $in: [tag] }; 
      }
  
      const posts = await Post.find(query);
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: "Lỗi khi lấy bài viết!", error: error.message });
    }
  });
router.get("/posts/by-tags", ensureAuth, async (req, res) => {
    try {
        const { tags } = req.query;
        
        if (!tags) {
            return res.status(400).json({ message: "Vui lòng cung cấp tags để tìm kiếm!" });
        }
        
        
        const tagList = tags.split(",").map(tag => tag.trim());

        
        const posts = await Post.find({ tags: { $in: tagList } }).populate("author category");

        res.status(200).json(posts);
    } catch (error) {
        console.error("Lỗi khi tìm bài viết theo tags:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


router.delete("/posts/:id", ensureAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết!" });
        }

        
        if (post.image) {
            const publicId = post.image.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        
        await Post.findByIdAndDelete(req.params.id);

        res.json({ message: "Xóa bài viết thành công!" });
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});


module.exports = router;
