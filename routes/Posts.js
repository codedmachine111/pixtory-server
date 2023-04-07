const express = require("express");
const router = express.Router();
const { validateToken } = require("../middleware/AuthMiddleware");
const multer = require("multer");

const imUpload = multer({storage: multer.memoryStorage()})

const { Posts } = require("../models");
const { Likes } = require("../models");
const { Images } = require("../models");

router.get("/", validateToken, async (req, res) => {
  const listOfPosts = await Posts.findAll({ include: "Likes" });

  const likedPosts = await Likes.findAll({ where: { userId: req.user.id } });
  res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

router.get("/byId/:id", async (req, res) => {
  const post = await Posts.findByPk(req.params.id);
  res.json(post);
});

router.get("/byUserId/:id", async (req, res) => {
  const listOfPosts = await Posts.findAll({ where: { userId: req.params.id } });
  res.json({ listOfPosts: listOfPosts });
});

// SEND THE DATA TO THE FRONTEND FROM MYSQL DB
router.get("/image/:postId", async (req, res) => {
  const images = await Images.findOne({ where: { postId: req.params.postId } });
  if (images) {
    res.set('Content-Type', 'images/jpeg');
    res.send(images.imgData)
  } else {
    console.log("No image");
  }
});

// UPLOAD THE IMAGE AS BLOB INTO THE MYSQL DB
router.post("/", validateToken, imUpload.single("file"), async (req, res) => {
  const { title, postText } = req.body;
  const file = req.file;
  const { buffer } = file;
  const newPost = await Posts.create({
    title: title,
    postText: postText,
    username: req.user.username,
    UserId: req.user.id,
  });
  if (file) {
    const newImage = await Images.create({
      imgData: buffer,
      PostId: newPost.id,
    });
  }
  res.json({ message: "Post created!", file: file });
});

router.delete("/:id", validateToken, async (req, res) => {
  const post = await Posts.findByPk(req.params.id);
  if (post.username === req.user.username) {
    await post.destroy();
    res.json({ message: "Post deleted!" });
  } else {
    res.json({ message: "Cannot delete post!" });
  }
});

module.exports = router;
