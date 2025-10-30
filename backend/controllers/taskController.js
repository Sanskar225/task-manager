const Task = require("../models/Task");
const User = require("../models/User");

const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        
        if (status) {
            filter.status = status;
        }

        let tasks;
        if (req.user.role === "admin") {
            tasks = await Task.find(filter)
                .populate("assignedTo", "name email profileImageUrl")
                .populate("createdBy", "name email profileImageUrl");
        } else {
            filter.assignedTo = req.user._id;
            tasks = await Task.find(filter)
                .populate("assignedTo", "name email")
                .populate("createdBy", "name email");
        }

        tasks = await Promise.all(tasks.map(async (task) => {
            const completedCount = task.todoChecklist.filter(item => item.completed).length;
            return { ...task._doc, completedChecklistCount: completedCount };
        }));

        // Get task counts by status
        const baseQuery = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
        const [allTasks, pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
            Task.countDocuments(baseQuery),
            Task.countDocuments({ ...baseQuery, status: "pending" }),
            Task.countDocuments({ ...baseQuery, status: "in-progress" }),
            Task.countDocuments({ ...baseQuery, status: "completed" })
        ]);

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pending: pendingTasks,
                inProgress: inProgressTasks,
                completed: completedTasks,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");
        
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body;

        const task = new Task({
            title,
            description,
            priority,
            dueDate,
            assignedTo: assignedTo,
            createdBy: req.user._id,
            attachments: attachments || [],
            todoChecklist: todoChecklist || []
        });

        const savedTask = await task.save();
        const populatedTask = await Task.findById(savedTask._id)
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        const updates = {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
            updatedAt: Date.now()
        };

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        )
            .populate("assignedTo", "name email profileImageUrl")
            .populate("createdBy", "name email profileImageUrl");

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        task.status = status;
        if (status === "completed") {
            task.progress = 100;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const updateTaskChecklist = async (req, res) => {
    try {
        const { completed } = req.body;
        const { id, todoId } = req.params;

        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        const todoItem = task.todoChecklist.id(todoId);
        if (!todoItem) {
            return res.status(404).json({ message: "Todo item not found" });
        }

        todoItem.completed = completed;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getDashboardData = async (req, res) => {
    try {
        const [tasks, users] = await Promise.all([
            Task.find().populate("assignedTo", "name").populate("createdBy", "name"),
            User.find({ role: "member" }).select("name email")
        ]);

        const tasksByStatus = {
            pending: tasks.filter(t => t.status === "pending").length,
            inProgress: tasks.filter(t => t.status === "in-progress").length,
            completed: tasks.filter(t => t.status === "completed").length
        };

        const tasksByPriority = {
            low: tasks.filter(t => t.priority === "Low").length,
            medium: tasks.filter(t => t.priority === "Medium").length,
            high: tasks.filter(t => t.priority === "High").length
        };

        const userPerformance = await Promise.all(users.map(async user => {
            const userTasks = tasks.filter(t => t.assignedTo?._id.toString() === user._id.toString());
            return {
                user: { id: user._id, name: user.name },
                totalTasks: userTasks.length,
                completedTasks: userTasks.filter(t => t.status === "completed").length
            };
        }));

        const recentTasks = tasks
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        res.json({
            summary: {
                totalTasks: tasks.length,
                totalUsers: users.length,
                tasksByStatus,
                tasksByPriority
            },
            userPerformance,
            recentTasks
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getUserDashboardData = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate("createdBy", "name")
            .sort("-createdAt");

        const tasksByStatus = {
            pending: tasks.filter(t => t.status === "pending").length,
            inProgress: tasks.filter(t => t.status === "in-progress").length,
            completed: tasks.filter(t => t.status === "completed").length
        };

        const tasksByPriority = {
            low: tasks.filter(t => t.priority === "Low").length,
            medium: tasks.filter(t => t.priority === "Medium").length,
            high: tasks.filter(t => t.priority === "High").length
        };

        const recentTasks = tasks.slice(0, 5);

        res.json({
            summary: {
                totalTasks: tasks.length,
                tasksByStatus,
                tasksByPriority,
                completionRate: tasks.length > 0 
                    ? (tasksByStatus.completed / tasks.length * 100).toFixed(1) 
                    : 0
            },
            recentTasks
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};