import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { createEmployee, getEmployeesList } from "../../Server";
import ModalWraper from "../../components/Modals/ModalWraper";

const formInitialState = {
  name: "",
  email: "",
  vendor_name: "",
  password: "",
  gfe: false,
  service_percentage: 0,
  retail_percentage: 0,
  is_inv_manager: false,
  is_admin: false,
};

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(formInitialState);

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await createEmployee(formData);
      toast.success("User created successfully");
      //   setFormData(formInitialState);
      getEmployeesList(true);
    } catch (error) {
      let errorString = "";
      Object.keys(error.response.data.error || {})?.forEach((key) => {
        errorString =
          errorString +
          " " +
          " " +
          key +
          " " +
          error.response.data.error[key][0] +
          " ";
      });

      toast.error(
        errorString ||
          error.response?.data?.exception ||
          error?.response?.statusText ||
          error.message ||
          "Failed to create user"
      );
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
    <>
      <ModalWraper>
        <h3 className="text-center text-3xl font-semibold my-3">
          Create an account
        </h3>
        <Form
          onSubmit={onSubmit}
          className="max-w-md mx-auto p-4 bg-blue-100 rounded-lg shadow-md flex flex-col gap-1"
        >
          <LabelInput
            label="Name"
            controlId="name"
            placeholder={`Enter Name`}
            required={true}
            labelClassName="font-medium text-blue-800"
            type="text"
            name="name"
            onChange={handleChange}
          />

          <LabelInput
            label=" Vendor Name"
            controlId="vendor_name"
            placeholder={`Vendor Name`}
            required={true}
            labelClassName="font-medium text-blue-800"
            type="text"
            name="vendor_name"
            //   value={formData.vendor_name}
            onChange={handleChange}
          />

          <LabelInput
            label="Email"
            controlId="email"
            placeholder={`Enter Email`}
            required={true}
            labelClassName="font-medium text-blue-800"
            type="email"
            name="email"
            onChange={handleChange}
          />

          <LabelInput
            label="Password"
            controlId="password"
            placeholder={`*******`}
            required={true}
            labelClassName="font-medium text-blue-800"
            onChange={handleChange}
            type="password"
            name="password"
          />

          <div className="mb-4">
            <label
              htmlFor="gfe"
              className="text-base me-3 font-medium text-blue-800"
            >
              GFE
            </label>
            <input
              id="gfe"
              type="checkbox"
              name="gfe"
              value={formData.gfe}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <LabelInput
            label="Service Percentage"
            controlId="service_percentage"
            placeholder={`Enter Service Percentage`}
            required={true}
            labelClassName="font-medium text-blue-800"
            onChange={handleChange}
            type="number"
            min="0"
            name="service_percentage"
          />

          <LabelInput
            label=" Retail Percentage"
            controlId="retail_percentage"
            placeholder={`Enter Retail Percentage`}
            required={true}
            labelClassName="font-medium text-blue-800"
            onChange={handleChange}
            type="number"
            name="retail_percentage"
            min="0"
          />

          <div className="mb-4">
            <label
              htmlFor="is_admin"
              className="text-base me-3 font-medium text-blue-800"
            >
              Admin
            </label>
            <input
              id="is_admin"
              type="checkbox"
              name="is_admin"
              value={formData.is_admin}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="is_inv_manager"
              className="text-base me-3 font-medium text-blue-800"
            >
              Inventory Manager
            </label>
            <input
              id="is_inv_manager"
              type="checkbox"
              name="is_inv_manager"
              value={formData.is_inv_manager}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Loadingbutton
            isLoading={loading}
            title="Sign up"
            loadingText={"Creating User..."}
            type="submit"
            className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </Form>
      </ModalWraper>
    </>
  );
}
