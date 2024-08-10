import {catchAsyncError} from "../middleware/catchAsyncError.js"
import ErrorHandler from "../middleware/Errormiddle.js"
import { User } from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js"
import cloudinary from "cloudinary";

export const patientRegister = catchAsyncError(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,nic,role} = req.body;

    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role){
        return next(new ErrorHandler("Please fill full form"));
    }
    let user =  await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User is Already register"));
    }
    user = await User.create({
        firstName,lastName,email,phone,password,gender,dob,nic,role
    })
    generateToken(user,"user Registered Successfully",200,res)
    
})
export const login = catchAsyncError(async(req,res,next)=>{
    const {email,password,confirmPassword,role} = req.body;
    if(!email || !password || !confirmPassword || !role){
        return next(new ErrorHandler("please Provide All Details",400));
    }
    if(password !== confirmPassword){
        return next(new ErrorHandler("Please And confirm Password DO not Match",400));
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid password or Email",400));
    }

    const isPassword = await user.comparePassword(password);
    if(!isPassword){
        return next(new ErrorHandler("Invalid password",400));
    }

    if(role !== user.role){
        return next(new ErrorHandler("User With this role not found",400));
    }

    generateToken(user,"user Login Successfully",200,res)
})

export const addAdmin = catchAsyncError(async(req,res,next)=>{
    const {firstName,lastName,email,phone,password,gender,dob,nic} = req.body;

    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic){
        return next(new ErrorHandler("Please fill full form"));
    }

    const isRegistered = await User.findOne({email})
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} with this Email Already exist`));

    }

    const admin = await User.create({
        firstName,lastName,email,phone,password,gender,dob,nic,
        role: "Admin",
    })
    res.status(200).json({
        success:true,
        message: admin
    })
})

export const getAlldoctor = catchAsyncError(async(req,res,next)=>{
    const doctor = await User.find({role: "Doctor"});
    res.status(200).json({
        success:true,
    doctor,
    })
})

export const getUserDetail = catchAsyncError(async(req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        success:true,
        user,
    })
})

export const logoutAdmin = catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("adminToken","",{
        httpOnly:true,
        expires: new Date(Date.now()),
        secure:true,
        sameSite: "None"
    }).json({
        success:true,
        message: "User is LogOut Successfully",
    })
})

export const logoutPatient = catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("patientToken","",{
        httpOnly:true,
        expires: new Date(Date.now()),
        secure:true,
    sameSite: "None"
    }).json({
        success:true,
        message: "User is LogOut Successfully",
    })
})

export const addNewDoctor = catchAsyncError(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Doctor Avatar Required!",400));
    }
    const {docAvatar} = req.files;
    const allowFormats = ["images/png", "image/jpeg", "image/webp"];
    if(!allowFormats.includes(docAvatar.mimetype)){
     return next(new ErrorHandler("Files format not supported",400));
    }

    const {firstName,lastName,email,phone,password,gender,dob,nic,doctorDepartment} = req.body 
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !doctorDepartment){
        return next(new ErrorHandler("Please Provide full Details",400));
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email`,400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);

    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("cloudinary Error:",cloudinaryResponse.error || "Unknown cloudinary Error")

    }
    const doctor  = await User.create({
        firstName,lastName,email,phone,password,gender,dob,nic,doctorDepartment,
        role:"Doctor",
        docAvatar:{
            public_id:cloudinary.public_id,
            url: cloudinaryResponse.secure_url,
        }

    })
    res.status(200).json({
        success:true,
        message:doctor,
    })


})

