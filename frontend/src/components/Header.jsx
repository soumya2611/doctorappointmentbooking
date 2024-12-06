import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="bg-primary flex flex-col  md:flex-row flex-wrap px-24">
      {/* left side */}
      <div className="md:w-1/2 flex flex-col itmes-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px] ">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>
        <div className="flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light">
          <img className="w-28 " src={assets.group_profiles} alt="" />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block " />
            schedule your appointment hassle-free.
          </p>
        </div>
        <a href="#speciality" className="flex rounded-full  w-52 bg-white py-3 px-8 items-center gap-2 text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300 cursor-pointer">
          Book appointment
          <img className="w-3" src={assets.arrow_icon} alt="" />
        </a>
      </div>
      {/* right side */}
      <div className=" max-w-full  md:w-1/2   relative ">
        <img
          className="w-full  md:absolute bottom-0 h-auto object-cover rounded-lg "
          src={assets.header_img}
          alt=""
        />
      </div>
    </div>
  );
};

export default Header;
