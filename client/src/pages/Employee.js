import React, { useEffect, useState } from "react";
// import EmployeeInvoiceCard from "../components/Cards/EmployeeInvoiceCard";
import {
  deleteEmployeeRoute,
  getLocationsWithoutEmployee,
  getEmployeesList,
  getMentorList,
  // getInvoiceList,
  sendResetPasswordLinkRoute,
  updateVendore,
  getQuestionnaires,
  getEmployeesOnly,
  getEmployeeInvoicesOnly,
  getEmployeeBankDetails,
} from "../Server";
import { useAuthContext } from "../context/AuthUserContext";
// import InventoryModal from "../components/Modals/InventoryModal";
// import InvoiceListModal from "../components/Modals/InvoiceListModal";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
// import { Form, Popover } from "react-bootstrap";
// import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ButtonGroup, ToggleButton, Button, Image, Row, Col, Form, Container } from "react-bootstrap";
import LineInput from "../components/Input/LineInput";
import InventoryTab from "../components/Tabs/InventoryTab";
import CustomModal from "../components/Modals/CustomModal";
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import CreateStaffCard from "../components/Cards/CreateStaffCard";
import InviteClientsTab from "../components/Tabs/InviteClientsTab";
import Select from "react-select";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import Questionnaires from "./Questionnaires";
import { Link, useNavigate } from "react-router-dom";
import { PiGridNineLight } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";

const intialTemplates = [
  {
    id:1,
    template_name:"fever"
  },
  {
    id:2,
    template_name:"fever"
  },
  {
    id:3,
    template_name:"fever"
  },
]

const Employee = () => {
  const { authUserState, isFillingForm, setIsFillingForm } = useAuthContext();
  // const [invoiceList, setInvoiceList] = useState([]);
  // const [invModalSHow, setInvModalSHow] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeInvoices, setEmployeeInvoices] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [currentTab, setCurrentTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [radioTabs, setRadioTabs] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState({});
  const [updateEmployeeInput, setUpdateEmployeeInput] = useState({});
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [mentorList, setMentorList] = useState([]);
  const [addedMentors, setAddedMentors] = useState([]);
  const [currSelectedMentor, setCurrSelectedMentor] = useState();
  const [serviceLocation, setServiceLocation] = useState([]);
  const [edittitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState("Questionnaires Form")
  const [questionnaireForms, setQuestionnaireForms]=useState()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState();
  const [duplicateQuestionnaire, setDuplicateQuestionnaire] = useState();
  const [formChanges,setFormChanges] = useState(false)
  const [bankDetails, setBankDetails] = useState();

  // Questionnaires
  const navigate = useNavigate();
  const [templateTabs,setTemplateTabs] = useState("templates list")
  const [templateLists,setTemplateLists] = useState(intialTemplates)
  //Questionnaires
  
  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesOnly(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
        handleSelect(data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getSelectedEmployeeBankDetails = async (employeeId) => {
    try {
        let response = await getEmployeeBankDetails({ employee_id: employeeId });
        setBankDetails(response.data.bank_accounts[0])
    } catch (error) {      
        // toast.error(error.response.data.error)
    }
}

  const getEmployeeInvoices = async (employeeId, refetch = false) => {
    try {
      const { data } = await getEmployeeInvoicesOnly(employeeId, true);
      if (data?.length > 0) {
        setEmployeeInvoices(data);
      }else{
        setEmployeeInvoices([]);
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const getMentors = async (refetch = false, employeeId) => {
    try {
      const { data } = await getMentorList(refetch, employeeId);
      if (data?.length > 0) {
        setMentorList(data);
        // handleSelect(data[0]);
      } else {
        setMentorList([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMentorChange = (currValue) => {
    setCurrSelectedMentor(currValue);
  };

  const handleAddMentor = () => {
    const isPresent = addedMentors.find(
      (obj) =>
        obj.id === currSelectedMentor.id && obj.name === currSelectedMentor.name
    );
    if (!isPresent) {
      setAddedMentors([...addedMentors, currSelectedMentor]);
      if (updateEmployeeInput.employee_mentors_attributes) {
        setUpdateEmployeeInput((pre) => ({
          ...pre,
          employee_mentors_attributes: [
            ...updateEmployeeInput.employee_mentors_attributes,
            {
              mentor_id: currSelectedMentor.id,
              mentor_percentage: parseInt(currSelectedMentor.mentor_percentage),
            },
          ],
        }));
      } else {
        setUpdateEmployeeInput((pre) => ({
          ...pre,
          employee_mentors_attributes: [
            {
              mentor_id: currSelectedMentor.id,
              mentor_percentage: parseInt(currSelectedMentor.mentor_percentage),
            },
          ],
        }));
      }
    } else {  
      toast.info("Mentor already added");
    }
  };

  const removeMentor = (currValue) => {
    let filteredArray = addedMentors.filter(
      (obj) => obj.id !== currValue.id || obj.name !== currValue.name
    );
    let filteredUpdatedArray =
      updateEmployeeInput.employee_mentors_attributes.filter(
        (obj) => obj.mentor_id !== currValue.id
      );
    setAddedMentors(filteredArray);
    setUpdateEmployeeInput((pre) => ({
      ...pre,
      employee_mentors_attributes: filteredUpdatedArray,
    }));
  };
  // const getInvoices = async () => {
  //   // eslint-disable-next-line no-unused-vars
  //   const { data } = await getInvoiceList();
  //   // setInvoiceList(data);
  // };

  const getAllEmployeeLocation = async (employeeId, refetch = false) => {
    const { data } = await getLocationsWithoutEmployee(employeeId, refetch);

    if (data?.length > 0) {
      setServiceLocation(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };

  useEffect(() => {
    getEmployees();
    // getInvoices();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentTab === "invoice") {
      getEmployeeInvoices(selectedEmployeeData.id);
    }
  }, [currentTab, selectedEmployeeData]);

  useEffect(() => {
    if (selectedEmployeeData?.id) {
      getAllEmployeeLocation(selectedEmployeeData.id);
      getAllQuestionnaires();
    }
  }, [selectedEmployeeData]);

    const getAllQuestionnaires = async (refetch = true) => {
      try {
        const response = await getQuestionnaires( refetch );
        if (response.status === 200) {
          setQuestionnaireForms(response.data)
        }
      } catch (error) {
        console.error('Error fetching intake forms:', error);
      }
    };

  useEffect(() => {
    if (isFillingForm) {
      const handleOnBeforeUnload = (event) => {
        event.preventDefault();
        return (event.returnValue = "");
      };
      window.addEventListener("beforeunload", handleOnBeforeUnload, {
        capture: true,
      });
      return () => {
        window.removeEventListener("beforeunload", handleOnBeforeUnload);
      };
    }
  }, [isFillingForm]);

  // const openShowInventory = (invoice, employee) => {
  //   setEmployeeInvoices({
  //     invoices: invoice,
  //     employee: employee,
  //   });
  //   setInvModalSHow(true);
  // };

  // const openShowInvoice = (invoice, employee) => {
  //   setEmployeeInvoices({
  //     invoices: invoice,
  //     employee: employee,
  //   });
  //   setInvoiceModalShow(true);
  // };

  // const updatePopover = (
  //   <Popover id="popover-basic">
  //     <Popover.Header as="h3">Update Employee</Popover.Header>
  //     <Popover.Body>
  //       <Form onSubmit={updateEmployee} className="mb-3">
  //         <LabelInput
  //           label="Name"
  //           type="text"
  //           defaultValue={updateInvoiceInput.name}
  //           controlId="name"
  //           name="name"
  //           placeholder="Enter Name"
  //           onChange={handleUpdateChange}
  //           required={true}
  //         />
  //         {authUserState.user?.is_admin === true && (
  //           <>
  //             <LabelInput
  //               label="Vendor Name"
  //               type="text"
  //               defaultValue={updateInvoiceInput.vendor_name}
  //               controlId="vendor_name"
  //               name="vendor_name"
  //               placeholder="Enter Vendor Name"
  //               onChange={handleUpdateChange}
  //               required={true}
  //             />
  //           </>
  //         )}

  //         <LabelInput
  //           label="Email"
  //           type="text"
  //           value={updateInvoiceInput.email}
  //           controlId="email"
  //           name="email"
  //           disabled
  //           readOnly
  //         />
  //         <Form.Check
  //           className="my-2"
  //           name="gfe"
  //           type={"checkbox"}
  //           id={`default-checkbox`}
  //           label={`GFE`}
  //           checked={updateInvoiceInput.gfe}
  //           onChange={handleUpdateChange}
  //         />

  //         <LabelInput
  //           label="Service Percentage"
  //           type="number"
  //           defaultValue={updateInvoiceInput.service_percentage}
  //           controlId="service_percentage"
  //           onChange={handleUpdateChange}
  //           name="service_percentage"
  //         />

  //         <LabelInput
  //           label="Retail Percentage"
  //           controlId="service_percentage"
  //           type="number"
  //           name="retail_percentage"
  //           defaultValue={updateInvoiceInput.retail_percentage}
  //           onChange={handleUpdateChange}
  //         />

  //         <Loadingbutton
  //           isLoading={loading}
  //           title="Submit"
  //           loadingText={"Updating Employee..."}
  //           type="submit"
  //         />
  //       </Form>
  //     </Popover.Body>
  //   </Popover>
  // );

  const deleteEmployee = () => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to delete ${selectedEmployeeData?.name}, you won't be able to revert this change.`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              await deleteEmployeeRoute(selectedEmployeeData.id);
              toast.success("Employee has been deleted successfully.");
              await getEmployees(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to delete the Employee"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  // const sortedEmployeeList = employeeList?.sort((a, b) =>
  //   a?.name?.localeCompare(b?.name)
  // );

  const filteredEmployeeList = employeeList?.filter((employee) =>
    employee?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleSelect = (emp) => {
    getMentors(false, emp.id);
    setSelectedEmployeeData(emp);
    setAddedMentors([]);
    setCurrSelectedMentor(null);
    setRadioTabs([]);
    setUpdateEmployeeInput({});
    setCurrentTab("profile");
    getSelectedEmployeeBankDetails(emp.id);
    getEmployeeInvoices(selectedEmployeeData.id);
    let addTabs = [
      { name: "Profile", value: "profile" },
      {
        name: "Invoices",
        value: "invoice",
        // data: getRequestInventoryData,
      },
      { name: "Bank Details", value: "bankDetails" },
     
    ];
    if (emp) {
      addTabs.splice(1, 0, {
        name: "Inventories",
        value: "inventory",
        data: getEmployees,
      });
    }

    if (!emp.is_admin) {
      addTabs.push({ name: "Settings", value: "settings" });
    }

    addTabs.push({ 
      name: "Templates", 
      value: "templates"})

    setRadioTabs(addTabs);
  };

  const EmployeeItem = ({ index, style }) => {
    const employee = filteredEmployeeList[index];
    return (
      employee && (
        <div
          style={style}
          onClick={() => {
            selectedEmployeeData?.id !== employee.id && handleSelect(employee);
            if (window.innerWidth < 1024) {
              collapse();
            }
          }}
          className={`d-flex justify-content-start align-items-center gap-[3px] p-2 border-b transition-all hover:bg-gray-200 rounded-md duration-700 ${
            selectedEmployeeData?.id === employee.id
              ? "pointer-events-none bg-gray-200 "
              : "cursor-pointer "
          } `}
        >
          {employee.profile_photo_url?
            <Image
              roundedCircle
              src={employee?.profile_photo_url}
              style={{width:"35px",height:"35px"}}
              />:
              <div className="w-[35px] h-[35px] rounded-circle d-flex justify-content-center align-items-center border bg-white">
                <p className="mb-0 fs-6 d-flex justify-content-center align-items-center">{getInitials(employee?.name)}</p>
              </div>
            }
          {employee.name?.length>18? employee.name?.slice(0,18)+"...":employee.name}
        </div>
      )
    );
  };

  const sendResetPasswordLink = () => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to send the reset password mail to ${selectedEmployeeData?.name}`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await sendResetPasswordLinkRoute(selectedEmployeeData);
              toast.success("Send reset password main successfully delivered");
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Some Error Occur"
              );
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    // const updatedData = {
    //   email: updateInvoiceInput.email,
    //   gfe: updateInvoiceInput.gfe,
    //   name: updateInvoiceInput.name,
    //   retail_percentage: updateInvoiceInput.retail_percentage,
    //   service_percentage: updateInvoiceInput.service_percentage,
    //   vendor_name: updateInvoiceInput.vendor_name,
    // };
    try {
      setLoading(true);
      const { data } = await updateVendore(
        selectedEmployeeData.id,
        updateEmployeeInput
      );

      toast.success("Employee has been updated successfully.");
      await getEmployees(true);
      // setUpdateInvoiceInput(data);
      setSelectedEmployeeData(data);
      handleSelect(data)
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message ||
          "Failed to update Employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (e) => {
    setIsFillingForm(true);
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setUpdateEmployeeInput((pre) => ({
      ...pre,
      [name]: inputValue,
    }));
  };

  const updateMentor = async (mentorDetails, newMentorPercentage) => {
    confirmAlert({
      title: "Update",
      message: `Are you sure, you want to update mentor percentage?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const updateMentorDetails = {
                employee_mentors_attributes: [
                  {
                    id: mentorDetails.id,
                    mentor_percentage: newMentorPercentage,
                  },
                ],
              };
              const { data } = await updateVendore(
                selectedEmployeeData.id,
                updateMentorDetails
              );

              toast.success("Mentor details updated successfully.");
              await getEmployees(true);
              // setUpdateInvoiceInput(data);
              setSelectedEmployeeData(data);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to update Employee"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const deleteMentor = async (mentorDetails) => {
    confirmAlert({
      title: "Remove",
      message: `Are you sure, you want to remove ${String(
        mentorDetails.mentor.name
      )} from your mentor list`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const deleteMentorDetails = {
                employee_mentors_attributes: [
                  { id: mentorDetails.id, _destroy: 1 },
                ],
              };
              const { data } = await updateVendore(
                selectedEmployeeData.id,
                deleteMentorDetails
              );

              toast.success("Mentor removed successfully.");
              await getEmployees(true);
              // setUpdateInvoiceInput(data);
              setSelectedEmployeeData(data);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to update Employee"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const removeLocation = async (locationDetails) => {
    confirmAlert({
      title: "Remove Location",
      message: `Are you sure, you want to remove ${String(
        locationDetails.location.name
      )} from your list`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const deleteLocationDetails = {
                employee_locations_attributes: [
                  { id: locationDetails.id, _destroy: 1 },
                ],
              };
              const { data } = await updateVendore(
                selectedEmployeeData.id,
                deleteLocationDetails
              );

              toast.success("Location removed successfully.");
              await getEmployees(true);
              // setUpdateInvoiceInput(data);
              setSelectedEmployeeData(data);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to update Employee"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  //qutionary template

  const handleSetTemplateTabs = () => {
    setTemplateTabs("templates list");
  };

  const handleFormChanges = () =>{
    setFormChanges(true)
  }

  const confirmToDiscard = () => {
    if(formChanges){
      confirmAlert({
        title: "Discard Changes",
        message: `Are you sure Delete ?`,
        buttons: [
          {
            label: "Yes",
            onClick: () => {
              setTemplateTabs("templates list");
            },
          },
          {
            label: "No",
          },
        ],
      });
    }
    else{
      setTemplateTabs("templates list");
    }
  }

  const addTitle = (title) =>{
setTitle(title)
  }
  function getInitials(str) {
    const words = str.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    } else if (words.length === 1) {
      return words[0][0];
    }
    return "";
  }

  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <div>
              <SearchInput
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white h-[68vh]">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                All Staff <ChevronDown />
              </h1>
              <div className="flex h-[57vh] flex-col pl-2 gap-4 overflow-y-auto" >
                {(employeeList || []).length > 0 && (
                  <List
                    height={window.innerHeight - 350}
                    itemCount={employeeList.length}
                    itemSize={45}
                    width={"100%"}
                  >
                    {EmployeeItem}
                  </List>
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                setShowCreateUserModal(true);
                setCurrentTab("staff");
              }}
              variant="info"
              className="w-full text-white"
            >
              + Add Employee
            </Button>
          </>
        }
      >
        <div className="flex-1" key={selectedEmployeeData?.name}>
          {selectedEmployeeData && (
            <div className=" p-2 sm:p-10">
              <h1 className="text-3xl mt-10  font-bold">
                {selectedEmployeeData?.name}
              </h1>
              <ButtonGroup className="w-full md:w-auto">
                {radioTabs.map((tab) => {
                  return (
                    <ToggleButton
                      variant="link"
                      key={tab.value}
                      id={tab.value}
                      type="radio"
                      className={` !border-none !no-underline !rounded-t-lg !text-cyan-500 ${
                        currentTab === tab.value ? "!bg-white pb-2" : "btn-link"
                      }`}
                      name="radio"
                      value={tab.value}
                      checked={currentTab === tab.value}
                      onChange={(e) => {
                        setCurrentTab(e.currentTarget.value);
                      }}
                    >
                      {tab.name}
                    </ToggleButton>
                  );
                })}
              </ButtonGroup>
              <div
                className={`sm:p-6 rounded-b-lg ${
                  currentTab === "staff" ? "" : currentTab === "templates"? "": "bg-white"
                } `}
              >
                {currentTab === "profile" && (
                  <form onSubmit={updateEmployee}>
                    <table>
                      <tbody>
                       { !selectedEmployeeData?.is_admin && <tr>
                          <th className="px-4">Name:</th>
                          <td>
                            <LineInput
                              type="text"
                              defaultValue={selectedEmployeeData.name}
                              controlId="name"
                              onChange={handleUpdateChange}
                              required={true}
                              name="name"
                              placeholder="Enter Name"
                            />
                          </td>
                        </tr>}
                        {!selectedEmployeeData?.is_admin && (
                          <tr>
                            <th className="px-4">Vendor Name:</th>
                            <td>
                              <LineInput
                                type="text"
                                defaultValue={selectedEmployeeData?.vendor_name}
                                onChange={handleUpdateChange}
                                required={true}
                                name="vendor_name"
                                placeholder="Enter Vendor Name"
                              />
                            </td>
                          </tr>
                        )}

                        {!selectedEmployeeData?.is_admin &&   <tr>
                          <th className="px-4">Email:</th>
                          <td>
                            <LineInput
                              type="text"
                              value={selectedEmployeeData.email}
                              controlId="email"
                              name="email"
                              disabled
                              readOnly
                            />
                          </td>
                        </tr>}

                        {!selectedEmployeeData?.is_admin && <tr>
                          <th className="px-4">GFE:</th>
                          <td>
                            <div className="flex items-center">
                              <input
                                defaultChecked={selectedEmployeeData?.gfe}
                                name="gfe"
                                type="checkbox"
                                onChange={handleUpdateChange}
                                className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </div>
                          </td>
                        </tr>}

                         <tr>
                          <th className="px-4">Mentor:</th>
                          <td>
                            <div className="flex items-center">
                              <input
                                defaultChecked={selectedEmployeeData?.is_mentor}
                                name="is_mentor"
                                type="checkbox"
                                onChange={handleUpdateChange}
                                className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </div>
                          </td>
                        </tr>

                        {authUserState?.user && <tr>
                          <th className="px-4">Inventory Manager:</th>
                          <td>
                            <div className="flex items-center">
                              <input
                                defaultChecked={selectedEmployeeData?.is_inv_manager}
                                name="is_inv_manager"
                                type="checkbox"
                                onChange={handleUpdateChange}
                                className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </div>
                          </td>
                        </tr>}
                        {authUserState?.user && <tr>
                          <th className="px-4">Stripe onboarding approved</th>
                          <td>
                            <div className="flex items-center">
                              <input
                                checked={selectedEmployeeData?.is_inv_manager}
                                name="is_inv_manager"
                                type="checkbox"
                                className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </div>
                          </td>
                        </tr>}

                        {!selectedEmployeeData?.is_admin &&  <tr>
                          <th className="px-4">Service Percentage:</th>
                          <td>
                            {/* CreateStaffCard{" "} */}
                            <div className="flex items-center">
                              <LineInput
                                type="number"
                                defaultValue={
                                  selectedEmployeeData?.service_percentage || 0
                                }
                                onChange={handleUpdateChange}
                                name="service_percentage"
                              />
                            </div>
                          </td>
                        </tr>}

                        {!selectedEmployeeData?.is_admin && <tr>
                          <th className="px-4">Retail Percentage</th>
                          <td>
                            <div className="flex items-center">
                              <LineInput
                                type="number"
                                defaultValue={
                                  selectedEmployeeData?.retail_percentage
                                }
                                onChange={handleUpdateChange}
                                name="retail_percentage"
                              />
                            </div>
                          </td>
                        </tr>}

                        {!selectedEmployeeData?.is_admin &&  <tr>
                          <th className="px-4">Wellness Percentage:</th>
                          <td>
                            <div className="flex items-center">
                              <LineInput
                                type="number"
                                defaultValue={
                                  selectedEmployeeData?.wellness_percentage || 0
                                }
                                onChange={handleUpdateChange}
                                name="wellness_percentage"
                              />
                            </div>
                          </td>
                        </tr>}

                        <tr>
                          <th className="px-4">Mentors</th>
                          <td>
                            <div className="flex items-center">
                              {/* <LineInput
                                type="number"
                                defaultValue={
                                  selectedEmployeeData?.retail_percentage
                                }
                                onChange={handleUpdateChange}
                                name="retail_percentage"
                              /> */}
                              <Select
                                className="w-full"
                                options={mentorList.filter((mentor) => mentor.id !== selectedEmployeeData.id )}
                                getOptionLabel={(option) => option.name}
                                onChange={handleMentorChange}
                                // value={null}
                                placeholder="Select Mentor"
                              />
                              <div className="flex items-center">
                                <LineInput
                                  type="number"
                                  placeholder={"Mentor %"}
                                  onChange={(e) =>
                                    setCurrSelectedMentor({
                                      ...currSelectedMentor,
                                      mentor_percentage: e.target.value,
                                    })
                                  }
                                  name="mentor_percentage"
                                />
                              </div>
                              <div>
                                <button
                                  disabled={
                                    !currSelectedMentor?.mentor_percentage
                                  }
                                  type="button"
                                  className={`${
                                    !currSelectedMentor?.mentor_percentage
                                      ? "bg-gray-400"
                                      : "bg-cyan-400"
                                  } bg-cyan-400 rounded-md p-2 text-white mx-2 `}
                                  onClick={handleAddMentor}
                                >
                                  <FaPlus />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* <tr className="flex flex-col px-4">
                          {addedMentors.map((val, index) => {
                            return (
                              <td className="py-2" key={index}>
                                <div className="flex justify-between items-center font-medium rounded-md bg-cyan-400 px-2 text-white p-2">
                                  <div>{val.name}</div>
                                  <button
                                    type="button"
                                    onClick={() => removeMentor(val)}
                                    className="hover:text-red-500 text-white flex px-2 transition duration-500 hover:animate-pulse"
                                  >
                                    <RxCross2 className="w-6 h-6" />
                                  </button>
                                </div>
                              </td>
                            )
                          })}
                        </tr> */}
                      </tbody>
                    </table>

                    <div
                      className={`${
                        addedMentors.length === 0 && "hidden"
                      } relative overflow-x-auto shadow-md sm:rounded-lg m-4`}
                    >
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Mentor name
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Mentor Percentage
                            </th>
                            <th scope="col" className="px-6 py-3 w-14">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {addedMentors.map((val, index) => {
                            return (
                              <React.Fragment key={index}>
                                <tr className="odd:bg-white even:bg-gray-50 border-b ">
                                  <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
                                  >
                                    {val.name}
                                  </th>
                                  <td className="px-6 py-4">
                                    {val.mentor_percentage}%
                                  </td>
                                  <td className="px-6 py-4">
                                    <button
                                      type="button"
                                      onClick={() => removeMentor(val)}
                                      className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
                                    >
                                      <RxCross2 className="w-6 h-6" />
                                    </button>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div
                      className={`${
                        selectedEmployeeData?.employee_mentors?.length === 0 &&
                        "hidden"
                      } relative overflow-x-auto shadow-md sm:rounded-lg m-4`}
                    >
                      <div className="font-bold p-4">Current Mentors:</div>
                      <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                          <tr>
                            <th scope="col" className="px-6 py-3">
                              Mentor name
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Mentor Percentage
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEmployeeData?.employee_mentors?.map(
                            (val, index) => {
                              return (
                                <React.Fragment key={index}>
                                  <EmployeeTableRows
                                    deleteMentor={deleteMentor}
                                    updateMentorDetails={updateMentor}
                                    val={val}
                                  />
                                </React.Fragment>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>

                    {Object.keys(updateEmployeeInput).length > 0 && (
                      <div className=" w-full flex justify-end">
                        <Loadingbutton
                          isLoading={loading}
                          title="Update"
                          loadingText={"Updating Employee..."}
                          type="submit"
                        />
                      </div>
                    )}
                  </form>
                )}
                {currentTab === "inventory" && (
                  <InventoryTab
                    inventoryList={selectedEmployeeData}
                    getEmployees={getEmployees}
                    // employeeList={employeeList}
                    userProfile={authUserState.user}
                  />
                )}
                {currentTab === "invoice" && (
                  <div className="flex gap-4 flex-wrap">
                    {employeeInvoices?.length > 0 ? (
                      (employeeInvoices || [])?.map((invoice) => {
                        return (
                          <div
                            onClick={() => {
                              setSelectedInvoiceData(invoice);
                              setShowInvoiceModal(true);
                            }}
                            key={invoice.id}
                            className="p-2 border rounded-lg cursor-pointer min-w-[10rem] flex-1"
                          >
                            <p>
                              <span className="font-bold">Invoice Id: </span>
                              {invoice.id}
                            </p>
                            <p>
                              <span className="font-bold">Client Name: </span>
                              {invoice.client_name}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <h1 className="text-center w-full">No Invoices</h1>
                    )}
                  </div>
                )}
                {currentTab === "settings" && (
                  <div className="flex flex-col gap-y-4">
                    <div className="flex gap-4 items-center">
                      <span>Remove this Employee:</span>
                      <Loadingbutton
                        onClick={deleteEmployee}
                        variant="danger"
                        title={"Remove"}
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <span>Send password Reset Link:</span>
                      <Loadingbutton
                        onClick={sendResetPasswordLink}
                        title={"Send"}
                        className="!bg-cyan-400 !border-cyan-400 hover:!bg-cyan-500 focus:!bg-cyan-500"
                      />
                    </div>

                    <InviteClientsTab employee={selectedEmployeeData} />
                    <form onSubmit={updateEmployee}>
                      <div className="flex flex-1 relative mt-2">
                        <Select
                          className="flex-fill flex-grow-1"
                          inputId="product_type"
                          isMulti
                          onChange={(event) => {
                            const transformedLocations = event.map(
                              ({ id }) => ({ location_id: id })
                            );
                            setUpdateEmployeeInput((pre) => ({
                              ...pre,
                              employee_locations_attributes: [
                                ...transformedLocations,
                              ],
                            }));
                          }}
                          options={serviceLocation}
                          required
                          placeholder="Select Locations"
                        />
                      </div>
                      <div
                        className={`${
                          selectedEmployeeData.employee_locations.length ===
                            0 && "hidden"
                        } relative overflow-x-auto shadow-md sm:rounded-lg mt-4`}
                      >
                        <div className="font-bold p-4">Active Locations:</div>
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
                            <tr>
                              <th scope="col" className="px-6 py-3">
                                Location
                              </th>
                              <th scope="col" className="px-6 py-3 text-center">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedEmployeeData.employee_locations.map(
                              (val, index) => {
                                return (
                                  <React.Fragment key={index}>
                                    <EmployeeLocationTableRows
                                      removeLocation={removeLocation}
                                      val={val}
                                    />
                                  </React.Fragment>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                      {Object.keys(updateEmployeeInput).length > 0 && (
                        <div className=" w-full mt-4 flex justify-end">
                          <Loadingbutton
                            isLoading={loading}
                            title="Update"
                            loadingText={"Updating Employee..."}
                            type="submit"
                          />
                        </div>
                      )}
                    </form>
                  </div>
                )}
                {currentTab === "staff" && (
                  <CreateStaffCard
                    show={showCreateUserModal}
                    onHide={() => setShowCreateUserModal(false)}
                  />
                )}
                {currentTab === "templates" && (
                  <div className="flex justify-center">
                  <div className="bg-white rounded-md w-[65rem]">
                    {templateTabs === "templates list" && <div className=" p-4 pt-2">
                      <div className="bg-white rounded-lg">
                        <div className="flex justify-between items-center py-3">
                          <h2 className="text-gray-500">Template List</h2>
                          <div><div onClick={() => {setTemplateTabs("create new template"); setSelectedQuestionnaire(); setDuplicateQuestionnaire();setFormChanges(false)}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Create New Template</div></div>
                        </div>
                        <div className=" flex flex-col gap-1 border p-3 rounded-lg ">
                          {Array.isArray(questionnaireForms) && questionnaireForms.map((template, i) => (
                            <div key={i} className={`grid grid-cols-[auto,1fr,160px] gap-4  p-[8px] border-b `}>
                              <div className="self-start pt-1">
                                <div className="rounded-[50%] bg-slate-200 h-[45px] w-[45px] flex justify-center items-center">
                                  {i + 1}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <div>
                                  <div className="text-[21px]">{template?.name}</div>
                                </div>
                              </div>
                              <div className="self-center grid grid-cols-[1fr,50px] gap-1 pt-1 text-[15px]">
                                <Link className="text-black" to="#"><button className="bg-white border border-gray-900 px-2 py-1  rounded-md" onClick={() => {setTemplateTabs("create new template"); setDuplicateQuestionnaire(template?.id); setSelectedQuestionnaire();setFormChanges(false)}}>Duplicate</button></Link>
                                {((authUserState?.user?.is_admin) === true || (authUserState?.user?.id === template?.employee?.id)) && (
                                <button className="bg-[#22d3ee] px-2 py-1 text-white  rounded-md" onClick={() => {setTemplateTabs("create new template"); setSelectedQuestionnaire(template?.id); setDuplicateQuestionnaire();setFormChanges(false)}}>Edit</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>}
                    {templateTabs === "create new template" &&
                      <div className="p-3 flex flex-col gap-2">
                        <div className="text-gray-500 flex justify-between">
                          <div>
                            <div className={`flex gap-3 items-center ${edittitle ? "hidden": "block"}`}>
                              <h2>{title}</h2>
                              <div onClick={()=>{setEditTitle(true)}}><FaRegEdit /></div>
                            </div>
                            <div  className={`flex gap-3 items-center ${!edittitle ? "hidden": "block"}`}>
                              <input type="text" value={title} onBlur={()=>{setEditTitle(false)}} onChange={(e)=>{setTitle(e?.target?.value)}} placeholder="Title " className="text-[30px] focus:outline-none border-b" />
                            </div>

                          </div>
                          <div className="flex items-center">
                            <div className="flex gap-2">
                              <div onClick={() => {confirmToDiscard();}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Return to Questionnaires</div>
                            </div>
                          </div>
                        </div>
                        <div><Questionnaires  title={title} addTitle={addTitle} selectedEmployee={selectedEmployeeData} questionnaireId={selectedQuestionnaire} duplicateQuestionnaireId={duplicateQuestionnaire} setTemplateTabs={handleSetTemplateTabs} FormChanges={handleFormChanges} /></div>
                        {/* <div className="flex">
                          <div className="flex gap-3 bg-[#0dcaf0] text-white py-[6px] px-3 rounded-md">
                            <button type="button" className="flex gap-2 items-center">
                              <PiGridNineLight />
                            </button>
                            <button type="button" className=" flex gap-2 items-center">
                              Add Item
                            </button>
                          </div>
                        </div> */}
                      </div>}
                  </div>
                  </div>
                )}
                {currentTab === "bankDetails" && (
                  <>
                    <Container>
                      {!selectedEmployeeData?.stripe_account_id?<div className="d-flex justify-content-center align-items-center">
                      <h3>Employee is not onboarded on stripe</h3>
                      </div>:<Form>
                        <Row>
                          <Col xs={12} sm={12} md={6} lg={6}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                              <Form.Label>Bank Name</Form.Label>
                              <Form.Control type="text" disabled value={bankDetails?.bank_name} />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={12} md={6} lg={6}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                              <Form.Label>Bank Account ID</Form.Label>
                              <Form.Control type="text" disabled value={bankDetails?.bank_name} />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={12} md={6} lg={6}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                              <Form.Label>Routing Number</Form.Label>
                              <Form.Control type="text" disabled value={bankDetails?.routing_number} />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={12} md={6} lg={6}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                              <Form.Label>Status</Form.Label>
                              <Form.Control type="text" disabled value={bankDetails?.status} />
                            </Form.Group>
                          </Col>
                          <Col xs={12} sm={12} md={12} lg={12}>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                              <Form.Label>Account Number</Form.Label>
                              <Form.Control type="text" disabled value={"*******" + bankDetails?.last4} />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Form>}
                    </Container>
                  </>
                )}

              </div>
              <CustomModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                invoiceData={selectedInvoiceData}
              />
            </div>
          )}
        </div>
      </AsideLayout>
    </>
  );
};

export default Employee;

const EmployeeTableRows = ({ val, deleteMentor, updateMentorDetails }) => {
  const [newValue, setNewValue] = React.useState();
  return (
    <tr className="odd:bg-white even:bg-gray-50 border-b ">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap "
      >
        {val.mentor.name}
      </th>
      <td className="px-6 py-4">
        <input
          type="number"
          onChange={(e) => setNewValue(e.target.value)}
          max={100}
          maxLength={3}
          placeholder={val.mentor_percentage + "%"}
        />
      </td>
      <td className="px-6 py-4 w-14">
        <div className="flex justify-center">
          {newValue && (
            <button
              type="button"
              onClick={() => updateMentorDetails(val, newValue)}
              className="hover:text-green-500 items-center text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
            >
              Confirm
            </button>
          )}
          <button
            type="button"
            onClick={() => deleteMentor(val)}
            className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
          >
            <RxCross2 className="w-6 h-6" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const EmployeeLocationTableRows = ({ val, removeLocation }) => {
  return (
    <tr className="odd:bg-white even:bg-gray-50 border-b ">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap capitalize "
      >
        {val.location.name}
      </th>
      <td className="px-6 py-4 w-14">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => removeLocation(val)}
            className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
          >
            <RxCross2 className="w-6 h-6" />
          </button>
        </div>
      </td>
    </tr>
  );
};
