import React, { useState, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";
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

  if (!authUserState.client) return null;
  return (
    <nav className="bg-blue-400 relative z-20">
      <div className=" mx-auto md:px-4 sm:pl-6 sm:pr-0 lg:px-8">
        <div className="flex items-center justify-start h-26">
          <div className="flex-shrink-0 p-2 relative z-30">
            <Link to="/clients">
              <Image src="/replenish-logo.png" width="60px" roundedCircle />
            </Link>
          </div>

          <div className="relative z-10 w-full pr-6 flex justify-end lg:w-auto">
            <div className="lg:hidden">
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
              } lg:block pt-20 lg:pt-0 z-20 fixed top-0  h-screen bg-blue-400 right-0 w-3/4 md:w-1/3 gap-4 items-center lg:w-auto lg:static flex-col lg:flex-row lg:h-auto ml-10 flex lg:items-baseline space-x-4 transition-all lg:translate-x-0 `}
            >
              <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/clients"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-3 inline-block hover:text-white `}
                  to="/clients"
                >
                  Home
                </Link>
              </button>

              {/* <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/clients/staff"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-3 inline-block hover:text-white `}
                  to="/clients/staff"
                >
                  Staff
                </Link>
              </button> */}
              {/* <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/clients/bookings"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-3 inline-block hover:text-white `}
                  to="/clients/bookings"
                >
                  Bookings
                </Link>
              </button> */}

              <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/clients/schedule"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-3 inline-block hover:text-white `}
                  to="/clients/schedule"
                >
                  Schedule
                </Link>
              </button>

              <button
                onClick={handleLogout}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700 inline-block"
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
        } h-screen absolute w-1/4 md:w-[67%] z-[2] cursor-pointer transition-all left-0 lg:hidden bg-black/50 `}
      ></div>
    </nav>
  );
});
