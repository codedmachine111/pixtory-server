const express = require("express");
const router = express.Router();

const { validateToken } = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post('/', validateToken,  async (req,res)=>{
    const userId = req.user.id;
    const {postId} = req.body;

    const found = await prisma.Likes.findFirst({
        where:{
            userId_postId:{
                userId:userId,
                postId:parseInt(postId)
            }
        }
    })

    if(!found){
        await prisma.Likes.create({
            data:{
                userId:userId,
                postId:parseInt(postId)
            }
        })
        res.json({liked: true});
    } else{
        await prisma.Likes.deleteMany({
            where:{
                userId:userId,
                postId:parseInt(postId)
            }
        })
        res.json({liked: false});
    }
})
module.exports = router;