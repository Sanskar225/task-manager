const multer = require("multer");
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/");   
    },
    filename: (req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    },
    });
    const fileFilter=(req,file,cb)=>{
        const allowedTYpes=["image/jpeg","image/jpg","image/png","application/pdf"];
        if(allowedTYpes.includes(file.mimetype)){
            cb(null,true);}
        else{
            cb(new Error("Invalid file type. Only JPEG, PNG and PDF are allowed."),false);
        }  
    };
    const upload = multer({storage,fileFiter});
    module.exports=upload;