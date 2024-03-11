import React, { useState, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthUserContext";
import { LOGOUT } from "../Constants/AuthConstants";
import { logoutUser } from "../Server";
import { toast } from "react-toastify";

export default memo(function Header() {
  const [isMenuShow, setisMenuShow] = useState(true);
  const navigate = useNavigate();
  const { authUserState, authUserDispatch } = useAuthContext();

  const location = useLocation();
  const handleLogout = async () => {
    try {
      await logoutUser();
      authUserDispatch({ type: LOGOUT });
      navigate("/");
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

  const adminHeader = (
    <nav className="bg-blue-400 relative z-20">
      <div className=" mx-auto lg:px-4 sm:pl-6 sm:pr-0 ">
        <div className="flex items-center justify-start h-26">
          <div className="flex-shrink-0 p-2">
            <Link to="/addInvoice">
              <Image
                src="/replenish-logo.png"
                className="relative z-30"
                width="60px"
                roundedCircle
              />
            </Link>
          </div>
          <div className=" w-full pr-6 flex justify-end xl:w-auto">
            <div className="xl:hidden">
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
              } xl:block pt-20 xl:pt-0 z-20 fixed top-0  h-screen bg-blue-400 right-0 w-1/2 md:w-1/4 gap-y-2 items-center xl:w-auto xl:static flex-col xl:flex-row xl:h-auto ml-10 flex xl:items-baseline space-x-4 transition-all xl:translate-x-0  `}
            >
              <button
                onClick={handleMenuSHow}
                className={` hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/addinvoice"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/addinvoice"
                >
                  Submit invoice
                </Link>
              </button>
              <button
                onClick={handleMenuSHow}
                className={` hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/invoicelist"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/invoicelist"
                >
                  Invoice List
                </Link>
              </button>
              {(authUserState.user?.is_inv_manager === true ||
                authUserState.user?.is_admin) === true && (
                <button
                  onClick={handleMenuSHow}
                  className={` hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
                >
                  <Link
                    className={` ${
                      location.pathname === "/schedule"
                        ? "text-white"
                        : "text-gray-700"
                    } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                    to="/schedule"
                  >
                    Schedule
                  </Link>
                </button>
              )}
              <button
                onClick={handleMenuSHow}
                className={` hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/employees"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/employees"
                >
                  Staff
                </Link>
              </button>

              {(authUserState.user?.is_inv_manager === true ||
                authUserState.user?.is_admin) === true && (
                <button
                  onClick={handleMenuSHow}
                  className={` :bg-blue-200 w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
                >
                  <Link
                    className={` ${
                      location.pathname === "/inventories"
                        ? "text-white"
                        : "text-gray-700"
                    } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                    to="/inventories"
                  >
                    Inventories
                  </Link>
                </button>
              )}
              {(authUserState.user?.is_inv_manager === true ||
                authUserState.user?.is_admin) === true && (
                <button
                  onClick={handleMenuSHow}
                  className={` :bg-blue-200 w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
                >
                  <Link
                    className={` ${
                      location.pathname === "/treatment"
                        ? "text-white"
                        : "text-gray-700"
                    } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                    to="/treatment"
                  >
                    Treatments
                  </Link>
                </button>
              )}

              <button
                onClick={handleMenuSHow}
                className={` hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
              >
                <Link
                  className={` ${
                    location.pathname === "/myprofile"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/myprofile"
                >
                  My Profile
                </Link>
              </button>

              <button
                onClick={handleLogout}
                className={` ${
                  location.pathname === ""
                } hover:bg-blue-200 hover:xl:bg-transparent w-full xl:text-sm xl:w-auto px-3 transition-all rounded-md text-lg  font-medium `}
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
        } h-screen absolute w-[51%] md:w-[76%] z-[2] cursor-pointer transition-all left-0 xl:hidden bg-black/50 `}
      ></div>
    </nav>
  );

  const employeeHeader = (
    <nav className="bg-blue-400 relative z-20">
      <div className=" mx-auto md:px-4 sm:pl-6 sm:pr-0 lg:px-8">
        <div className="flex items-center justify-start h-26">
          <div className="flex-shrink-0 p-2 relative z-30">
            <Link to="/addInvoice">
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
              } lg:block pt-20 lg:pt-0 z-20 fixed top-0  h-screen bg-blue-400 right-0 w-1/2 md:w-1/4  gap-y-2 items-center lg:w-auto lg:static flex-col lg:flex-row lg:h-auto ml-10 flex lg:items-baseline space-x-4 transition-all lg:translate-x-0 `}
            >
              <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/addinvoice"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/addinvoice"
                >
                  Submit invoice
                </Link>
              </button>
              <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/products"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/products"
                >
                  Product List
                </Link>
              </button>

              {authUserState.user?.is_inv_manager === true && (
                <>
                  <button
                    onClick={handleMenuSHow}
                    className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
                  >
                    <Link
                      className={` ${
                        location.pathname === "/employees"
                          ? "text-white"
                          : "text-gray-700"
                      } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                      to="/employees"
                    >
                      All Employees
                    </Link>
                  </button>

                  <button
                    onClick={handleMenuSHow}
                    className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
                  >
                    <Link
                      className={` ${
                        location.pathname === "/inventories"
                          ? "text-white"
                          : "text-gray-700"
                      } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                      to="/inventories"
                    >
                      Inventories
                    </Link>
                  </button>
                </>
              )}

              <button
                onClick={handleMenuSHow}
                className="hover:bg-blue-200 hover:lg:bg-transparent w-full lg:w-auto px-3 transition-all rounded-md text-lg  font-medium text-gray-700"
              >
                <Link
                  className={` ${
                    location.pathname === "/myprofile"
                      ? "text-white"
                      : "text-gray-700"
                  } no-underline text-gray-700 py-[1rem] inline-block hover:text-white `}
                  to="/myprofile"
                >
                  My Profile
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
        } h-screen absolute w-[51%] md:w-[76%] z-[2] cursor-pointer transition-all left-0 lg:hidden bg-black/50 `}
      ></div>
    </nav>
  );

  return (
    <div>
      {authUserState.user && authUserState.user?.is_admin
        ? adminHeader
        : employeeHeader}
    </div>
  );
});
