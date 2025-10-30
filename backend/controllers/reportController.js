const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

const exportTasksReport = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");

        worksheet.columns = [
            { header: "Task ID", key: "id", width: 10 },
            { header: "Title", key: "title", width: 30 },
            { header: "Description", key: "description", width: 50 },
            { header: "Status", key: "status", width: 15 },
            { header: "Priority", key: "priority", width: 15 },
            { header: "Due Date", key: "dueDate", width: 20 },
            { header: "Assigned To", key: "assignedTo", width: 30 },
            { header: "Created By", key: "createdBy", width: 30 },
            { header: "Created At", key: "createdAt", width: 20 },
            { header: "Progress", key: "progress", width: 10 }
        ];

        tasks.forEach((task) => {
            worksheet.addRow({
                id: task._id.toString(),
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
                assignedTo: task.assignedTo ? task.assignedTo.name : "",
                createdBy: task.createdBy ? task.createdBy.name : "",
                createdAt: task.createdAt.toISOString().split("T")[0],
                progress: `${task.progress}%`
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=tasks_report_${new Date().toISOString().split("T")[0]}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error("Export tasks error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const exportUsersReport = async (req, res) => {
    try {
        const [users, tasks] = await Promise.all([
            User.find({ role: "member" }).select("name email"),
            Task.find().populate("assignedTo", "name email")
        ]);

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Users Report");

        worksheet.columns = [
            { header: "User ID", key: "id", width: 10 },
            { header: "Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Tasks", key: "totalTasks", width: 15 },
            { header: "Pending Tasks", key: "pendingTasks", width: 15 },
            { header: "In Progress Tasks", key: "inProgressTasks", width: 15 },
            { header: "Completed Tasks", key: "completedTasks", width: 15 },
            { header: "Completion Rate", key: "completionRate", width: 15 }
        ];

        users.forEach((user) => {
            const userTasks = tasks.filter(
                task => task.assignedTo && task.assignedTo._id.toString() === user._id.toString()
            );

            const pendingTasks = userTasks.filter(t => t.status === "pending").length;
            const inProgressTasks = userTasks.filter(t => t.status === "in-progress").length;
            const completedTasks = userTasks.filter(t => t.status === "completed").length;
            const totalTasks = userTasks.length;
            const completionRate = totalTasks > 0 
                ? ((completedTasks / totalTasks) * 100).toFixed(1)
                : "0.0";

            worksheet.addRow({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                completionRate: `${completionRate}%`
            });
        });

        // Style the header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=users_report_${new Date().toISOString().split("T")[0]}.xlsx`
        );

        await workbook.xlsx.write(res);
        res.status(200).end();
    } catch (error) {
        console.error("Export users error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    exportTasksReport,
    exportUsersReport
};
