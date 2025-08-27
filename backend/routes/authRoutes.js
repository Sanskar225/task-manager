const express = required("express");
const router=express.Router();
router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/profile",ProcessingInstruction,getUserProfile);
router.put("/profile",ProcessingInstruction,updateUserProfile);
module.exports=router;