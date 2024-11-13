import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { createEmployee, getEmployeesList } from "../../Server";
import {Image} from "lucide-react";
const formInitialState = {
  name: "",
  email: "",
  vendor_name: "",
  password: "test123",
  gfe: false,
  service_percentage: 0,
  retail_percentage: 0,
  is_inv_manager: false,
  is_admin: false,
};

export default function CreateStaffCard({ show, onHide }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(formInitialState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      formData={
        ...formData,
        profile_photo:selectedFiles
      }
      await createEmployee(formData);
      toast.success("User created successfully");
      //   setFormData(formInitialState);
      getEmployeesList(true);
      e.target.reset();
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
          error?.response?.data?.exception ||
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
  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(files);
  };
  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const handleFileSelect = (event) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
  };

  return (
    show && (
      <div className="h-[68vh] overflow-scroll hover:shadow-lg border-2 px-2 sm:px-10 py-5 border-black/15 m-auto transition-all flex flex-col bg-white rounded-lg shadow-md ">
        <h3 className=" text-3xl font-semibold my-3">Create an employee</h3>
        <Form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-center w-full md:max-w -7xl gap-1"
        >
          <LabelInput
            label="Name"
            controlId="name"
            placeholder={`Enter Name`}
            required={true}
            labelClassName="font-medium text-cyan-800"
            type="text"
            name="name"
            onChange={handleChange}
          />

          <LabelInput
            label=" Vendor Name"
            controlId="vendor_name"
            placeholder={`Vendor Name`}
            required={true}
            labelClassName="font-medium text-cyan-800"
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
            labelClassName="font-medium text-cyan-800"
            type="email"
            name="email"
            onChange={handleChange}
          />

          {/* <LabelInput
            label="Password"
            controlId="password"
            placeholder={`*******`}
            required={true}
            labelClassName="font-medium text-cyan-800"
            onChange={handleChange}
            type="password"
            name="password"
          /> */}

          <LabelInput
            label="Service Percentage"
            controlId="service_percentage"
            placeholder={`Enter Service Percentage`}
            required={true}
            labelClassName="font-medium text-cyan-800"
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
            labelClassName="font-medium text-cyan-800"
            onChange={handleChange}
            type="number"
            name="retail_percentage"
            min="0"
          />

          <div className="mb-4">
            <label
              htmlFor="gfe"
              className="text-base me-3 font-medium text-cyan-800"
            >
              GFE
            </label>
            <input
              id="gfe"
              type="checkbox"
              name="gfe"
              value={formData.gfe}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="is_admin"
              className="text-base me-3 font-medium text-cyan-800"
            >
              Admin
            </label>
            <input
              id="is_admin"
              type="checkbox"
              name="is_admin"
              value={formData.is_admin}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className=" ">
            <label
              htmlFor="is_inv_manager"
              className="text-base me-3 font-medium text-cyan-800"
            >
              Inventory Manager
            </label>
            <input
              id="is_inv_manager"
              type="checkbox"
              name="is_inv_manager"
              value={formData.is_inv_manager}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          <div className=" col-span-3 mb-4 ">
            <label
              htmlFor="is_mentor"
              className="text-base me-3 font-medium text-cyan-800"
            >
              Mentor
            </label>
            <input
              id="is_mentor"
              type="checkbox"
              name="is_mentor"
              value={formData.is_mentor}
              onChange={handleChange}
              className="p-2 mt-1 border-gray-300 rounded-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div>
            <div>
              <div>
              <label
              htmlFor="is_mentor"
              className="text-base me-3 font-medium text-cyan-800 mb-2"
            >
              Profile Photo
            </label>
              </div>
              <div
                className="dotted-border border-secondary d-flex justify-content-center align-items-center flex-column rounded w-[120px] p-2 h-[120px]"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ textAlign: "center", cursor: "pointer", borderStyle: "dashed", border: "1px dashed" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-arrow-up"><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></svg>
                <span>Drag & Drop to upload</span>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  className="d-none"
                  onChange={handleFileSelect}
                />
              </div>
              <div>
                <label
                  htmlFor="fileUpload"
                  className="btn w-[150px] mt-1 btn-outline-secondary d-flex justif"
                >
                  <Image />Select Photo
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  className="d-none"
                  onChange={handleFileSelect}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <h6>Selected Files:</h6>
                  <ul className="list-group">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="list-group-item">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
              <div></div>
              <div></div>
          <Loadingbutton
            isLoading={loading}
            title="Sign up"
            loadingText={"Creating User..."}
            type="submit"
            className="mt-3 !bg-cyan-500 !border-cyan-500 w-full  hover:!bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </Form>
      </div>
    )
  );
}
