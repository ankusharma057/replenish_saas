import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
// import LabelInput from "../Input/LabelInput";
import { toast } from "react-toastify";
// import { inviteClient } from "../../Server";
// import Loadingbutton from "../Buttons/Loadingbutton";
const InviteClientsTab = ({ employee }) => {
  const [isCopy, setIsCopy] = useState(false);
  // const [clientInput, setClientInput] = useState({
  //   email: "",
  //   name: "",
  // });

  // const [url, setUrl] = useState("");

  // const [loading, setLoading] = useState(false);
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     if (clientInput.email === "" || clientInput.name === "") {
  //       return toast.error("Please fill all the fields");
  //     } else if (!employee) {
  //       return toast.error("Please select an employee");
  //     }

  //     const { data } = await inviteClient({
  //       ...clientInput,
  //       employee_id: employee.id,
  //       reference_number: employee.reference_number,
  //     });

  //     const url = `${window.location.origin}/clients/signup?ref=${employee.reference_number}`;
  //     setUrl(url);
  //     if (data) {
  //       toast.success("Client invited successfully");
  //       await navigator.clipboard.writeText(url);
  //       e.target?.reset();
  //     }
  //   } catch (error) {
  //     toast.error(
  //       error?.response?.data?.exception ||
  //         error.response.statusText ||
  //         error.message ||
  //         "Failed to update Employee"
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onChangeHandler = (e) => {
  //   setClientInput({ ...clientInput, [e.target.name]: e.target.value });
  // };

  const refLink = `${window.location.origin}/clients/signup?ref=${employee?.reference_number}`;
  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setIsCopy(true);
    setTimeout(() => {
      setIsCopy(false);
    }, 3000);
  };

  return (
    <div className="border p-2 rounded-lg flex flex-col">
      {/* {url && (
          <div>
            <span className="text-lg font-bold">Recent invitation url: </span>
            <span
              onClick={() => {
                navigator.clipboard.writeText(url);
                toast.success("Copied to clipboard");
              }}
            >
              {url}
            </span>
          </div>
        )} */}
      {/* <form onSubmit={handleSubmit} className="flex flex-col gap-y-2">
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
      </form> */}
      <p className="flex text-lg font-semibold justify-between">
        <span>Referral Link</span>
        {isCopy ? (
          <CopyCheck className="cursor-pointer text-blue-500" />
        ) : (
          <Copy
            className="cursor-pointer "
            onClick={() => handleCopy(refLink)}
          />
        )}
      </p>
      {refLink}
    </div>
  );
};

export default InviteClientsTab;
