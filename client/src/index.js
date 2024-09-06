import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthUserContext";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { AsideLayoutProvide } from "./context/AsideLayoutContext";
import { StyledEngineProvider } from '@mui/material/styles';


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <AsideLayoutProvide>
        <BrowserRouter>
          <StyledEngineProvider injectFirst>
            <App />
          </StyledEngineProvider>
        </BrowserRouter>
      </AsideLayoutProvide>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
