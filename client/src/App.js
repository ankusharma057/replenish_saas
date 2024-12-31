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
import "./App.css"

const ConfirmPayment = lazy(() =>
  import("./pages/Clients/payment/ConfirmPayment")
);
const ClientPaymentSuccess = lazy(() =>
  import("./pages/Clients/payment/ClientPaymentSuccess")
);
const ClientsBookedAppointments = lazy(() =>
  import("./pages/Clients/ClientsBookedAppointments")
);
const ClientSignup = lazy(() => import("./pages/Clients/ClientSignup"));
const ClientLocation = lazy(() => import("./pages/Clients/ClientLocation"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClientResetPassword = lazy(() =>
  import("./pages/Clients/ClientResetPassword")
);
const ClientRoot = lazy(() => import("./pages/Clients"));
const AllClientRoot = lazy(() => import("./pages/AllClients"));
const ClientAppointment = lazy(() =>
  import("./pages/Clients/ClientAppointments")
);
// const ClientStaff = lazy(() => import("./pages/Clients/ClientStaff"));
const ClientSignIn = lazy(() => import("./pages/Clients/ClientSignIn"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Login = lazy(() => import("./pages/Auth/Login"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const InvoicesToPay = lazy(() => import("./pages/InvoicesToPay"));
const Settings = lazy(() => import("./pages/Settings"));
const Settings2 = lazy(() => import("./pages/Settings/Settings"));
const Locations = lazy(() => import("./pages/Settings/Locations"));
const DashboardSettings = lazy(() => import("./pages/Settings/Dashboard"));
const NewAndUpdateLocation = lazy(() => import("./pages/Settings/NewAndUpdateLocation"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AddInvoices = lazy(() => import("./pages/AddInvoice"));
const Invoice = lazy(() => import("./pages/Invoice"));
const SignUp = lazy(() => import("./pages/Auth/SignUp"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Employee = lazy(() => import("./pages/Employee"));
const Products = lazy(() => import("./pages/Products"));
const Treatment = lazy(() => import("./pages/Treatment"));
const IntakeForm = lazy(() => import("./pages/IntakeForm"));
const NewIntakeForm = lazy(() => import("./pages/NewIntakeForm"));
const IntakeFormPreview = lazy(() => import("./pages/IntakeFormPreview"));
const SubmitedClientIntakeForm = lazy(() => import("./pages/SubmitedClientIntakeForm"));
const Health = lazy(() => import("./pages/Health"));
const ClientProfileUpdate= lazy(()=>import("./pages/Clients/ClientsProfileUpdate"))
const AddNewClient= lazy(()=>import("./pages/Clients/AddNewClient"))
const Reports= lazy(()=>import("./pages/Reports/Reports"))
const ReportSummary= lazy(()=>import("./pages/Reports/ReportSummary"))
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
    try {
      if (location.pathname === "/healthz") {
        return navigate("/healthz");
      }
  
      if (location.pathname === "/signup") {
        return;
      }
  
      const { data } = await getUpdatedUserProfile();
  
      if (data) {
        authUserDispatch({ type: LOGIN, payload: data });
      } else {
        if (!location.pathname.includes("clients")) {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
  
      if (!location.pathname.includes("clients")) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    let isCancelled = false;

    if (!isCancelled) {
      // getClientUserProfile();
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
      ["/invoicelist", "/employees"].includes(location.pathname) &&
      authUserState.user?.id
    ) {
      navigate("/myprofile");
    }
    else if(location.pathname === "/healthz"){
      navigate("/healthz");
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
    <div id="top-model" className={`overflow-x-hidden ${ (window.location.pathname).startsWith("/intake") ? "" :"md:h-screen"} `}>
      <Suspense fallback={<SuspenseLoading />}>
      
        {authUserState.client ? (
          <ClientHeader />
        ) : authUserState.user ? (
          (window.location.pathname != "/intake-form-preview/"
            &&
          <Header />)
        ) : null}

        <Routes>
          <Route path="/healthz" element={<Health />} />
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/clients/signup" element={<ClientSignup />} />
          <Route path="/clients/signin" element={<ClientSignIn />} />
          <Route path="/customers/:clientId" element={<AllClientRoot />} />
          <Route path="/clients" element={<ClientRoot />} />
          <Route path="/clients/location" element={<ClientLocation />} />
          <Route path="/clients/intake-form/:id?" element={<IntakeFormPreview />} />
          <Route path="/intake-form-preview/:id?" element={<IntakeFormPreview />} />
          <Route path="/clients/submitted-intake-form-preview/:id?" element={<IntakeFormPreview />} />
          <Route path="/clients/submited-intake-forms-preview" element={<SubmitedClientIntakeForm />} />
          <Route path="/clients/payment/success" element={<ClientPaymentSuccess />}/>
          <Route path="/submitted-intake-form-preview/:id?" element={<IntakeFormPreview />} />
          <Route path="/reports" element={<Reports />} >
            <Route path="report-Summary" element={<ReportSummary />} />
          </Route>

          {authUserState.client && (
            <>
              <Route
                path="/clients/appointments"
                element={<ClientAppointment />}
              />
              <Route
                path="/clients/appointments"
                element={<ClientsBookedAppointments />}
              />
              <Route
                path="/clients/payment/success"
                element={<ClientPaymentSuccess />}
              />
              <Route
                path="/clients/payment/confirm_payment"
                element={<ConfirmPayment />}
              />
            </>
          )}
          <Route
            path="/clients/resetPassword"
            element={<ClientResetPassword />}
          />
          <Route
            path="/clients/schedule/:employee_id"
            element={<ClientAppointment />}
          />

          {/* <Route path="/clients/schedule" element={<ClientSchedule />} /> */}
          {authUserState.user && (
            <>
              {authUserState.user &&
                (authUserState.user?.is_inv_manager ||
                  authUserState.user?.is_admin) && (
                  <>
                    <Route path="/inventories" element={<Inventory />} />
                    <Route path="/treatments" element={<Treatment />} />
                    <Route path="/employees" element={<Employee />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/intake-forms" element={<IntakeForm />} />
                    <Route path="/new-intake-form" element={<NewIntakeForm />} />
                    {/* <Route path="/new-intake-form" element={<NewIntakeForm />} /> */}
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
                  <Route path="/client-profile-update/:id/:type" element={<ClientProfileUpdate />} />
                  <Route path="/add-new-client" element={<AddNewClient />} />
                  <Route path="/invoices-to-pay" element={<InvoicesToPay />} />
                  {/* <Route path="/settings" element={<Settings />} /> */}
                  <Route path="/settings" element={<Settings2 />} >
                    <Route path="locations" element={<Locations />} />
                    <Route path="locations/:newOrUpdate" element={<NewAndUpdateLocation />} />
                    <Route path="dashboard" element={<DashboardSettings />} />
                  </Route>
                </>
              ) : (
                <>
                  <Route path="/treatments" element={<Treatment />} />
                  <Route path="/myprofile" element={<MyProfile />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/addinvoice" element={<AddInvoices />} />
                  <Route path="/intake-forms" element={<IntakeForm />} />
                  <Route path="/new-intake-form" element={<NewIntakeForm />} />
                  <Route path="/customers/:clientId" element={<AllClientRoot />} />
                  <Route path="/add-new-client" element={<AddNewClient />} />
                  <Route path="/client-profile-update/:id/:type" element={<ClientProfileUpdate />} />
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
