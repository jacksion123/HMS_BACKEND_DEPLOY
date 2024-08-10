import mongoose from "mongoose";

export const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{
    dbName: "TWITTER"
    }).then(()=>{
        console.log("connected to Database");
    }).catch((err)=>{
        console.log(err.message);
    })
}