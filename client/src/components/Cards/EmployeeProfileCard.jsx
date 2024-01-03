import React from "react";
import { CircleUser } from "lucide-react";
import { Link } from "react-router-dom";

const EmployeeProfileCard = ({ image, name, id, email }) => {
  return (
    <Link
      to={`/clients/schedule/${id}`}
      className="bg-white shadow-md flex items-center gap-4 flex-1 min-w-72 p-2 border transition-all hover:!border-blue-500 rounded-lg no-underline"
    >
      {image ? (
        <div className="rounded-full col-span-1 w-[100px] h-[100px] ">
          <img
            src={image}
            alt={id}
            className="w-full h-full object-cover rounded-full "
          />
        </div>
      ) : (
        <CircleUser className="w-24  col-span-1 h-24 text-black/50" />
      )}

      <div>
        <p className="break-words">{name}</p>
        <p className="text-sm break-words">{email}</p>
      </div>
    </Link>
  );
};

export default EmployeeProfileCard;
