const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");

const { validateToken } = require("../middleware/AuthMiddleware");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const users = await prisma.Users.findMany();
  res.json(users);
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.Users.findFirst({
    where:{
      username
    }
  })

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    await prisma.Users.create({
      data:{
        username:username,
        password:hash
      }
    });
    res.json({ message: "User Created!" });
  } else {
    res.json({ message: "User already exists!" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.Users.findFirst({
    where:{
      username: username
    }
  })
  
  if (user) {
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const accessToken = sign(
          { username: user.username, id: user.id },
          "important"
        );
        res.json({ message: "Login Successful", accessToken: accessToken, username: username, userId:  user.id });
      } else {
        res.json({ message: "Wrong username/password combination!" });
      }
    });
  } else {
    res.json({ message: "User doesn't exist" });
  }
});

router.get("/verify",validateToken, (req,res)=>{
  res.json({user: req.user});
})

router.get("/info/:id", async(req,res)=>{
  const user = await prisma.Users.findUnique({
    where:{
      id:parseInt(req.params.id)
    },
    select:{
      id: true,
      username: true
    }
  })
  if(!user){
    res.json({message: 'User not found'})
  }else{
    res.json({user: user});
  }
})

module.exports = router;
