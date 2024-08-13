import React, { useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import { createClient, createEmployee, getEmployeesList, loginUser } from "../../Server";
import { useAuthContext } from "../../context/AuthUserContext";


const formInitialState = {
  name: "",
  email: "",
};

export default function CreateClientCard({ show, onHide,  getEmployees }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(formInitialState);
  const [errorForm, setErrorsForm] = useState([]);
  const { authUserState } = useAuthContext();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await createClient(formData);

      if (response.status === 200) {
        getEmployees();
        if (response?.data?.error) {
          toast.error(response?.data?.error?.name || "Failed to create client");
          setErrorsForm(response?.data?.error || {})
        } else {
          setFormData({
            name: "",
            email: "",
            temp_password: "",
          });
          e.target.reset();
          setErrorsForm({});

          toast.success("Client Created Successfully");
        }
      }
    } catch (error) {
    console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  return (
    show && (
      <div className="hover:shadow-lg border-2 px-2 sm:px-10 py-5 border-black/15 m-auto transition-all flex flex-col bg-white rounded-lg shadow-md ">
        <h3 className=" text-3xl font-semibold my-3">Create an Client</h3>
        <Form
          onSubmit={onSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 items-center justify-center w-full md:max-w -7xl gap-1"
        >

          <Form.Group controlId="formClientName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              placeholder={`Enter Name`}
              className="font-medium text-cyan-800 mb-4"
              type="text"
              name="name"
              onChange={handleChange}
              required
            />
            <span className="text-red-400 text-sm">
              {errorForm.name && errorForm.name[0]}
            </span>
          </Form.Group>

          <Form.Group controlId="formClientEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              placeholder={`Enter Email`}
              className="font-medium text-cyan-800 mb-4"
              type="text"
              name="email"
              onChange={handleChange}
              required
            />
            <span className="text-red-400 text-sm">
              {errorForm.email && errorForm.email[0]}
            </span>
          </Form.Group>

          <Form.Group controlId="formClientPassword">
            <Form.Label>Temp Password</Form.Label>
            <Form.Control
              placeholder={`Enter Temp Password`}
              className="font-medium text-cyan-800 mb-4" 
              type="password"
              name="temp_password"
              onChange={handleChange}
              required
            />
            <span className="text-red-400 text-sm">
              {errorForm.temp_password && errorForm.temp_password[0]}
            </span>
          </Form.Group>

          <div></div>

          <Loadingbutton
            isLoading={loading}
            title="Create Client "
            loadingText={"Creating Client..."}
            type="submit"
            onClick={async (e) => {
              try {
                onSubmit(e);
              } catch (error) {
                console.log(error);
              }
            }}
            className="!bg-cyan-500 !border-cyan-500 w-full  hover:!bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </Form>
      </div>
    )
  );
}
