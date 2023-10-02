import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import { loginUser } from "../../Server";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { useAuthContext } from "../../context/AuthUserContext";
import { LOGIN } from "../../Constants/AuthConstants";

function Login() {
  const [isLoading, setLoading] = useState(false);
  const { authUserState, authUserDispatch } = useAuthContext();
  const loginState = {
    email: "",
    password: "",
  };

  const [formData, setFormData] = useState(loginState);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (authUserState.user && location.pathname === "/") {
      return navigate("/myprofile", {
        replace: true,
      });
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, authUserState.user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await loginUser(formData);

      if (data) {
        authUserDispatch({ type: LOGIN, payload: data });
        toast.success("Successfully Logged In");
        navigate("/myprofile", {
          replace: true,
        });
      }
    } catch (error) {
      if (error.response.status === 302) {
        navigate(`/resetPassword?email=${formData.email}`, {
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
    setFormData({ ...formData, [name]: value });
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
              required={true}
            />
            <LabelInput
              label="Password"
              type="password"
              placeholder="Enter password"
              controlId="password"
              name="password"
              onChange={handleChange}
              required={true}
            />

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

export default Login;
