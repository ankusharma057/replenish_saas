import {
  LOGOUT,
  LOGIN,
  CLIENT_LOGIN,
  CLIENT_LOGOUT,
} from "../../Constants/AuthConstants";

// Define your reducer function
export const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN: {
      localStorage.setItem("user", JSON.stringify(action.payload));
      return { ...state, isAuthenticated: true, user: action.payload };
    }
    case CLIENT_LOGIN: {
      sessionStorage.setItem("client", JSON.stringify(action.payload));
      return { ...state, isAuthenticated: true, client: action.payload };
    }
    case LOGOUT: {
      localStorage.removeItem("user");
      return { ...state, isAuthenticated: false, user: null };
    }

    case CLIENT_LOGOUT: {
      sessionStorage.removeItem("client");
      return { ...state, isAuthenticated: false, client: null };
    }
    default:
      return state;
  }
};
