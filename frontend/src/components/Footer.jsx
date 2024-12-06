import React from 'react'
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <div className="md:mx-10 ">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm ">
        {/* left */}
        <div>
          <img className="mb-5 w-40 " src={assets.logo} alt="" />
          <p className="w-full md:w-2/3  text-gray-600 leading-6  ">
            Prescripto is on a mission to make quality healthcare affordable and
            accessible for over a billion+ Indians. We believe in empowering our
            users with the most accurate, comprehensive, and curated information
            and care, enabling them to make better healthcare decisions.
          </p>
        </div>
        {/* center */}
        <div>
          <p className=" text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600 ">
            <li onClick={() => navigate("/")} className="cursor-pointer">
              Home
            </li>
            <li onClick={() => navigate("/about")} className="cursor-pointer">
              AboutUs
            </li>
            <li onClick={() => navigate("/contact")} className="cursor-pointer">
              ContactUs
            </li>
            <li onClick={() => navigate("/")} className="cursor-pointer">
              PrivacyPolicy
            </li>
          </ul>
        </div>
        {/* right */}
        <div>
          <p className=" text-xl font-medium mb-5">Get IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91 9876543210</li>
            <li></li>workforsoumya21@gmail.com
          </ul>
        </div>
      </div>
      {/* copyright part */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center text-gray-800">
          Copyright 2024 @ Soumya ranjan - All Right Reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer