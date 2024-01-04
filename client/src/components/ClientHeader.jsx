import React, { useState, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import { useAuthContext } from "../context/AuthUserContext";
import { CLIENT_LOGOUT } from "../Constants/AuthConstants";
import { logoutClient } from "../Server";
import { toast } from "react-toastify";

export default memo(function ClientHeader() {
  const [isMenuShow, setisMenuShow] = useState(true);
  const navigate = useNavigate();
  const { authUserState, authUserDispatch } = useAuthContext();

  const location = useLocation();
  const handleLogout = async () => {
    try {
      await logoutClient();
      authUserDispatch({ type: CLIENT_LOGOUT });
      navigate("/clients/signup", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message
      );
    }
  };

  const handleMenuSHow = () => {
    setisMenuShow((pre) => !pre);
  };

  if (authUserState.client || !window.location.pathname.includes("/clients"))
    return null;

  return (
    <nav className="bg-primary-dark-blue relative z-20  py-3 px-[0px] md:px-20 lg:px-64">
      <ul className=" text-xs sm:text-sm md:text-base !p-1 flex justify-between items-center !m-0 text-white">
        <li>
          Hello. Are you a current client?
          <Link
            to="/clients/signup"
            className="font-bold text-white hover:!text-gray-200 transition-all ml-2 no-underline"
          >
            Sign in
          </Link>
        </li>

        <li>
          <Link
            to="/clients/signup"
            className="text-white p-3 hover:bg-slate-800 rounded-lg transition-all no-underline"
          >
            Sign in or Sign up
          </Link>
        </li>
      </ul>
    </nav>
  );
});
