import React from "react";

const ClientLayout = ({ children }) => {
  return (
    <div className=" bg-gray-100 min-h-screen h-min py-3 px-[1rem] md:px-20 lg:px-52 xl:px-64">
      {children}
    </div>
  );
};

export default ClientLayout;
