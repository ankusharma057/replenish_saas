import React from "react";

const LineInput = ({
  type,
  placeholder,
  controlId,
  name,
  onChange,
  required,
  ...rest
}) => {
  return (
    <input
      type={type}
      name={name}
      className="w-full p-2 border-b focus:outline-blue-500 !border-gray-400"
      placeholder={placeholder}
      required={required}
      onChange={onChange}
      onWheel={(e) => (type = "number" && e.target.blur())}
      {...rest}
    />
  );
};

export default LineInput;
