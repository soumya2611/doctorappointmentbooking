import validator from "validator";
import bcrypt, { genSalt } from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";
//API TO REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !password || !email) {
      return res.json({ success: false, message: "missing details " });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "enter a valid email" });
    }
    //    VALIDATING STRONG PASSWORD
    if (password.length < 8) {
      return res.json({
        success: false,
        message: " password should be greater than 8 charecters",
      });
    }
    //HASHING USER PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();
    // the generated token further used in authUser
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    console.log("user Register Token  " + token);
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "missing details" });
  }
};

//API FOR USER LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: " user does not exists " });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      console.log("user login " + token);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "invalid credential" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//API TO GET USER PROFILE DATA
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body; //through token from middleware
    //console.log(userId)
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO UPDATE USER PROFILE
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;

    const imageFile = req.file;
    if (!name || !phone || !address || !dob || !gender) {
      return res.json({
        success: false,
        message: "not geting name, phone, address, dob, gender",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });
    console.log(address);
    if (imageFile) {
      // UPLOADING IMAGE TO CLOUDINARY

      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });

      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({ success: false, message: "doctor is not available" });
    }

    let slots_booked = docData.slots_booked;

    // console.log(slots_booked)

    //CHECKING FOR SLOTS AVAILABILITY
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: " slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      userData,
      docData,
      amount: docData.fees,
      date: Date.now(),
      slotTime,
    };
    //TIME STAMP : 10:35:47
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    //SAVE NEW SLOTS DATA IN DOCTORS DATA
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "appointment booked   " });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//-----------API TO GET APPOINTENTS FOR FRONT END MY-APPOINTMENT PAGE-----///

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API TO CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    //VERIFY APPOINTMENT USER
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });
    // RELEASING DOCTOR SLOT
    const { docId, slotDate, slotTime } = appointmentData;
    //console.log(docId)
    const docData = await doctorModel.findById(docId);

    let slots_booked = docData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "appointment canceled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//------API TO ADD PAYMENT SYSTEM----///
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "appointment cancelled or not found",
      });
    }
    //CREATING OPTION FOR RAZORPAY
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //   CREATION OF AN ORDER //
    const order = await razorpayInstance.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//--API TO VERIFY PAYMENT OF RAZORPAY---//
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;
    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
console.log(orderInfo)
    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
      res.json({success:true,message:'payment successful'})
    } else {
      res.json({success:false,message:'payment failed'})
 }

  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message });

  }
}


export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
