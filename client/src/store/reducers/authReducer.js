import { LOGOUT, LOGIN } from "../../Constants/AuthConstants";

// Define your reducer function
export const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN: {
      sessionStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, isAuthenticated: true, user: action.payload };
    }
    case LOGOUT: {
      sessionStorage.removeItem("user");
      return { ...state, isAuthenticated: false, user: null };
    }
    default:
      return state;
  }
};
