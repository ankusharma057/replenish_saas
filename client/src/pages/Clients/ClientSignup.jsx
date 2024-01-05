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
import { signupClient } from "../../Server";
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
      const { data } = await signupClient({
        client: formInput,
        ref: searchParams.get("ref"),
      });
      if (data) {
        authUserDispatch({ type: CLIENT_LOGIN, payload: data });
        toast.success("Successfully Logged In");
        navigate(`/clients/location${window.location.search}|| ""}`, {
          replace: true,
        });
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
            error.response.statusText ||
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

export default ClientSignup;
