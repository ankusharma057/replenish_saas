import React, { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import SearchInput from "../Input/SearchInput";
import { toast } from "react-toastify";
import { getEmployeeServiceLocation } from "../../Server";
import { useEffect } from "react";

const InviteClientsTab = ({ employee }) => {
  const [searchLink, setSearchLink] = useState("");
  const [copiedLink, setCopiedLink] = useState(null);

  const [locations, setLocations] = useState([]);
  console.log(employee, "employee")
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
  //         error?.response?.statusText ||
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

  const handleCopy = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast("Copied to clipboard");
  };

  const getLocation = async () => {
    try {
      console.log(employee, "employee")
      const data  = await getEmployeeServiceLocation({employee_id: employee.id});
      console.log(data);
      if (data && data.data.length > 0) {
        setLocations(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLocation();

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      <p className="flex flex-wrap gap-x-4 items-center text-lg font-semibold ">
        <span>Referral Link</span>
        <div className="">
          <SearchInput
            placeholder="Search places.."
            onChange={(e) => setSearchLink(e.target.value)}
          />
        </div>
        {/* {isCopy ? (
          <CopyCheck className="cursor-pointer text-blue-500" />
        ) : (
          <Copy
            className="cursor-pointer "
            onClick={() => handleCopy(refLink)}
          />
        )} */}
      </p>

      {locations?.length > 0
        ? locations
            ?.filter((lo) => lo?.name?.includes(searchLink))
            ?.map((loc) => {
              console.log(loc?.name, "loc name", loc?.id, "loc id", employee?.id, "emp id")
              // const link = `${window.location.origin}/clients/signup?empId=${employee?.id}&&location=${loc?.name}`;
              const link = `${window.location.origin}/clients/location?locations=${loc?.name}&locId=${loc?.id}&empId=${employee?.id}&ref=${employee?.reference_number}`;

              return (
                <p
                  className={`cursor-copy flex justify-between px-[1rem] md:px-20 lg-px-40 ${
                    copiedLink === link ? "" : ""
                  }`}
                  onClick={() => handleCopy(link)}
                >
                  <span><button>Admin Location</button></span>
                  <span>
                    {copiedLink === link ? (
                      <CopyCheck className="cursor-pointer text-blue-500" />
                    ) : (
                      <Copy className="cursor-pointer " />
                    )}
                  </span>
                </p>
              );
            })
        : "No Referral link found"}
    </div>
  );
};

export default InviteClientsTab;
