//  API FOR ADDING DOCTORS

import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken'


const addDoctor = async (req, res) => {
  try {
    const {
      name, email,password,speciality,degree,experience,about,fees,address,
    } = req.body;

    const imageFile = req.file;
    //CHECKING FOR ALL DATA TO ADD DOCTOR
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "missing details from body !! data not passed through body" });
    }
    //VALIDATING EMAIL FORMAT
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a vaild email",
      });
    }

    //PASSWORD VALIDATING (STRONG)
    if (password.length < 8) {
      return res.json({ success: false, message: "enter a strong password min length 8 " });
    }
    //HASHING DOC PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //ADDING IMAGE  TO CLOUDINARY
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save(); // save the object in the database 

    res.json({ success: true, message: "doctor added in database" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};

//API FOR ADMIN LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
      if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // token is used at adminmiddlewire part
        
          const token = jwt.sign(email + password, process.env.JWT_SECRET)
          
          res.json({success:true,token})
      }
      else {
          res.json({success:false,message:"invalid credential"})
      }
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: err.message });
  }
};
//API TO GET ALLL DOCTOR LIST FOR ADMIN PANEL

const allDoctors = async (req, res) =>{
  try {
    const doctors = await doctorModel.find({}).select('-password')
    res.json({success:true,doctors})


  } catch (error) {
    console.log(error
    )
    res.json({succes:false,message:error.message})
  }}

export { addDoctor, loginAdmin,allDoctors };
