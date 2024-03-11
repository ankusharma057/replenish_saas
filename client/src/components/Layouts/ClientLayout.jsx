import React from "react";
const ClientLayout = ({ children }) => {
  return (
    <>
      <div className=" bg-gray-100 min-h-screen h-min py-3 px-1 ">
        <div className="lg:container mx-auto">{children}</div>
      </div>
    </>
  );
};

export default ClientLayout;
