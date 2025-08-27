const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        email:{type:String,required:true,unique:true},
        password :{tpe:String,required:true, unique:true},
        profileImageUrl:{type:String,enum:["admin","member"],default:"member"},

    },
    {timestamps:true}
);
 module.exports=mongoose.model("User",UserSchema);