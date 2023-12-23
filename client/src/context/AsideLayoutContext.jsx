// AsideLayoutContext.js
import React, { createContext, useContext, useState } from "react";

// Create an authentication context
const AsideLayoutContext = createContext();

// Create an authentication context provider component
export const AsideLayoutProvide = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 1024);
  const collapse = () => {
    if (window.innerWidth < 1024) {
      setIsCollapsed((pre) => !pre);
    }
  };
  return (
    <AsideLayoutContext.Provider
      value={{ isCollapsed, setIsCollapsed, collapse }}
    >
      {children}
    </AsideLayoutContext.Provider>
  );
};

// Create a custom hook for accessing the authentication context
export const useAsideLayoutContext = () => {
  const context = useContext(AsideLayoutContext);
  if (!context) {
    throw new Error(
      "useAsideLayoutContext must be used within an AsideLayoutProvide"
    );
  }
  return context;
};
