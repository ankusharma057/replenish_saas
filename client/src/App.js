import React, { useEffect, Suspense, lazy } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "./context/AuthUserContext";
import { CLIENT_LOGIN, LOGIN } from "./Constants/AuthConstants";
import { getClientProfile, getUpdatedUserProfile } from "./Server";
import SuspenseLoading from "./components/SuspenseLoading";
import Header from "./components/Header";
import ClientHeader from "./components/ClientHeader";
import ClientLocation from "./pages/Clients/ClientLocation";

const ClientSignup = lazy(() => import("./pages/Clients/ClientSignup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClientResetPassword = lazy(() =>
  import("./pages/Clients/ClientResetPassword")
);
const ClientSchedule = lazy(() => import("./pages/Clients/ClientSchedule"));
const ClientRoot = lazy(() => import("./pages/Clients"));
const ClientAppointment = lazy(() =>
  import("./pages/Clients/Schedule/ClientAppointment")
);
const ClientStaff = lazy(() => import("./pages/Clients/ClientStaff"));
const ClientSignIn = lazy(() => import("./pages/Clients/ClientSignIn"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Login = lazy(() => import("./pages/Auth/Login"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AddInvoices = lazy(() => import("./pages/AddInvoice"));
const Invoice = lazy(() => import("./pages/Invoice"));
// const Signup = lazy(() => import("./pages/Auth/SignUp"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Employee = lazy(() => import("./pages/Employee"));
const Products = lazy(() => import("./pages/Products"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUserState, authUserDispatch } = useAuthContext();

  const getClientUserProfile = async () => {
    try {
      const { data } = await getClientProfile();
      if (data) {
        authUserDispatch({ type: CLIENT_LOGIN, payload: data });
        if (!location.pathname?.includes("/clients")) {
          navigate("/clients");
        }
      }
    } catch (error) {}
  };
  const getMyProfile = async () => {
    const { data } = await getUpdatedUserProfile();
    if (data) {
      authUserDispatch({ type: LOGIN, payload: data });
    } else {
      if (!location.pathname.includes("clients")) navigate("/");
    }
  };

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled) {
      getClientUserProfile();
      getMyProfile();
    }
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (
  //     !authUserState.client &&
  //     location.pathname.includes("clients") &&
  //     !location.pathname.includes("clients/signin") &&
  //     !location.pathname.includes("clients/signup")
  //   ) {
  //     navigate("/clients/signin");
  //   } else if (authUserState.client && !location.pathname.includes("clients")) {
  //     return navigate("/clients");
  //   } else if (
  //     location.pathname === "/resetPassword" ||
  //     location.pathname.includes("clients")
  //   ) {
  //   } else if (
  //     !authUserState.user?.is_admin &&
  //     !authUserState.user?.is_inv_manager &&
  //     ["/invoicelist", "/schedule", "/employees"].includes(location.pathname) &&
  //     authUserState.user?.id
  //   ) {
  //     navigate("/myprofile");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [location.pathname]);

  useEffect(() => {
    const isClientRoute = location.pathname.includes("clients");
    const isClientSignInOrSignUp =
      isClientRoute &&
      !["/signin", "/signup"].some((path) => location.pathname.includes(path));
    const isNotClient = !isClientRoute;

    // if (!authUserState.client && isClientSignInOrSignUp) {
    //   navigate("/clients/signin");
    // } else
    if (authUserState.client && isNotClient) {
      navigate("/clients");
    } else if (
      !authUserState.user?.is_admin &&
      !authUserState.user?.is_inv_manager &&
      ["/invoicelist", "/schedule", "/employees"].includes(location.pathname) &&
      authUserState.user?.id
    ) {
      navigate("/myprofile");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.pathname,
    authUserState.client,
    authUserState.user?.id,
    authUserState.user?.is_admin,
    authUserState.user?.is_inv_manager,
  ]);

  return (
    <div className="overflow-x-hidden h-screen">
      <Suspense fallback={<SuspenseLoading />}>
        {authUserState.user ? <Header /> : <ClientHeader />}

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/clients/signup" element={<ClientSignup />} />
          <Route path="/clients/signin" element={<ClientSignIn />} />
          <Route path="/clients" element={<ClientRoot />} />
          <Route path="/clients/location" element={<ClientLocation />} />
          <Route
            path="/clients/resetPassword"
            element={<ClientResetPassword />}
          />
          <Route
            path="/clients/schedule/:employee_id"
            element={<ClientAppointment />}
          />

          <Route path="/clients/schedule" element={<ClientSchedule />} />
          {authUserState.user && (
            <>
              {authUserState.user &&
                (authUserState.user?.is_inv_manager ||
                  authUserState.user?.is_admin) && (
                  <>
                    <Route path="/inventories" element={<Inventory />} />
                    <Route path="/employees" element={<Employee />} />
                    <Route path="/schedule" element={<Schedule />} />
                  </>
                )}

              {authUserState.user && authUserState.user?.is_admin ? (
                <>
                  <Route path="/addproduct" element={<AddProduct />} />
                  <Route path="/employees" element={<Employee />} />
                  <Route path="/invoicelist" element={<Invoice />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/addinvoice" element={<AddInvoices />} />
                  {/* <Route path="/signup" element={<Signup />} /> */}
                  <Route path="/myprofile" element={<MyProfile />} />
                </>
              ) : (
                <>
                  <Route path="/myprofile" element={<MyProfile />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/addinvoice" element={<AddInvoices />} />
                </>
              )}
            </>
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Suspense>
    </div>
  );
}

export default App;
