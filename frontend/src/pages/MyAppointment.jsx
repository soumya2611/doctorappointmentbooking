import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import {useNavigate}from 'react-router-dom'
const MyAppointment = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const month = [
    "",
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return (
      dateArray[0] + " " + month[Number(dateArray[1])] + " " + dateArray[2]
    );
  };

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });

      if (data.success) {
        //console.log(data.appointments)
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  //CANCEL APPOINTMENT
  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response)
try {
  const { data } = await axios.post(backendUrl + '/api/user/verify-razorpay', response, { headers: { token } })
  if (data.success) {
    getUserAppointments()
    navigate('/my-appointments')
    toast.success('Payment success')
    
  }
} catch (error) {
  console.log(error)
  toast.error(error.message)
}

      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
}

  const appointmentRazorpay = async(appointmentId) => {
  try {
    const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
    
    if (data.success) {
      console.log(data.order);
      initPay(data.order)
    }



  } catch (error) {
    
  }
}


  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b ">
        MyAppointment
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b-2 "
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-200"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm  text-gray-500">
              <p className="text-gray-900 font-semibold ">
                {item.docData.name}
              </p>
              <p className="text-sm font-sans">{item.docData.speciality}</p>
              <p className=" font-semibold mt-1 text-gray-700">Address:</p>
              <p className="text-sm font-sans">{item.docData.address.line1}</p>
              <p className="text-sm font-sans">{item.docData.address.line2}</p>
              <p className="text-xs mt-1 ">
                <span className="text-gray-700">Date & Time :</span>{" "}
                {slotDateFormat(item.slotDate)}| {item.slotTime}
              </p>
            </div>
            <div></div>
            <div className="flex flex-col gap-4 justify-end  text-gray-700  text-sm font-medium my-4 mx-4">
              {!item.cancelled && item.payment && (
                <button className="sm:min-w-48 py-2 border  rounded text-white bg-green-600  hover:text-black hover:bg-stone-500 hover:transition-all duration-300">
                  Paid
                </button>
              )}
              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => appointmentRazorpay(item._id)}
                  className="  font-sans text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white hover:transition-all duration-300 "
                >
                  Pay Online
                </button>
              )}

              {!item.cancelled && !item.payment && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className=" text-sm font-sans text-stone-500 text-center sm:min-w-48 py-2 border  hover:bg-red-500 hover:text-white hover:transition-all duration-300"
                >
                  Cancel Appointment
                </button>
              )}
              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border rounded text-white bg-red-500  hover:text-black hover:bg-stone-500 hover:transition-all duration-300">
                  Appointment Cancelled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointment;
