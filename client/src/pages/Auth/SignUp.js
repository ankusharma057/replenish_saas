import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { createEmployee, loginUser } from "../../Server";
import { useAuthContext } from "../../context/AuthUserContext";
import { LOGIN } from "../../Constants/AuthConstants";

const formInitialState = {
  name: "",
  email: "",
  vendor_name: "",
  password: "",
  gfe: false,
  service_percentage: 50,
  retail_percentage: 0,
  is_inv_manager: false,
  is_admin: false,
};

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(formInitialState);
  const { authUserState, authUserDispatch } = useAuthContext();
  const navigate = useNavigate();
  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const newUser = await createEmployee(formData);
      setFormData(formInitialState);
        navigate("/", {replace: true,});
    } catch (error) {
      if(Array.isArray(error.response.data.error)){
        for(let i=0;i<error.response.data.error.length;i++){
          toast.error(error.response.data.error[i])
        }
      }
      if(error.response.data.error){
        toast.error(error.response.data.error)
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white shadow-lg rounded-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an account
          </h2>

          <Form onSubmit={onSubmit} className="space-y-6">
            <LabelInput
              label="Name"
              controlId="name"
              placeholder="Enter Name"
              required={true}
              labelClassName="font-medium text-gray-800"
              type="text"
              name="name"
              onChange={handleChange}
            />

            <LabelInput
              label="Vendor Name"
              controlId="vendor_name"
              placeholder="Enter Vendor Name"
              required={true}
              labelClassName="font-medium text-gray-800"
              type="text"
              name="vendor_name"
              onChange={handleChange}
            />

            <LabelInput
              label="Email"
              controlId="email"
              placeholder="Enter Email"
              required={true}
              labelClassName="font-medium text-gray-800"
              type="email"
              name="email"
              onChange={handleChange}
            />

            <LabelInput
              label="Password"
              controlId="password"
              placeholder="*******"
              required={true}
              labelClassName="font-medium text-gray-800"
              onChange={handleChange}
              type="password"
              name="password"
            />

            <Loadingbutton
              isLoading={loading}
              title="Sign up"
              loadingText="Creating User..."
              type="submit"
              className="bg-blue-500 w-full hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            />
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-cyan-500 hover:text-blue-800 font-medium"
              >
                Already have an account? Sign In
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
