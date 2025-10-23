const exppress = require("express");
const {adminOnly} = require("../middleware/authMiddleware");
const { getUsers, getUserById, deleteUser } = require("../controllers/userController");
const router = exppress.Router();
router.get("/",protect,adminOnly, getUsers);
router.get(":id",protect,getUserById);
module.exports=router;