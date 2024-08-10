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
  const { authUserState } = useAuthContext();


  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if(formData.name && formData.email){
        await createClient(formData);
        toast.success("client created successfully");
        e.target.reset();
      }
      getEmployees()
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
            label="Email"
            controlId="email"
            placeholder={`Enter Email`}
            required={true}
            labelClassName="font-medium text-cyan-800"
            type="email"
            name="email"
            onChange={handleChange}
          />
          <div></div>

          <Loadingbutton
            isLoading={loading}
            title="Create Client "
            loadingText={"Creating Client..."}
            type="submit"
            className="!bg-cyan-500 !border-cyan-500 w-full  hover:!bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          />
        </Form>
      </div>
    )
  );
}
