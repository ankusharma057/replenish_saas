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
      navigate("/clients", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message
      );
    }
  };
  const handleMenuSHow = () => {
    setisMenuShow((pre) => !pre);
  };

  if (!window.location.pathname.includes("/clients")) return null;

  return authUserState.client ? (
    <nav className="bg-primary-dark-blue text-white relative z-20 py-2 px-0 lg:px-20 xl:px-64">
      <div className=" mx-auto lg:px-4 sm:pl-6 sm:pr-0 ">
        <div className="flex items-center justify-between h-26">
          <div className="flex-shrink-0 p-2">
            Welcome back, {authUserState.client?.name}!
          </div>
          <div className=" w-full pr-6 flex justify-end xl:w-full">
            <div className="md:hidden">
              <button
                onClick={handleMenuSHow}
                className="border-none relative z-30 text-w-full py-3 5xl transition-all text-5xl text-white"
              >
                ≡
              </button>
            </div>
            <div
              className={` ${
                isMenuShow ? "translate-x-full" : ""
              } md:block pt-20 md:pt-0 z-20 fixed top-0 bg-primary-dark-blue h-screen right-0 w-1/2  gap-y-2 items-center md:w-auto md:static flex-col md:flex-row md:h-auto ml-10 flex md:items-baseline space-x-4 transition-all md:translate-x-0  `}
            >
              
              <button
                onClick={handleMenuSHow}
                className={` hover:bg-white/10 hover:md:bg-transparent w-full ml-4 md:ml-0 md:text-sm md:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/clients/appointments"
                      ? "text-white"
                      : "text-white"
                  } no-underline text-white p-1 inline-block hover:text-white `}
                  to="/clients/appointments"
                >
                  View Appointments
                </Link>
              </button>
              <button
                onClick={handleMenuSHow}
                className={` hover:bg-white/10  hover:md:bg-transparent w-full md:text-sm md:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/clients"
                      ? "text-white"
                      : "text-white"
                  } no-underline text-white p-1 inline-block hover:text-white `}
                  to="/clients"
                >
                  Book an Appointment
                </Link>
              </button>

              <button
                onClick={handleLogout}
                className={` ${
                  location.pathname === ""
                } hover:bg-white/10 hover:md:bg-transparent w-full md:text-sm md:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={handleMenuSHow}
        className={`${
          isMenuShow ? "-translate-x-full" : ""
        } h-screen absolute w-[51%] md:w-[76%] z-[2] cursor-pointer transition-all left-0 md:hidden bg-black/50 `}
      ></div>
    </nav>
  ) : (
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
