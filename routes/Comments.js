const express = require("express");
const router = express.Router();

const {validateToken} = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/:postId", async(req,res)=>{
    const comments = await prisma.Comments.findMany({
        where:{
            postId:parseInt(req.params.postId)
        }
    })
    res.json(comments);
});

router.post("/",validateToken, async(req,res)=>{
    const comment = req.body;
    const username = req.user.username;
    comment.username = username;
    await prisma.Comments.create({
        data:{
            username:comment.username,
            postId:comment.postId,
            commentText:comment.commentText
        }
    })
    res.json(comment);
});

router.delete("/:commentId",validateToken, async(req,res)=>{
    const commentId = req.params.commentId;
    await prisma.Comments.delete({
        where:{
            id:commentId
        }
    })
    res.json({message: "Comment Deleted"});
});

module.exports = router;