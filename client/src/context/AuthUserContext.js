// AuthContext.js
import React, { createContext, useReducer, useContext } from "react";
import { authReducer } from "../store/reducers/authReducer";

// Define the initial state for your authentication context
const initialState = {
  isAuthenticated: false,
  user: JSON.parse(localStorage.getItem("user")),
  client: JSON.parse(sessionStorage.getItem("client")),
};

// Create an authentication context
const AuthContext = createContext();

// Create an authentication context provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isFillingForm, setIsFillingForm] = React.useState(false)
  return (
    <AuthContext.Provider
      value={{ authUserState: state, authUserDispatch: dispatch, isFillingForm: isFillingForm, setIsFillingForm }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for accessing the authentication context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
