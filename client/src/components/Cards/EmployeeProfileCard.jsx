import React from "react";
import { CircleUser } from "lucide-react";
import { Link } from "react-router-dom";

const EmployeeProfileCard = ({ image, name, path }) => {
  return (
    <Link
      to={path || "/clients"}
      className="bg-white h-40 relative group/card shadow-md flex flex-col flex-1 items-center justify-center gap-1 min-w-40 border transition-all hover:!border-blue-500 rounded-lg no-underline"
    >
      {image ? (
        <div className="w-full h-full rounded-lg">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-lg "
          />
        </div>
      ) : (
        <CircleUser className="w-24  h-24 text-slate-800" />
      )}

      {/* <div>
        <p className="break-words">{name}</p>
      </div> */}
      <span className="opacity-0 group-hover/card:!opacity-100 flex bg-black/80 text-white backdrop-blur-sm rounded-lg absolute top-0 right-0 bottom-0  w-full h-full  justify-center transition-all  items-center ">
        {name}
      </span>
    </Link>
  );
};

export default EmployeeProfileCard;
