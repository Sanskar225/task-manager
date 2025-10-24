const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");
const exportTasksReport = async(req,res)=>{
    try{
        const task = await Task.find().populate("assignedTo","name email");
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("Tasks Report");
        worksheet.columns=[
            {header:"S.No",key:"s_no",width:10},
            {header:"Title",key:"title",width:30},
            {header:"Description",key:"description",width:50},
            {header:"Status",key:"status",width:15},
            {header:"Due Date",key:"dueDate",width:20},
            {header:"Assigned To",key:"assignedTo",width:30},
        ];
        task.forEach((task)=>{
            const assignedTo = task.assignedTo.map((user)=>`${user.name} (${user.email})`).join(", ");
            worksheet.addRow({
                s_no: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                dueDate: task.dueDate.toISOString().split("T")[0],
                assignedTo: assignedTo,
            });
        })
        res.setHeader("Content-Type","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition","attachment; filename=tasks_report.xlsx");
        await workbook.xlsx.write(res);
        res.status(200).end();
    }
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    }   
};
const exportUsersReport = async(req,res)=>{
    try {
        const users = await User.find().select("name email_id").learn();
        const userTasks = await Task.find().populate("assignedTo","name email_id");
        const userTaskMap={};
        users.forEach((user)=>{}
        userTaskMap[user._id]={
            name: user.name,
            email_id: user.email_id,
            tasks: [],
            pendingTasks:0,
            completedTasks:0,
        };
        );
       
    } catch (error) {
        res.status(500).json({message:"Server error",error: error.message});
    }
};
modeule.exports={exportTasksReport,exportUsersReport};
