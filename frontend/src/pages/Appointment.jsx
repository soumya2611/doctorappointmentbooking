import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoc from "../components/RelatedDoc";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const navigate = useNavigate();

  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);

  const [docInfo, setDocInfo] = useState({});
  const [docSlot, setDocSlot] = useState({});
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  const getAvlSlot = async () => {
    setDocSlot([]);
    //getting current date
    let today = new Date();
    //console.log(today.getDate())

    for (let i = 0; i < 7; i++) {
      // getting date with index

      let currentDate = new Date();
      //console.log(currentDate)
      currentDate.setDate(today.getDate() + i);
      //console.log(currentDate);

      //setting end time of current date

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);
      //setting hours

      //THIS LOOP CHECK THE TIME OF OPENING AND CLOSING upon che cking  GEThours

      //console.log(currentDate)
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 9 ? currentDate.getHours() + 1 : 9
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(9);
        currentDate.setMinutes(0);
      }
      //created a empty timeSlot
      let timeSlot = [];

      // Locale: The first argument is an array or a string specifying locales. Passing an empty array ([]) means it will use the default locale of the user's system.
      // Options: The second argument is an object that specifies how the time should be formatted.
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        console.log(slotDate)
        const slotTime = formattedTime;
        
      
        const isSlotAvailable =await docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
          : true;
        // console.log(docInfo.slots_booked
        // )
        if (isSlotAvailable) {
          // add slot to array
          timeSlot.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        //Increment current time by 30 min
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlot((prev) => [...prev, timeSlot]);
      //console.log(docSlot);
    }
  };
  ////////////APPOINTMENT BOOK ///////////////////
  const bookAppointment = async () => {
    if (!token) {
      toast.warn("login to Book appointment");
      return navigate("/login");
    }

    try {
      const date = docSlot[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime},
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
        console.log(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // console.log(docSlot);
  }, [docSlot]);

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvlSlot();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* doctor details */}
        <div className="flex  flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0 ">
            {/* doc info,degree,exp */}
            <p className="flex items-center  gap-2 text-3xl font-medium text-gray-900 ">
              {docInfo.name}{" "}
              <img
                className="w-4 mt-1 mx-2"
                src={assets.verified_icon}
                alt=""
              />
            </p>
            <div className="flex  items-center gap-2 text-sm mt-1 text-gray-600 ">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-3 border text-sm rounded-full cursor-not-allowed bg-slate-100">
                {docInfo.experience}
              </button>
            </div>
            {/* ---doc about-- */}
            <div>
              <p className="flex gap-2   py-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1 ">
                {docInfo.about}
              </p>
              <p className="mt-3 text-slate-700 cursor-pointer ">
                Appointment fee:{currencySymbol}
                {docInfo.fees}
              </p>
            </div>
          </div>
        </div>
        {/* ---------BOOKING SLOTS--------- */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700 ">
          <p>Booking slots</p>
          <div className="flex gap-4 items-center w-full overflow-x-scroll mt-4  p-4">
            {docSlot.length &&
              docSlot.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={` text-center py-3  min-w-16 rounded-lg cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border  border-slate-400  "
                  } `}
                  key={index}
                >
                  <p className="text-black">
                    {item[0] && daysOfWeek[item[0].datetime.getDay()]}
                  </p>
                  <p> {item[0] && [item[0].datetime.getDate()]}</p>
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 w-full mt-5 overflow-x-scroll ">
            {docSlot.length &&
              docSlot[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={` text-sm font-light flex-shrink-0 px-5 py-2 rounded-lg cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white"
                      : "border  border-slate-400 "
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={bookAppointment}
            className="bg-primary text-white text-sm font-light px-4 mt-6 py-2  rounded-lg "
          >
            Book an appointment
          </button>
        </div>
        {/* LIsting of related doc */}
        <RelatedDoc docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
