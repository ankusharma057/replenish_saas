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
    <nav className="bg-cyan-400 relative z-20">
      <div className=" mx-auto lg:px-4 sm:pl-6 sm:pr-0 ">
        <div className="flex items-center justify-start  h-26">
          <div className=" xl:hidden flex-shrink-0 p-2">
            <a href="/addInvoice">
              <Image
                src="/replenish-logo.png"
                className="relative z-30"
                width="60px"
                roundedCircle
              />
            </a>
          </div>
          <div className=" w-full pr-6 flex justify-end xl:w-full">
            <div className="xl:hidden">
              <button
                onClick={handleMenuSHow}
                className="border-none relative z-30 text-w-full py-3 5xl transition-all text-5xl text-white"
              >
                ≡
              </button>
            </div>
            <div
              className={` ${isMenuShow ? "translate-x-full" : ""
                } xl:flex xl:justify-between pt-20 xl:pt-0 z-20 fixed top-0  h-screen bg-cyan-400 right-0 w-1/2 md:w-full gap-y-2 items-center xl:w-full xl:static flex-col xl:flex-row xl:h-auto ml-10 flex xl:items-center space-x-4 transition-all xl:translate-x-0  `}
            >
              <div className="flex flex-col xl:flex-row">

                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/addinvoice" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block hover:text-white `}
                    href="/addinvoice"
                  >
                    Submit invoice
                  </a>
                </button>
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/invoicelist" && "bg-[#008989a1]"} hover:bg-[#008989a1]  w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/invoicelist"
                  >
                    Invoice List
                  </a>
                </button>
                {(authUserState.user?.is_inv_manager === true ||
                  authUserState.user?.is_admin) === true && (
                    <button
                      onClick={handleMenuSHow}
                      className={`${location.pathname === "/schedule" && "bg-[#008989a1]"}  hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                    >
                      <a
                        className={`no-underline text-white py-[1rem] inline-block `}
                        href="/schedule"
                      >
                        Schedule
                      </a>
                    </button>
                  )}
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/employees" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/employees"
                  >
                    Staff
                  </a>
                </button>
                <button
                    onClick={handleMenuSHow}
                    className={`${(location.pathname === "/intake-forms" || location.pathname === "/new-intake-forms") &&  "bg-[#008989a1]"}  hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                  >
                    <a
                      className={`no-underline text-white py-[1rem] inline-block `}
                      href="/intake-forms"
                    >
                      Intake Forms
                    </a>
                </button>

                  
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/customers" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/customers"
                  >
                    Clients
                  </a>
                </button>

                {(authUserState.user?.is_inv_manager === true ||
                  authUserState.user?.is_admin) === true && (
                    <button
                      onClick={handleMenuSHow}
                      className={`${location.pathname === "/inventories" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                    >
                      <a
                        className={`no-underline text-white py-[1rem] inline-block `}
                        href="/inventories"
                      >
                        Inventories
                      </a>
                    </button>
                  )}
                {(authUserState.user?.is_admin) === true && (
                    <button
                    onClick={handleMenuSHow}
                    className={`${location.pathname === "/treatments" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                  >
                    <a
                      className={`no-underline text-white py-[1rem] inline-block `}
                      href="/treatments"
                    >
                      Treatments
                    </a>
                  </button>
                )}

                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/myprofile" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/myprofile"
                  >
                    My Profile
                  </a>
                </button>
                <div className="hidden xl:!ml-0 xl:flex xl:items-center xl:pl-[340px]">
                  <a href="/addInvoice">
                    <Image
                      src="/replenish-logo.png"
                      className="relative z-30"
                      width="60px"
                      height="60px"
                      roundedCircle
                    />
                  </a>
                </div>
              </div>


              <div>
                <button
                  onClick={handleLogout}
                  className={`${location.pathname === "" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-[26px] transition-all text-lg text-white font-medium `}
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={handleMenuSHow}
        className={`${isMenuShow ? "-translate-x-full" : ""
          } h-screen absolute w-[51%] md:w-[76%] z-[2] cursor-pointer transition-all left-0 xl:hidden bg-black/50 `}
      ></div>
    </nav>
  );

  const employeeHeader = (
    <nav className="bg-cyan-400 relative z-20">
      <div className=" mx-auto lg:px-4 sm:pl-6 sm:pr-0 ">
        <div className="flex items-center justify-start h-26">
          <div className=" xl:hidden flex-shrink-0 p-2">
            <a href="/addInvoice">
              <Image
                src="/replenish-logo.png"
                className="relative z-30"
                width="60px"
                roundedCircle
              />
            </a>
          </div>
          <div className=" w-full pr-6 flex justify-end xl:w-full">
            <div className="xl:hidden">
              <button
                onClick={handleMenuSHow}
                className="border-none relative z-30 text-w-full py-3 5xl transition-all text-5xl text-white"
              >
                ≡
              </button>
            </div>
            <div
              className={` ${isMenuShow ? "translate-x-full" : ""
                } xl:flex xl:justify-between pt-20 xl:pt-0 z-20 fixed top-0  h-screen bg-cyan-400 right-0 w-1/2 md:w-full gap-y-2 items-center xl:w-full xl:static flex-col xl:flex-row xl:h-auto ml-10 flex xl:items-center space-x-4 transition-all xl:translate-x-0  `}
            >
              <div className="flex flex-col xl:flex-row">

                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/addinvoice" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block hover:text-white `}
                    href="/addinvoice"
                  >
                    Submit invoice
                  </a>
                </button>
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/products" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/products"
                  >
                    Product List
                  </a>
                </button>
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/schedule" && "bg-[#008989a1]"}  hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/schedule"
                  >
                    Schedule
                  </a>
                </button>
                <button
                    onClick={handleMenuSHow}
                    className={`${(location.pathname === "/intake-forms" || location.pathname === "/new-intake-forms") &&  "bg-[#008989a1]"}  hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                  >
                    <a
                      className={`no-underline text-white py-[1rem] inline-block `}
                      href="/intake-forms"
                    >
                      Intake Forms
                    </a>
                </button>

                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/customers" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/customers"
                  >
                    Clients
                  </a>
                </button>

                
                {(authUserState.user?.is_inv_manager === true &&
                  <>
                    <button
                      onClick={handleMenuSHow}
                      className={`${location.pathname === "/employees" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                    >
                      <a
                        className={`no-underline text-white py-[1rem] inline-block `}
                        href="/employees"
                      >
                        All Employees
                      </a>
                    </button>
                    <button
                      onClick={handleMenuSHow}
                      className={`${location.pathname === "/inventories" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                    >
                      <a
                        className={`no-underline text-white py-[1rem] inline-block `}
                        href="/inventories"
                      >
                        Inventories
                      </a>
                    </button>
                  </>
                )}
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/treatments" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/treatments"
                  >
                    Treatments
                  </a>
                </button>
                <button
                  onClick={handleMenuSHow}
                  className={`${location.pathname === "/myprofile" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-2.5 transition-all text-lg  font-medium `}
                >
                  <a
                    className={`no-underline text-white py-[1rem] inline-block `}
                    href="/myprofile"
                  >
                    My Profile
                  </a>
                </button>
                <div className={`hidden xl:!ml-0 xl:flex xl:items-center ${authUserState.user.is_inv_manager ? "xl:pl-[340px]" : "xl:pl-[580px]"} `}>
                  <a href="/addInvoice">
                    <Image
                      src="/replenish-logo.png"
                      className="relative z-30"
                      width="60px"
                      height="60px"
                      roundedCircle
                    />
                  </a>
                </div>
              </div>
              <div>
                <button
                  onClick={handleLogout}
                  className={`${location.pathname === "" && "bg-[#008989a1]"} hover:bg-[#008989a1] w-full xl:text-sm xl:w-auto px-3 py-[26px] transition-all text-lg text-white font-medium `}
                >
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={handleMenuSHow}
        className={`${isMenuShow ? "-translate-x-full" : ""
          } h-screen absolute w-[51%] md:w-[76%] z-[2] cursor-pointer transition-all left-0 xl:hidden bg-black/50 `}
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
