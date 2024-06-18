import React from "react";
import { Link } from "react-router-dom";

const LocationCard = ({ name, path, id }) => {
  return (
    <div>
      <p className="text-2xl font-bold capitalize text-slate-800">{name}</p>

      <Link
        to={path || "/clients"}
        className="text-center transition-all hover:bg-black bg-primary-dark-blue block text-white no-underline p-3 rounded-lg  font-medium  "
      >
        Book an appointment at {name}
      </Link>
    </div>
  );
};

export default LocationCard;
