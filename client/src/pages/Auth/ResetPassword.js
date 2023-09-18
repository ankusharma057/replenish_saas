import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { getUpdatedUserProfile, resetPassword } from "../../Server";

function ResetPassword() {
  const resetPasswordState = {
    password: "",
    confirmPassword: "",
  };
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(resetPasswordState);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password === formData.confirmPassword) {
      try {
        setLoading(true);
        await resetPassword(formData);
        toast.success("Successfully Logged In with new password.");
        await getUpdatedUserProfile(true);
        setFormData(resetPasswordState);
        navigate("/myprofile");
      } catch (error) {
        toast.error(
          error.response?.data?.exception ||
            error.response.statusText ||
            error.message ||
            "Failed to create user"
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Passwords do not match, please try again.");
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
            Enter new password
          </h2>
          <Form onSubmit={handleSubmit} className="flex  flex-col gap-2">
            <LabelInput
              label="Password"
              controlId="password"
              placeholder={`Enter Password`}
              required={true}
              labelClassName="font-medium "
              value={formData.password}
              type="password"
              name="password"
              onChange={handleChange}
            />

            <LabelInput
              label="Confirm Password"
              controlId="password"
              placeholder={`Confirm new password`}
              required={true}
              value={formData.confirmPassword}
              labelClassName="font-medium "
              type="password"
              name="confirmPassword"
              onChange={handleChange}
            />

            <Loadingbutton
              isLoading={loading}
              title="Save Password and Login"
              loadingText={"Updating Password..."}
              type="submit"
              className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            />
          </Form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
