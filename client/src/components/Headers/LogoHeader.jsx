import React from "react";
import { Link } from "react-router-dom";

const LogoHeader = () => {
  return (
    <Link to="/clients">
      <img
        src="/2replenishmdlogobrown.png"
        className="w-96 "
        alt="Replenish Md"
      />
    </Link>
  );
};

export default LogoHeader;
