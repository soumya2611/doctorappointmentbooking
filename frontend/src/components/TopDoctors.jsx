import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
const TopDoctors = () => {
  const navigate = useNavigate();
  const {doctors}=useContext(AppContext)
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10 ">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="w-1/3 text-center text-sm text-gray-500">
        Trusted doctors by the people for you.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0   ">
        {doctors.slice(0, 7).map((item, index) => (
          <div
            onClick={
              () => {navigate(`/appointment/${item._id}`), scrollTo(0, 0)}}
            key={index}
            className="border border-blue-300 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-all duration-500"
          >
            <img className="bg-blue-200 " src={item.image} alt="" />
            <div className="p-4 ">
              <div className="flex items-center gap-1 text-sm text-center  text-green-600">
                <p className="w-2 h-2 bg-green-500 rounded-full "></p>
                <p>Available</p>
              </div>
              <p className="text-gray-900 text-lg  font-medium">{item.name}</p>
              <p className="text-gray-600 text-sm ">{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          navigate("/doctors");
          scrollTo(0, 0);
        }}
        className="px-8 py-2 bg-primary text-gray-300 rounded-full mt-2"
      >
        more
      </button>
    </div>
  );
};

export default TopDoctors;
