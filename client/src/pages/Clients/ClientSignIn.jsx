import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import { signInClient, signupClient } from "../../Server";
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
  const [formInput, setFormInput] = useState(loginState);
  const location = useLocation();
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
      const { data } = await signInClient(formInput);
      if (data) {
        authUserDispatch({ type: CLIENT_LOGIN, payload: data });
        toast.success("Successfully Logged In");
        navigate("/clients", {
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
                  to="/clients/signup"
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
