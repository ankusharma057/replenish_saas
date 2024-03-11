import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import { createClientSchedule, signupClient } from "../../Server";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { useAuthContext } from "../../context/AuthUserContext";
import { CLIENT_LOGIN } from "../../Constants/AuthConstants";

function ClientSignup() {
  const [isLoading, setLoading] = useState(false);
  const { authUserState, authUserDispatch } = useAuthContext();
  const loginState = {
    email: "",
    password: "",
  };

  const [formInput, setFormInput] = useState(loginState);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (authUserState.client) {
      return navigate("/clients", {
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
      const res = await signupClient({
        client: formInput,
        ref: searchParams.get("ref"),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      if (res.status === 200) {
        authUserDispatch({ type: CLIENT_LOGIN, payload: res.data });
        toast.success("Successfully Logged In");
        if (
          localStorage.getItem("treatment") &&
          localStorage.getItem("formateData") &&
          localStorage.getItem("appointmentData")
        ) {
          let selectedTreatMent = JSON.parse(localStorage.getItem("treatment"));
          let appointment = JSON.parse(localStorage.getItem("appointmentData"));
          const locId = searchParams.get("locId");
          const empId = searchParams.get("empId");
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
          console.log(data, copyAppointMent);
          if (data?.redirect_url) {
            navigate(`/clients/payment/confirm_payment`, {
              state: {
                redirect_url: data?.redirect_url,
                locId,
                empId,
                selectedTreatMent,
                id: data?.schedule?.id,
              },
            });
          } else {
            navigate(`/clients/location${window.location.search}`, {
              replace: true,
            });
            toast.error("Something went wrong. Please try again.");
          }
        }
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
            Sign up to ReplenishMD
          </h2>

          <Form onSubmit={handleSubmit}>
            <LabelInput
              label="Name"
              type="text"
              placeholder="Enter your name"
              controlId="name"
              name="name"
              onChange={handleChange}
              required
            />

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
                  to={`/clients/signin?redirect=${
                    searchParams.get("redirect") || ""
                  }`}
                  className="font-medium no-underline text-indigo-600 hover:text-indigo-500"
                >
                  Already have an account? Login
                </Link>
              </div>
            </div>

            <Loadingbutton
              isLoading={isLoading}
              loadingText="Signup..."
              title="Signup"
              type="submit"
            />
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ClientSignup;
