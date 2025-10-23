const Task = require("../models/Task");
const getTasks = async(req,res)=>{
    try{
        const {status}= req.query;
        let filter = {};
        if(status){
            filter.status=status;
        }
        let tasks;
        if(req.user.role==="admin"){
            tasks = await Task.find(filter).populate("assignedTo","name email profileImageUrl").populate("createdBy","name email profileImageUrl");
        }else{
            filter.assignedTo = req.user._id;
            tasks = await Task.find(filter).populate("assignedTo","name email").populate("createdBy","name email");
        }
        tasks = await Promise.all(tasks.map(async(task)=>{
            const completedCount = task.todoChecklist.filter(item=>item.completed).length;
            return{...task._doc,completedChecklistCount: completedCount};
        })
        );
        const allTasks= await Task.countDocuments(
            req.user.role==="admin"?{}:{assignedTo:req.user._id}
        );
        const pendingTasks= await Task.countDocuments(
            req.user.role==="admin"?{status:"pending"}:{status:"pending",assignedTo:req.user._id}
        );
        const inProgressTasks= await Task.countDocuments(
            req.user.role==="admin"?{status:"in-progress"}:{status:"in-progress",assignedTo:req.user._id}
        );
        const completedTasks= await Task.countDocuments()
        req.user.role==="admin"?{status:"completed"}:{status:"completed",assignedTo:req.user._id};
        res.json({
            tasks,
            statusSummary:{
                all: allTasks,
                pending: pendingTasks,  
                inProgress: inProgressTasks,
                completed: completedTasks,
            },
        });
    }
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    }  
};
const getTaskById = async(req,res)=>{ try{
const task = await Task.findById(req.params.id).populate("assignedTo","name email profileImageUrl").populate("createdBy","name email profileImageUrl");
if(!task){
    return res.status(404).json({message:"Task not found"});
    res.json(task);

}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const createTask = async(req,res)=>{ try{
    const {
        title,description,priority,dueDate,assignedTo,attachments,todoChecklist}=req.body;
        if(!Array.isArray(assignedTo)){
            return res.status(400).json({message:"assignedTo must be an array of user IDs"});
        }
        const task = await Task.create({
            title,
            description,
            priority,   
            dueDate,
            assignedTo,
            createdBy:req.user._id,
            attachments,
            todoChecklist,
        });
        res.status(201).json({message:"Task created successfully",task
        });
    }
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const updateTask = async(req,res)=>{ try{
    const task = await Task.findById(req.params.id);
    if(!task){
        return res.status(404).json({message:"Task not found"});
        task.title=req.body.title || task.title;
        task.description=req.body.description || task.description;
        task.priority=req.body.priority || task.priority;
        task.dueDate=req.body.dueDate || task.dueDate;
        task.assignedTo=req.body.assignedTo ||task.assignedTo;
        task.attachments=req.body.attachments || task.attachments;
        task.todoChecklist=req.body.todoChecklist || task.todoChecklist;
       if(req.body.assignedTo){
        if(!Array.isArray(req.body.assignedTo)){
            return res.status(400).json({message:"assignedTo must be an array of user IDs"});
        }
        
       
    
    task.assignedTo=req.body.assignedTo ;
    }
    const updatedTask = await task.save();
    res.json({message:"Task updated successfully",task: updatedTask});
    }
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const deleteTask = async(req,res)=>{ try{
    const task = await Task.findById(req.params.id);
    if(!task){
        return res.status(404).json({message:"Task not found"});
    }
    await task.deleteone();
    res.json({message:"Task deleted successfully"});
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const updateTaskStatus = async(req,res)=>{ try{
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({message:"Task not found"});
    const isAssigned = task.assignedTo.some(userId=>userId.toString()===req.user._id.toString());
    if(!isAssigned && req.user.role!=="admin"){
        return res.status(403).json({message:"You are not authorized to update the status of this task"});
    }
    task.status=req.body.status || task.status;
    if(req.body.status==="completed"){
    task.todoChecklist.forEach(item=>item.completed=true);
    task.progress = 100;
    }
    await task.save();
    res.json({message:"Task status updated successfully",task
    });
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const updateTaskChecklist = async(req,res)=>{ try{
    const {todoChecklist}= req.body;
    const task = await Task.findById(req.params.id);
    if(!task) return res.status(404).json({message:"Task not found"});
    if(!task.assignedTo.includes(req.user._id) && req.user.role!=="admin"){
        return res.status(403).json({message:"You are not authorized to update the checklist of this task"});
    }
    task.todoChecklist= todoChecklist || task.todoChecklist;
    const completedCount = task.todoChecklist.filter(item=>item.completed).length;
    const totalItems = task.todoChecklist.length;
    task.progress = totalItems >0 ? Math.round((completedCount/totalItems)*100):0;
if(task.progress===100){
    task.status="completed";
}else if(task.progress>0){
    task.status="in-progress";
}else{
    task.status="pending";
}
    await task.save();
const updatedTask = await Task.findById(req.params.id).populate("assignedTo","name email profileImageUrl").populate("createdBy","name email profileImageUrl");
    res.json({message:"Task checklist updated successfully",task: updatedTask
    });
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const getDashboardData = async(req,res)=>{ try{
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({status:"pending"});
    const completedTasks = await Task.countDocuments({status:"completed"});
    const overdueTasks = await Task.countDocuments({
        dueDate:{$lt: new Date()},
        status:{$ne:"completed"},
    });
    const taskStatuses = ["pending","in-progress","completed"];
    const taskDistributionRaw = await Task.aggregate([
        {
            $group:{
                _id:"$status",
                count:{$sum:1},
            },
        },
    ]);
    const taskDistribution = taskStatuses.reduce((acc,status)=>{
        const formattedKey = status.replace(/-/g," ");
        acc[formattedKey]= 
        taskDistributionRaw.find(item=>item._id===status)?.count ||0;
        return acc;
    },{});
taskDistribution["All"]= totalTasks;
const taskPriorities = ["low","medium","high"];
    const priorityDistributionRaw = await Task.aggregate([
        {
            $group:{
                _id:"$priority",
                count:{$sum:1},
            },
        },
    ]);
    const priorityDistribution = taskPriorities.reduce((acc,priority)=>{
        const formattedKey = priority.charAt(0).toUpperCase()+ priority.slice(1);
        acc[formattedKey]=
        priorityDistributionRaw.find(item=>item._id===priority)?.count ||0;
        return acc;
    },{});
    const recentTasks = await Task.find()
    .sort({createdAt:-1})
    .limit(10)
    .select("title status priority createdAt");
    res.status(200).json({
        statistics:{
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
        },
        charts:{
            taskDistribution,
            priorityDistribution,
        },
        recentTasks,
    });
        }

    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
const getUserDashboardData = async(req,res)=>{ try{
    const userId = req.user._id;
    const totalTasks = await Task.countDocuments({assignedTo:userId});
    const pendingTasks = await Task.countDocuments({assignedTo:userId,status:"pending"});
    const completedTasks = await Task.countDocuments({assignedTo:userId,status:"completed"});
    const overdueTasks = await Task.countDocuments({
        assignedTo:userId,
        dueDate:{$lt: new Date()},
        status:{$ne:"completed"},
    });
    const taskStatuses = ["pending","in-progress","completed"];
    const taskDistributionRaw = await Task.aggregate([
        {
            $match:{assignedTo:userId},
        },
        {
            $group:{
                _id:"$status",
                count:{$sum:1},
            },
        },
    ]);
    const taskDistribution = taskStatuses.reduce((acc,status)=>{
        const formattedKey = status.replace(/-/g," ");
        acc[formattedKey]= 
        taskDistributionRaw.find(item=>item._id===status)?.count ||0;
        return acc;
    },{});
    taskDistribution["All"]= totalTasks;
    const taskPriorities = ["low","medium","high"];
    const priorityDistributionRaw = await Task.aggregate([
        {
            $match:{assignedTo:userId},
        },
        {   
            $group:{
                _id:"$priority",
                count:{$sum:1},

            },
        },
    ]);
    const taskPrioritiesLevels = taskPriorities.reduce((acc,priority)=>{
        acc[priority]= taskPrioritiesLevelsRaw.find(item=>item._id===priority)?.count ||0;
        return acc;
    },{});
const recentTasks = await Task.find({assignedTo:userId})
    .sort({createdAt:-1})
    .limit(10)  
    .select("title status priority createdAt");
    res.status(200).json({
        statistics:{
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks,
        },
        charts:{   
            taskDistribution,
            priorityDistribution: taskPrioritiesLevels,
        },
        recentTasks,
    });
}
    catch(error){
        res.status(500).json({message:"Server error",error: error.message});
    } };
modeule.exports={getTasks,getTaskById,updateTask,createTask,deleteTask,updateTaskStatus,updateTaskChecklist,getDashboardData,getUserDashboardData};