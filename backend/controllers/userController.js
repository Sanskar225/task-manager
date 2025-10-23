const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const getUsers = async(req,res)=>{
    try{
const users =await User.find({role:"member"}).select("-password");
const usersWithTaskCounts = await Promise.all(
    users.map(async(user)=>{
        const pendingTask = await Task.countDocuments({assignedTo:user._id,status:"pending"});
        const inProgressTask = await Task.countDocuments({assignedTo:user._id,status:"In Progress"});
        const completedTask = await Task.countDocuments({assignedTo:user._id,status:"Completed"});
        return {
            ...user._doc,
            pendingTask,
            inProgressTask,
            completedTask,
        };  
    }));
    res.json(usersWithTaskCounts);
    }   
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    }
};
const getUserById = async(req,res)=>{
    try{
const user = await User.findById(req.params.id).select("-password");
if(!user){
    return res.status(404).json({message:"User not found"});
}
    }
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    }
};

module.exports={getUsers,getUserById};