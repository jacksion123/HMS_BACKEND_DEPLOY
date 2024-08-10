import {Appointment} from "../models/AppointmentSchema.js";
import {catchAsyncError} from "../middleware/catchAsyncError.js"
import ErrorHandler from "../middleware/Errormiddle.js"
// import {Appointment} from "../models/AppointmentSchema.js"
import {User} from "../models/userSchema.js"

export const postAppointment = catchAsyncError(async(req,res,next)=>{
    const {

        firstName,
        lastName,
        email, 
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;
    if(!firstName || !lastName|| !email || !phone || !dob || !gender || !appointment_date || !department || !doctor_firstName || !doctor_lastName  || !address || !nic){
        return next(new ErrorHandler("Please fill full form",400));
    }
    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department
    })
    if(isConflict.length  ===  0){
        return next(new ErrorHandler("Doctor not found",400));
    }
    if(isConflict.length  >  1){
        return next(new ErrorHandler("Doctor not Conflict Please Contact Through Email or Phone!",400));
    }
    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;

    const appointment = await Appointment.create({
        firstName,
        lastName,
        email, 
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor:{
            firstName:doctor_firstName,
            lastName:doctor_lastName
        },
      
        hasVisited,
        address,
        doctorId,
        patientId,
    })
    res.status(200).json({
        success:true,
        message: "Appointment Send Successfully!",
        appointment,
    })

})

export const getAllAppointment = catchAsyncError(async(req,res,next)=>{
    const appointments = await Appointment.find();
    res.status(200).json({
        success:true,
        appointments,
    })
})

export const updateAppointmentStatus = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("Appointment not found",400));
    }
    appointment = await Appointment.findByIdAndUpdate(id,req.body,{
        new :true,
        runValidators:true,
        useFindAndModify:false,

    });
    res.status(200).json({
        success:true,
        message:"Appointment status updated",
        appointment,
    });
})

export const deleteAppointment = catchAsyncError(async(req,res,next)=>{
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("Appointment not found",400));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success:true,
        message: "Appointment Deleted"
    })

})

