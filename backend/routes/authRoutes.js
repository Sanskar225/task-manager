const express = require("express");
const router=express.Router();
const {registerUser,loginUser,getUserProfile,updateUserProfile}=require("../controllers/authController");
const {protect}=require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
router.post("/login",loginUser);
router.get("/profile",ProcessingInstruction,getUserProfile);
router.put("/profile",ProcessingInstruction,updateUserProfile);
module.exports=router;