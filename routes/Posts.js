const express = require("express");
const router = express.Router();

const { validateToken } = require("../middleware/AuthMiddleware");

const multer = require("multer");
const imUpload = multer({storage: multer.memoryStorage()})

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", validateToken, async (req, res) => {
  const listOfPosts = await prisma.Posts.findMany({
      include:{
        Likes:true
      }
  })
  const likedPosts = await prisma.Likes.findMany({
      where:{
          userId:req.user.id
      }
  })
  res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

router.get("/byId/:id", async (req, res) => {
  const post = await prisma.Posts.findFirst({
    where:{
      id:parseInt(req.params.id)
    }
  })
  res.json(post);
});

router.get("/byUserId/:id", async (req, res) => {
  const listOfPosts = await prisma.Posts.findMany({
    where:{
      userId:parseInt(req.params.id)
    }
  })
  res.json({ listOfPosts: listOfPosts });
});

// SEND THE DATA TO THE FRONTEND FROM MYSQL DB
router.get("/image/:id", async (req, res) => {
  const images = await prisma.Images.findFirst({
    where:{
      postId:parseInt(req.params.id)
    } 
  })
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
  const newPost = await prisma.Posts.create({
    data:{
      title: title,
      postText: postText,
      username: req.user.username,
      userId: req.user.id,
    }
  })
  if (file) {
    await prisma.Images.create({
      data:{
        imgData: buffer,
        postId: newPost.id,
      }
    })
  }
  res.json({ message: "Post created!", file: file });
});

router.delete("/:id", validateToken, async (req, res) => {
  const post = await prisma.Posts.findFirst({
    where:{
      id:parseInt(req.params.id)
    }
  })
  if (post.username === req.user.username) {
    await prisma.Images.deleteMany({
      where:{
        postId:parseInt(req.params.id)
      }
    })
    await prisma.Posts.delete({
      where:{
        id:parseInt(req.params.id)
      }
    })
    res.json({ message: "Post deleted!" });
  } else {
    res.json({ message: "Cannot delete post!" });
  }
});

module.exports = router;
