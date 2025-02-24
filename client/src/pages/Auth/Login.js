import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import { loginUser, stripeOnboardComplete } from "../../Server";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { useAuthContext } from "../../context/AuthUserContext";
import { LOGIN, LOGOUT } from "../../Constants/AuthConstants";
import "./Login.css";
import logo from '../../Assets/2replenishmdlogobrown.png';


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
  const { employee_id, stripe_account_id } = useParams();
    useEffect(() => {
      if(employee_id && stripe_account_id){
        completeOnboard();
      }
    }, [location]);
    const completeOnboard = async () => {
        try {
            let payload = {
                employee_id,
                stripe_account_id,
            };
            let response = await stripeOnboardComplete(payload);
            if (response.status === 200 && response.data.employee) {
                toast.success(response.data.message+". Please Login To Continue");
                sessionStorage.removeItem("user");
                authUserDispatch({ type: LOGOUT });
            }
        } catch (error) {
            toast.error(error?.response?.data?.error);
        }
    };
  useEffect(() => {
    if (authUserState.user && location.pathname === "/") {
      return navigate("/schedule", {
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
        navigate("/schedule", {
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
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="signinpage-container">
      <div className="signinpage-signinpage">
        <img
          src={logo}
          className="signinpage-image2replenishmdlogobrown3"
        />
        <div className="signinpage-content-container">
          <span className="signinpage-text1">Sign In To Tribeawl</span>
          <span className="signinpage-text2">Forgot Password ?</span>

          <Form onSubmit={handleSubmit}>
            <div className="signinpage-frame2891">
              <div className="signinpage-textfield3"></div>
            </div>
            <div className="signinpage-frame2892">
              <div className="signinpage-textfield4">
                <div className="signinpage-textfield5">
                  {/* Replaced LabelInput with regular input */}
                  <input
                    type="email"
                    placeholder="Enter your email"
                    controlId="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="signinpage-text5"
                  />
                </div>
              </div>
            </div>

            <div className="signinpage-password-field-container">
              <div className="signinpage-textfield1">
                <div className="signinpage-textfield2">
                  <div className="signinpage-password-field-label">
                    {/* Replaced LabelInput with regular input */}
                    <input
                      type="password"
                      placeholder="Enter password"
                      controlId="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="signinpage-text3"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="signinpage-button">
              <div className="signinpage-button-text-container">
              {/* <Loadingbutton
                isLoading={isLoading}
                loadingText="Login..."
                title="Login"
                type="submit"
              /> */}
                <button
                  type="submit"
                  className="signinpage-text4"
                  // onClick={() => navigate('/signup')}
                >
                  Continue
                </button>
              </div>
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Login;
