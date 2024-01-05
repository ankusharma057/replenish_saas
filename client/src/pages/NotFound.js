import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="w-full h-full  flex flex-col justify-center  items-center">
      <h1>Page Not Found</h1>
      <Link
        to="/"
        className="py-2 px-4 border-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-500 no-underline border-[1px] rounded-lg "
      >
        Go Back
      </Link>
    </div>
  );
};

export default NotFound;
