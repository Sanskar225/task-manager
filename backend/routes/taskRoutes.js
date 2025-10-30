const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const {
    getUserDashboardData,
    getDashboardData,
    getTasks,
    getTaskById,
    updateTask,
    createTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist
} = require("../controllers/taskController");
const router = express.Router();

// Dashboard routes
router.get("/dashboard-data", protect, adminOnly, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);

// Task CRUD routes
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

// Task status and checklist routes
router.put("/:id/status", protect, updateTaskStatus);
router.put("/:id/todo/:todoId", protect, updateTaskChecklist);

module.exports = router;