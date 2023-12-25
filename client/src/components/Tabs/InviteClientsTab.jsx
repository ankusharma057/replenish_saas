import React, { useState } from "react";
import LabelInput from "../Input/LabelInput";
import { toast } from "react-toastify";
import { inviteClient } from "../../Server";
import Loadingbutton from "../Buttons/Loadingbutton";
const InviteClientsTab = ({ employeeId }) => {
  const [clientInput, setClientInput] = useState({
    email: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (clientInput.email === "" || clientInput.name === "") {
        return toast.error("Please fill all the fields");
      } else if (!employeeId) {
        return toast.error("Please select an employee");
      }

      const { data } = await inviteClient({
        ...clientInput,
        employee_id: employeeId,
      });

      console.log(data);

      if (data) {
        toast.success(JSON.stringify(data));
        e.target?.reset();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message ||
          "Failed to update Employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const onChangeHandler = (e) => {
    setClientInput({ ...clientInput, [e.target.name]: e.target.value });
  };

  return (
    <div className="border p-2 flex">
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
        <span className="text-lg font-bold">Invite client:</span>
        <LabelInput
          label="Client Name"
          type="text"
          placeholder="Enter client name"
          required
          name="name"
          controlId="name"
          onChange={onChangeHandler}
        />

        <LabelInput
          label="Client Email"
          type="email"
          placeholder="Enter client email"
          required
          onChange={onChangeHandler}
          name="email"
          controlId="email"
        />

        <Loadingbutton
          isLoading={loading}
          title="Inviting"
          loadingText="Inviting..."
          type="submit"
        />
      </form>
    </div>
  );
};

export default InviteClientsTab;
