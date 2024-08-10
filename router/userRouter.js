import express from "express"
import { addAdmin, addNewDoctor, getAlldoctor, getUserDetail, login, logoutAdmin, logoutPatient, patientRegister } from "../controller/userControoler.js";
import {isAdminAuthenticated,isPatientAuthenticated} from "../middleware/auth.js"

const router = express.Router();

router.post("/patient/register",patientRegister)
router.post("/login",login);
router.post("/admin/addnew",isAdminAuthenticated,addAdmin);
router.get("/doctors",getAlldoctor);
router.get("/admin/me",isAdminAuthenticated,getUserDetail)
router.get("/patient/me",isPatientAuthenticated,getUserDetail);
router.get("/admin/logout",isAdminAuthenticated,logoutAdmin);
router.get("/patient/logout",isPatientAuthenticated,logoutPatient);

router.post("/doctor/addnew",isAdminAuthenticated,addNewDoctor);

export default router