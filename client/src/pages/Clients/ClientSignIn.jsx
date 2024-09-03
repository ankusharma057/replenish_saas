import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import { createClientSchedule, signInClient, signupClient } from "../../Server";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { useAuthContext } from "../../context/AuthUserContext";
import { CLIENT_LOGIN } from "../../Constants/AuthConstants";

function ClientSignIn() {
  const [isLoading, setLoading] = useState(false);
  const { authUserState, authUserDispatch } = useAuthContext();
  const loginState = {
    email: "",
    password: "",
  };
  const [params] = useSearchParams();

  const [formInput, setFormInput] = useState(loginState);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUserState.client) {
      return navigate(`/clients/location${window.location.search}`, {
        replace: true,
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, authUserState.clients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await signInClient(formInput);
      if (res.status === 200) {
        authUserDispatch({ type: CLIENT_LOGIN, payload: res.data });
        toast.success("Successfully Logged In");
        window.location.replace(window.location.href);
        if (
          localStorage.getItem("treatment") &&
          localStorage.getItem("formateData") &&
          localStorage.getItem("appointmentData")
        ) {
          let selectedTreatMent = JSON.parse(localStorage.getItem("treatment"));
          let appointment = JSON.parse(localStorage.getItem("appointmentData"));
          const locId = params.get("locId");
          const empId = params.get("empId");
          const copyAppointMent = {
            start_time: appointment?.selectedTimeSlot?.start,
            date: appointment?.date,
            end_time: appointment?.selectedTimeSlot?.end,
            employee_id: empId,
            treatment_id: selectedTreatMent?.treatment?.id,
            product_id: selectedTreatMent?.product?.id,
            location_id: locId,
          };
          const { data } = await createClientSchedule(copyAppointMent);
          if (data?.redirect_url) {
            const stateObject = {
                locId,
                empId,
                selectedTreatMent,
                id: data?.schedule.id,
            };
      
            if (data?.redirect_url && data?.schedule?.employee?.pay_50) {
              stateObject.redirect_url = data?.redirect_url;
            }else{
              stateObject.redirect_url = `/clients/appointments`;
            }
            navigate(`/clients/payment/confirm_payment?empId=${empId}&treatment_id=${selectedTreatMent?.treatment?.id}`, {
              state: stateObject,
            });
          } else if(data.schedule) {
            navigate(`/clients/location${window.location.search}`, {
              replace: true,
            });
            toast.success("Appointment added successfully.");
          } else {
            navigate(`/clients/location${window.location.search}`, {
              replace: true,
            });
            toast.error("Something went wrong. Please try again.");
          }
        }
        // navigate(`/clients/location${window.location.search}`, {
        //   replace: true,
        // });
      }
    } catch (error) {
      if (error.response.status === 302) {
        navigate(`/clients/resetPassword?email=${formInput.email}`, {
          replace: true,
        });
        toast.success("Please reset your password.");
      } else {
        toast.error(
          error?.response?.data?.error ||
            error?.response?.statusText ||
            error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInput({ ...formInput, [name]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to ReplenishMD
          </h2>

          <Form onSubmit={handleSubmit}>
            <LabelInput
              label="Email"
              type="email"
              placeholder="Enter your email"
              controlId="email"
              name="email"
              onChange={handleChange}
              required
            />
            <LabelInput
              label="Password"
              type="password"
              placeholder="Enter password"
              controlId="password"
              name="password"
              onChange={handleChange}
              required
            />

            <div className="flex items-center mb-4 justify-between">
              <div className="text-sm">
                <Link
                  to={`/clients/signup${window.location.search}`}
                  className="font-medium no-underline text-indigo-600 hover:text-indigo-500"
                >
                  Don't have an account? Signup
                </Link>
              </div>
            </div>

            <Loadingbutton
              isLoading={isLoading}
              loadingText="Login..."
              title="Login"
              type="submit"
            />
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ClientSignIn;
