import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AdminContext } from "../Context/AdminContext";
import { toast } from "react-toastify";
import {useNavigate} from 'react-router-dom'
const Navbar = () => {
    const { admintoken, setAdminToken } = useContext(AdminContext)

    const navigate = useNavigate()



    const logout = () => {
        if (admintoken) {
            setAdminToken('');
            localStorage.removeItem('adminToken');
            
        }
    }
    
    return (
    <div className="flex justify-between items-center px-4 sm:px-4 py-3 border-b bg-white"> 
            <div className="flex items-center gap-4 text-sm">
                <img
                   className="w-36 sm:w-40 cursor-pointer" src={assets.admin_logo} alt="" />
              <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600">{admintoken ? 'Admin':'Doctor' }</p>
            </div>
            <button onClick={logout}  className="bg-primary border px-10 py-2 text-white text-sm rounded-full ">Logout</button>
    </div>
  );
};

export default Navbar;
