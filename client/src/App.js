import React, { useEffect, Suspense, lazy } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "./context/AuthUserContext";
import { LOGIN } from "./Constants/AuthConstants";
import { getUpdatedUserProfile } from "./Server";
import SuspenseLoading from "./components/SuspenseLoading";
import Header from "./components/Header";
const Login = lazy(() => import("./pages/Auth/Login"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Inventory = lazy(() => import("./pages/Inventory"));
const AddInvoices = lazy(() => import("./pages/AddInvoice"));
const Invoice = lazy(() => import("./pages/Invoice"));
const Signup = lazy(() => import("./pages/Auth/SignUp"));
const AddProduct = lazy(() => import("./pages/AddProduct"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const Employee = lazy(() => import("./pages/Employee"));
const Products = lazy(() => import("./pages/Products"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUserState, authUserDispatch } = useAuthContext();
  useEffect(() => {
    let isCancelled = false;
    const getMyProfile = async () => {
      const { data } = await getUpdatedUserProfile();
      if (data) {
        authUserDispatch({ type: LOGIN, payload: data });
      } else {
        navigate("/");
      }
    };
    !isCancelled && getMyProfile();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname !== "/resetPassword") {
      if (!authUserState.user) {
        navigate("/");
      }
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="overflow-x-hidden">
      {/* <SuspenseLoading /> */}
      <Suspense fallback={<SuspenseLoading />}>
        {authUserState.user && <Header />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/resetPassword" element={<ResetPassword />} />

          {authUserState.user && (
            <>
              {authUserState.user &&
                (authUserState.user?.is_inv_manager ||
                  authUserState.user?.is_admin) && (
                  <>
                    <Route path="/inventories" element={<Inventory />} />
                    <Route path="/employees" element={<Employee />} />
                  </>
                )}

              {authUserState.user && authUserState.user?.is_admin ? (
                <>
                  <Route path="/addproduct" element={<AddProduct />} />
                  <Route path="/employees" element={<Employee />} />
                  <Route path="/invoicelist" element={<Invoice />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/addinvoice" element={<AddInvoices />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/myprofile" element={<MyProfile />} />
                  <Route path="*" element={<MyProfile />} />
                </>
              ) : (
                <>
                  <Route path="/myprofile" element={<MyProfile />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/addinvoice" element={<AddInvoices />} />
                  <Route path="*" element={<MyProfile />} />
                </>
              )}
            </>
          )}
        </Routes>
        <ToastContainer position="top-center" />
      </Suspense>
    </div>
  );
}

export default App;
