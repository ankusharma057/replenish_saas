import React from "react";
import { SearchIcon } from "lucide-react";

const SearchInput = ({ ...props }) => {
  return (
    <div className="relative  w-full flex items-center">
      <input
        autoFocus
        className="w-full pl-9 py-2 border-2 rounded-md focus:outline-blue-500 !border-gray-400"
        {...props}
      />
      <SearchIcon className="absolute left-2 pointer-events-none text-gray-400" />
    </div>
  );
};

export default SearchInput;
