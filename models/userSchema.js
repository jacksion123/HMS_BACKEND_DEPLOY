import mongoose from "mongoose"
import validator from "validator"
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

const UserSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:true,
        minLength: [3,"First Name must contain At least 3 character"]
    },
    lastName:{
        type: String,
        required:true,
        minLength: [3,"Last Name must contain At least 3 character"]
    },
    email:{
        type: String,
        required:true,
       validate:[validator.isEmail,"Please provide a valid email"]
    }
    ,
    phone:{
        type: String,
        required:true,
        minLength: [10,"Phone no. contain 10 digits"],
        maxLength: [10,"Phone no. contain 10 digits"]
    },
    nic:{
        type: String,
        required:true,
        minLength: [5,"NIC must contain 5 digits"],
        maxLength: [5,"NIC must contain 5 digits"]
    },
    dob:{
        type: Date,
        required:true,

    },
    gender:{
      type:String,
      required:true,
      enum: ["Male","Female"],
    },
    password:{
        type:String,
        minLength: 6,
        required:true,
        select:false
    },
    role:{
        type:String,
        required:true,
        enum:["Admin","Patient","Doctor"],

    },
    doctorDepartment:{
        type:String
    },
    docAvatar:{
        public_id:String,
        url:String,
    }
   
    
})
UserSchema.pre("save",async function(next){
    this.password = await bcrypt.hash(this.password,10);
})

UserSchema.methods.comparePassword = async function(enterpassword){
    return await bcrypt.compare(enterpassword,this.password);
}

UserSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES,
    });
}

 
export const User = mongoose.model("user",UserSchema);