import React, { useEffect, useState, memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import Image from "react-bootstrap/Image";
import { Link } from "react-router-dom";

export default memo(function Header({ userProfile }) {
  const [isMenuShow, setisMenuShow] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch("/api/logout", {
      method: "DELETE",
    }).then((res) => {
      console.log({ res });
      if (res.ok) {
        sessionStorage.getItem("login");
        window.location.reload();
        navigate("/");
      }
    });
  };

  const adminHeader = (
    <nav className="bg-blue-400">
      <div className="max-w-7xl mx-auto lg:px-4 sm:pl-6 sm:pr-0 ">
        <div className="flex items-center justify-between h-26">
          <div className="flex-shrink-0">
            <Navbar.Brand href="/addInvoice">
              <Image src="/replenish-logo.png" width="100px" roundedCircle />
            </Navbar.Brand>
          </div>
          <div className="relative z-10 w-full   pr-6  flex justify-end lg:w-auto">
            <div className="lg:hidden">
              <button
                onClick={() => setisMenuShow(!isMenuShow)}
                className="border-none  text-5xl text-white"
              >
                ≡
              </button>
            </div>
            <div
              className={` ${
                isMenuShow ? "hidden" : ""
              } lg:block pt-8 lg:pt-0 absolute top-[4rem] h-screen bg-blue-400 right-0 w-3/4 gap-4 items-center lg:w-auto lg:static flex-col lg:flex-row lg:h-auto ml-10 flex lg:items-baseline space-x-4`}
            >
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/addinvoice">
                  <Nav.Link>Submit invoice</Nav.Link>
                </LinkContainer>
              </button>
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/invoicelist">
                  <Nav.Link>Invoice List</Nav.Link>
                </LinkContainer>
              </button>
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/signup">
                  <Nav.Link>Create a new user</Nav.Link>
                </LinkContainer>
              </button>

              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/products">
                  <Nav.Link>Product List</Nav.Link>
                </LinkContainer>
              </button>
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/employees">
                  <Nav.Link>All Employees</Nav.Link>
                </LinkContainer>
              </button>

              {(userProfile?.is_inv_manager === true || userProfile?.is_admin) === true && (
                <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                  <LinkContainer to="/inventories">
                    <Nav.Link>Inventories</Nav.Link>
                  </LinkContainer>
                </button>
              )}

              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/myprofile">
                  <Nav.Link>My Profile</Nav.Link>
                </LinkContainer>
              </button>

              <button
                onClick={handleLogout}
                className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700"
              >
                <a>Logout</a>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  const employeeHeader = (
    <nav className="bg-blue-400">
      <div className="max-w-7xl mx-auto md:px-4 sm:pl-6 sm:pr-0 lg:px-8">
        <div className="flex items-center justify-between h-26">
          <div className="flex-shrink-0">
            <Navbar.Brand href="/addInvoice">
              <Image src="/replenish-logo.png" width="100px" roundedCircle />
            </Navbar.Brand>
          </div>

          <div className="relative z-10 w-full  pr-6 flex justify-end md:w-auto">
            <div className="md:hidden">
              <button
                onClick={() => setisMenuShow(!isMenuShow)}
                className="border-none  text-5xl text-white"
              >
                ≡
              </button>
            </div>
            <div
              className={` ${
                isMenuShow ? "hidden" : ""
              } md:block pt-8 md:pt-0 absolute top-[4rem] h-screen bg-blue-400 right-0 w-3/4 gap-4 items-center md:w-auto md:static flex-col md:flex-row md:h-auto ml-10 flex md:items-baseline space-x-4`}
            >
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/addinvoice">
                  <Nav.Link>Submit invoice</Nav.Link>
                </LinkContainer>
              </button>
              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/products">
                  <Nav.Link>Product List</Nav.Link>
                </LinkContainer>
              </button>

              {userProfile?.is_inv_manager === true && (
                <>
                  <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                    <LinkContainer to="/employees">
                      <Nav.Link>All Employees</Nav.Link>
                    </LinkContainer>
                  </button>

                  <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                    <LinkContainer to="/inventories">
                      <Nav.Link>Inventories</Nav.Link>
                    </LinkContainer>
                  </button>
                </>
              )}

              <button className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700">
                <LinkContainer to="/myprofile">
                  <Nav.Link>My Profile</Nav.Link>
                </LinkContainer>
              </button>

              <button
                onClick={handleLogout}
                className="hover:bg-blue-200 px-3 py-2 rounded-md text-lg md:text-sm font-medium text-gray-700"
              >
                <a>Logout</a>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div>
      {userProfile && userProfile?.is_admin ? adminHeader : employeeHeader}
    </div>
  );
});
