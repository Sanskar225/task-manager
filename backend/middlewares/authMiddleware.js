const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    try {
        let token = req.headers.authorization;
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Fix: Added space in split
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ message: "User not found" });
            }
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: "Authentication failed", error: error.message });
    }
}

const adminOnly=(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next();
    }else{
        res.status(403).json({message:"Not authorized as an admin"});
    }
};
module.exports={protect,adminOnly};