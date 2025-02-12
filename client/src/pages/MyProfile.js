import React, { useEffect, useState } from "react";
import { Badge, Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import CustomModal from "../components/Modals/CustomModal";
import Table from "react-bootstrap/Table";
import AssignModal from "../components/Modals/AssignModal";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert"; // Import
import ModalWraper from "../components/Modals/ModalWraper";
import { useAuthContext } from "../context/AuthUserContext";
import DataFilterService from "../services/DataFilterService";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  RotateCw,
  ArrowRightLeft,
  FileText,
  Settings,
  Edit,
  GitPullRequestArrow,
  ChevronRight,
  ChevronLeft,
  Receipt,
  CalendarCheck,
  Landmark,
} from "lucide-react";
import { ImProfile } from "react-icons/im";
import Treatment from "./Treatment";

import {
  acceptInventory,
  assignInventory,
  getEmployeesList,
  getInventoryList,
  getUpdatedUserProfile,
  rejectInventory,
  requestInventory,
  updateVendore,
  getQuestionnaires,
  deleteInvoice,
  payMultipleInvoices,
  getFinalizeInvoiceList,
  getMentorFinalizeInvoiceList,
  getAllInvoicesList,
  getEmployeeInvoices,
} from "../Server";
import { LOGIN } from "../Constants/AuthConstants";
import AsideLayout from "../components/Layouts/AsideLayout";
import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import Select from "react-select";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import InviteClientsTab from "../components/Tabs/InviteClientsTab";
import MySchedule from "./MySchedule";
import Questionnaires from "./Questionnaires";
import { RiQuestionnaireLine } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import Mentorship from "./Mentorship";
import MPInvoice from "./MPInvoice";
import PlanSubscription from "./PlanSubscription";
import BankDetails from "./BankDetails";
import InvoicesToPay from "./InvoicesToPay";
import { Pagination } from "@mui/material";
import moment from "moment";


const MyProfile = () => {
  const { authUserState, authUserDispatch } = useAuthContext();
  const [userProfileData, setUserProfileData] = useState(authUserState.user);
  const [loading, setLoading] = useState(false);
  const { collapse } = useAsideLayoutContext();
  const [modalShow, setModalShow] = useState(false);
  const [currentTab, setCurrentTab] = useState("subscription");
  const [invoiceData, setinvoiceData] = useState(null);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assigninventory_object, setAssigninventory_object] = useState({});
  const [vendorUpdateModalShow, setVendorUpdateModalShow] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });
  const [edittitle, setEditTitle] = useState(false);
  const [title, setTitle] = useState("Questionnaires Form");
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 30; // Calculate the index range for the current page
  const startIndex = (currentPage - 1) * itemPerPage;
  const endIndex = startIndex + itemPerPage;

  const [inventoryList, setInventoryList] = useState([]);
  const [updateVendorInput, setupdateVendorInput] = useState(
    authUserState.user?.vendor_name
  );
  const [showRequestInvetory, setshowRequestInvetory] = useState(false);
  const [filteredInventoryList, setFilteredInventoryList] = useState([]);
  const [templateTabs,setTemplateTabs] = useState("templates list")
  const[questionnaireForms, setQuestionnaireForms]=useState()
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState();
  const [duplicateQuestionnaire, setDuplicateQuestionnaire] = useState();
  const [formChanges,setFormChanges] = useState(false)
  const [invoices, setInvoices] = useState();
  const [multipleInvoiceSelectionId,setMultipleInvoiceSelectionId]=useState([])
  const [multipleInvoiceSelectionData,setMultipleInvoiceSelectionData]=useState([])
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const navigate=useNavigate()
  const [topTab,setTopTab]=useState(1)
  // added
  const getInventory = async (refetch = false) => {
    try {
      const { data } = await getInventoryList(refetch);
      const filterInventoryList = DataFilterService.specialInvManeger(
        data,
        authUserState.user?.has_access_only_to,
        authUserState.user?.is_admin
      );
      // setFilteredInventoryList(filterInventoryList);
      setFilteredInventoryList(() => {
        return (
          filterInventoryList?.length > 0 &&
          filterInventoryList?.map((inventory) => {
            return {
              value: inventory?.id,
              label: inventory?.product?.name,
            };
          })
        );
      });

      setInventoryList(data);
    } catch (error) {
      console.log(error);
      // handle error
    }
  };
  let location =useLocation();
  useEffect(() => {
    const fetchData = async (refetch = true) => {
      try {
        const response = await getQuestionnaires( refetch );
        if (response.status === 200) {
          setQuestionnaireForms(response.data)
        }
      } catch (error) {
        console.error('Error fetching intake forms:', error);
      }
    };
    fetchData();
    getAllInvoices(1);
  }, [templateTabs,location]);

  // added
  const getEmployees = async () => {
    try {
      const { data } = await getEmployeesList(true);
      if (data) {
        authUserDispatch({ type: LOGIN, payload:  (data.filter((employee) => employee?.id === authUserState.user?.id))[0] });
        setEmployeeList(
          data.filter((employee) => employee?.id !== authUserState.user?.id)
        );
      }

      return;
    } catch (error) {
      console.log(error);
    }
  };

  const [requestInvetoryInput, setRequestInvetoryInput] = useState({
    quantity_asked: 0,
    product_name: "",
    date_of_use: "",
  });

  function handleClick(invoice) {
    setModalShow((prevModalShow) => !prevModalShow);
  }

  const hideUpdateVendorModal = () => {
    setVendorUpdateModalShow(!vendorUpdateModalShow);
  };

  const assignSubmit = (e) => {
    e.preventDefault();
    const inventory_object = {
      ...assignInput,
      employee_id: assigninventory_object?.employee?.id,
      product_id: assigninventory_object?.product?.id,
    };
    setShowAssignMadal(false);
    setLoading(true);
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure to assign this inventory`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await assignInventory(inventory_object);
              toast.success(
                "Sent a prompt for the employee to be accepted or rejected."
              );

              const { data: useData } = await getUpdatedUserProfile(true);
              authUserDispatch({ type: LOGIN, payload: useData });
              await getInventory(true);
              await getEmployeesList(true);
            } catch (error) {
              console.log(error);
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to Transfer the inventory"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            console.log("Click No");
            setShowAssignMadal(true);
          },
        },
      ],
    });
  };

  const acceptSubmit = async (data) => {
    const inventory_object = {
      id: data?.id,
      employee_id: data?.employee.id,
      product_name: data?.product?.name,
      product_id: data?.product.id,
      accept: false,
    };

    try {
      setLoading(true);
      confirmAlert({
        title: "Confirm to submit",
        message: `Are you sure to accept this inventory`,
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              await acceptInventory(data?.id, inventory_object);
              toast.success("You have accepted this inventory successfully.");
              const { data: useData } = await getUpdatedUserProfile(true);
              authUserDispatch({ type: LOGIN, payload: useData });
            },
          },
          {
            label: "No",
            onClick: () => {
            },
          },
        ],
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const denySubmit = (data) => {
    const inventory_object = {
      id: data?.id,
      employee_id: data?.employee.id,
      product_name: data?.product?.name,
      product_id: data?.product.id,
      accept: true,
    };

    try {
      setLoading(true);
      confirmAlert({
        title: "Confirm to submit",
        message: `Are you sure to deny this inventory`,
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              await rejectInventory(data?.id, inventory_object);
              toast.success("You have reject this inventory.");
              const { data: useData } = await getUpdatedUserProfile(true);
              authUserDispatch({ type: LOGIN, payload: useData });
            },
          },
          {
            label: "No",
            onClick: () => {
              console.log("Click No");
            },
          },
        ],
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const requestInvetorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await requestInventory({
        inventory: requestInvetoryInput?.inventory_object,
        quantity_asked: requestInvetoryInput.quantity_asked,
        date_of_use: requestInvetoryInput.date_of_use,
      });
      getInventory(true);
      const { data: useData } = await getUpdatedUserProfile(true);
      authUserDispatch({ type: LOGIN, payload: useData });
      toast.success("You have requested inventory successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const updateVendoreSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await updateVendore(authUserState.user?.id, {
        vendor_name: updateVendorInput,
      });
      if (data) {
        authUserDispatch({ type: LOGIN, payload: data });
        toast.success("Vendor Name Updated successfully");
        hideUpdateVendorModal();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = async(event, value) => {
    await getAllInvoices(value);
  };

  const handleChargeClient = (event) => {
    confirmAlert({
      title: !event.target.checked ? "Don't charge $50" : "Charge $50?",
      message: !event.target.checked
        ? "Are you sure you don't want to charge client $50?"
        : `Are you sure to charge $50 for client?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const updateVendorDetails = { pay_50: !event.target.checked };
              const { data } = await updateVendore(
                authUserState.user.id,
                updateVendorDetails
              );

              toast.success("Updated successfully.");
              if (data) {
                setUserProfileData(data);
              }
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Something went wrong."
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {
            console.log("Click No");
          },
        },
      ],
    });
  };

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
  const handleSelectAll = (event) => {
    let { checked } = event.target
    setMultipleInvoiceSelectionId(
      checked 
        ? invoices.invoices.filter((item) => !item.is_paid).map((invoice) => invoice.id) 
        : []
    );
  };

  const handleCheckboxChange = (id,checked) => {
    if (checked) {
      setMultipleInvoiceSelectionId((prev) => [...prev, id]);
    } else {
      setMultipleInvoiceSelectionId((prev) => prev.filter((itemId) => itemId !== id));
    }
  };
  const handleCloseModal=()=>{
    if(isAllChecked===false){
      const matchedData = invoices.invoices.filter(item => multipleInvoiceSelectionId.includes(item.id));
      setMultipleInvoiceSelectionData(matchedData)
      setIsAllChecked(true)

    }else{
      setIsAllChecked(false)
    }
  };
  const checkAllIDAvailable=()=>{
    return invoices?.invoice?.filter((item) => !item.is_paid).every((item) => multipleInvoiceSelectionId.includes(item.id));
  };
  const handleMultipleInvoicePay = async () => {
    setLoading(true)
    let payload = multipleInvoiceSelectionData.filter(item => multipleInvoiceSelectionId.includes(item.id)).map(item => ({ invoice_id: item.id }));
    try {
      let response = await payMultipleInvoices(payload);
      if (response.data.success.length) {
        toast.success(response.data.success[0].message)
        setLoading(false);
        handleCloseModal();
      } else if (response.data.errors.length) {
        toast.error(response.data.errors[0].error)
        setLoading(false);
        handleCloseModal();
      }
    } catch (error) {
    }
  };
  const sortTable = (key) => {
    let sortedInvoices = [...invoices];
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
  
    sortedInvoices.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    setSortConfig({ key, direction });
    setInvoices(sortedInvoices);
  };
  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
  };
  const getStatusBadge = (invoice) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    if (invoice.is_paid === true) {
      return <Badge bg="success" text="light">{'Paid'}</Badge>;
    } else if(formattedDate > invoice.date_of_service) {
      return <Badge bg="warning">{'Overdue'}</Badge>;
    }

    return <Badge bg="secondary">{'Due Later'}</Badge>;
  };
  const handleInvoiceClick = (invoice) => {
    navigate(`/invoices-details/${invoice.id}`)
  };
  const getAllInvoices = async (page, tab = 1) => {
    let response;
    let payload = {
      employee_id: authUserState.user.id,
      is_finalized: tab == 2 ? true : false,
      page: page
    }
    response = await getEmployeeInvoices(payload, true);
    setInvoices(response.data);
  }
  const handleTopTab = (count) => {
    setTopTab(count)
    getAllInvoices(1, count);
  }
  
  return (
      <AsideLayout
        asideContent={
          <div className="bg-white p-2 min-h-[90%] flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-center text-cyan-600">
              {authUserState.user?.name}
            </h1>
            <div
              role="button"
              onClick={() => {
                currentTab !== "products" && setCurrentTab("products");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md  ${
                currentTab === "products" && "pointer-events-none bg-gray-200"
              } `}
            >
              <Box />
              Assigned Inventory
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "assignedInventory" &&
                  setCurrentTab("assignedInventory");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "assignedInventory" &&
                "pointer-events-none bg-gray-200"
              } `}
            >
              <ArrowRightLeft /> Shared Inventory
            </div>
            {/* <div
              role="button"
              onClick={() => {
                currentTab !== "pendingRequest" &&
                  setCurrentTab("pendingRequest");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${currentTab === "pendingRequest" &&
                "pointer-events-none bg-gray-200"
                } `}
            >
              <RotateCw />
              Pending Request
            </div> */}

            <div
              role="button"
              onClick={() => {
                currentTab !== "invoice" && setCurrentTab("invoice");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "invoice" && "pointer-events-none bg-gray-200"
              } `}
            >
              <FileText /> Invoices
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "mySchedule" && setCurrentTab("mySchedule");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "mySchedule" && "pointer-events-none bg-gray-200"
              } `}
            >
              <RiQuestionnaireLine className="text-[24px]" /> Templates
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "mp_invoice" && setCurrentTab("mp_invoice");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md  ${
                currentTab === "mp_invoice" && "pointer-events-none bg-gray-200"
              } `}
            >
              <Receipt />
              Submit Mentorship Eval
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "mp" && setCurrentTab("mp");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md  ${
                currentTab === "mp" && "pointer-events-none bg-gray-200"
              } `}
            >
              <FileText />
              Mentorship Evaluations
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "subscription" && setCurrentTab("subscription");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "subscription" && "pointer-events-none bg-gray-200"
              } `}
            >
              <Receipt /> Subscription Plans
            </div>

            <div
              role="button"
              onClick={() => {
                currentTab !== "settings" && setCurrentTab("settings");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "settings" && "pointer-events-none bg-gray-200"
              } `}
            >
              <Settings /> Settings
            </div>
            <div
              role="button"
              onClick={() => {
                currentTab !== "bank details" && setCurrentTab("bank details");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === "bank details" && "pointer-events-none bg-gray-200"
              } `}
            >
              <Landmark /> Bank Details
            </div>
          </div>
        }
      >
        <AssignModal
          showAssignMadal={showAssignMadal}
          setShowAssignMadal={setShowAssignMadal}
          assignSubmit={assignSubmit}
          assigninventory_object={assigninventory_object}
          setAssigninventory_object={setAssigninventory_object}
          employeeList={employeeList}
          setAssignInput={setAssignInput}
          assignInput={assignInput}
          employee={authUserState.user}
          setLoading={setLoading}
          loading={loading}
        />
        {/* Request Inventory Modal */}
        <ModalWraper
          show={showRequestInvetory}
          onHide={() => {
            setShowAssignMadal(false);
            setshowRequestInvetory(false);
          }}
          centered
          title="Request Inventory"
        >
          <Form
            className="flex flex-col gap-4"
            onSubmit={requestInvetorySubmit}
          >
            <Select
              onChange={(e) => {
                const selectedInventory = inventoryList.find(
                  (inventory) => String(inventory.id) === String(e.value)
                );
                setRequestInvetoryInput({
                  ...requestInvetoryInput,
                  product_name: e.value,
                  inventory_object: selectedInventory,
                });
              }}
              options={filteredInventoryList}
              required
            />
            {/* <Form.Select
            onChange={(e) => {
              const selectedInventory = inventoryList.find(
                (inventory) => String(inventory.id) === String(e.target.value)
              );
              setRequestInvetoryInput({
                ...requestInvetoryInput,
                product_name: e.target.value,
                inventory_object: selectedInventory,
              });
            }}
            required
          >
            <option value="">Select The Product</option>
            {filteredInventoryList?.length > 0 &&
              filteredInventoryList?.map((inventory) => {
                return (
                  <option key={inventory?.id} value={inventory?.id}>
                    {inventory?.product?.name}
                  </option>
                );
              })}
          </Form.Select> */}

            <LabelInput
              label="Quantity"
              type="number"
              controlId="quantity"
              name="quantity"
              placeholder={`${
                requestInvetoryInput?.inventory_object?.quantity
                  ? ` Type Quantity`
                  : "Select Product First"
              }`}
              onChange={(e) =>
                setRequestInvetoryInput({
                  ...requestInvetoryInput,
                  quantity_asked: e.target.value,
                })
              }
              required={true}
            />

            <LabelInput
              label="Date Needed"
              type="date"
              placeholder={"Date Needed"}
              controlId="dateNeeded"
              name="dateNeeded"
              onChange={(e) =>
                setRequestInvetoryInput({
                  ...requestInvetoryInput,
                  date_of_use: e.target.value,
                })
              }
              required={true}
            />
            <Loadingbutton
              isLoading={loading}
              title="Submit"
              loadingText="Requesting inventory..."
              type="submit"
            />
          </Form>
        </ModalWraper>
        {/* showing the modal once */}
        {modalShow && (
          <CustomModal
            show={modalShow}
            onHide={handleClick}
            userProfile={authUserState.user}
            invoiceData={invoiceData}
          />
        )}
        {/* change Vendor name Modal */}
        <ModalWraper
          show={vendorUpdateModalShow}
          onHide={hideUpdateVendorModal}
          title="Update Vendor Name"
         >
          <Form className="flex flex-col gap-4" onSubmit={updateVendoreSubmit}>
            <LabelInput
              label="Enter New Vendor Name"
              type="text"
              placeholder="Enter vendor name"
              controlId="vendoreName"
              name="vendoreName"
              value={updateVendorInput}
              onChange={(e) => setupdateVendorInput(e.target.value)}
              required={true}
            />
            <Loadingbutton
              isLoading={loading}
              title="Submit"
              loadingText="Updating Vendor Name..."
              type="submit"
            />
          </Form>
        </ModalWraper>
        <div className="flex py-10 px-6 flex-1 items-center flex-col">
          {currentTab === "products" &&
            (authUserState.user?.employees_inventories?.length > 0 ? (
              <div className=" sm:container mx-auto my-3">
                <h2 className="text-4xl font-bold text-center text-cyan-400">
                  Products
                </h2>
                <Table
                  bordered
                  hover
                  responsive
                  className="w-full mt-4 text-center"
                >
                  <thead>
                    <tr>
                      <th>Product </th>
                      <th>Product Type</th>
                      <th>Quantity</th>
                      <th>Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {authUserState.user?.employees_inventories?.map((data) => {
                      return (
                        <tr key={data?.product?.id}>
                          <td className="align-middle">
                            <div className="flex flex-col  gap-2">
                              <span>{data?.product?.name} </span>
                              {/* <span>Product Name: Product </span> */}
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="flex flex-col  gap-2">
                              <span>{data?.product?.product_type} </span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="flex flex-col  gap-2">
                              <span>{data?.quantity.toFixed(2)} </span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <Button
                              variant="info"
                              onClick={() => {
                                getEmployees();
                                setAssigninventory_object(data);
                                setShowAssignMadal(true);
                              }}
                              className="text-white"
                            >
                              Assign
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <h2 className="text-4xl font-bold text-center text-cyan-400">
                No Product Found
              </h2>
            ))}
          {currentTab === "assignedInventory" &&
            (authUserState.user?.inventory_prompts?.length > 0 ? (
              <div className="sm:container">
                <h2 className="text-4xl font-bold text-center text-cyan-400">
                  Inventory Assigned
                </h2>
                <Table bordered hover responsive className="mt-4 text-center">
                  <thead>
                    <tr>
                      <th>Product </th>
                      <th>Product Type </th>
                      <th>Quantity</th>
                      <th>Assigned By</th>
                      <th className="w-[12rem]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {authUserState.user?.inventory_prompts?.map((data) => {
                      return (
                        <React.Fragment key={data.id}>
                          {!data?.is_accepted && (
                            <tr key={data?.id}>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.product?.name} </span>
                                  {/* <span>Product Name: Product </span> */}
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.product?.product_type} </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.quantity} </span>
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.assigned_by} </span>
                                </div>
                              </td>

                              <td className="align-middle">
                                <div className=" flex justify-around gap-3">
                                  <Button
                                    onClick={async () => {
                                      acceptSubmit({
                                        ...data,
                                        isDelete: false,
                                      });
                                    }}
                                    variant="info"
                                    className="text-white"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    onClick={async () => {
                                      denySubmit({ ...data, isDelete: true });
                                    }}
                                    variant="danger"
                                  >
                                    Deny
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <h2 className="text-4xl font-bold text-center text-cyan-400">
                No Assigned Inventory Found
              </h2>
            ))}
          {currentTab === "pendingRequest" &&
            (authUserState.user?.inventory_requests?.filter(
              (request) => !request.is_approved
            )?.length > 0 ? (
              <>
                <h2 className="text-4xl font-bold text-center text-cyan-400">
                  Pending Requests
                </h2>
                <div className=" sm:container mx-auto my-3">
                  <Table
                    bordered
                    hover
                    responsive
                    className="w-full mt-4 text-center"
                  >
                    <thead>
                      <tr>
                        <th>Product </th>
                        <th>Quantity</th>
                        <th>Date of use</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authUserState.user?.inventory_requests?.map(
                        (data, i) => {
                          return (
                            <tr key={data?.id}>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.inventory?.product?.name} </span>
                                  {/* <span>Product Name: Product </span> */}
                                </div>
                              </td>
                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>{data?.quantity_asked} </span>
                                </div>
                              </td>

                              <td className="align-middle">
                                <div className="flex flex-col  gap-2">
                                  <span>
                                    {new Date(
                                      data?.date_of_use
                                    ).toLocaleDateString() || "Not Given"}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <h2 className="text-4xl font-bold text-center text-cyan-400">
                No Pending Requests Found
              </h2>
            ))}

          {currentTab === "invoice" && (
          <>
            <div className="d-flex justify-content-center align-items-center">
              <div className="d-flex gap-[20px]">
                <Button size="md" variant={topTab===2&&"outline-secondary"} style={{width:"250px",color:topTab===1&&"#fff",backgroundColor:topTab===1&&"#22D3EE",border:topTab===1&&"#22D3EE"}} onClick={()=>handleTopTab(1)}>
                  Non Finalized Invoices
                </Button>
                <Button size="md" variant={topTab===1&&"outline-secondary"} style={{width:"250px",color:topTab===2&&"#fff",backgroundColor:topTab===2&&"#22D3EE",border:topTab===2&&"#22D3EE"}} onClick={()=>handleTopTab(2)}>
                  Finalized Invoices
                </Button>
              </div>
            </div>
            <div className='w-100 d-flex justify-content-end align-items-end gap-[20px] pb-3 flex-column'>
              <Pagination count={invoices?.total_pages} variant="outlined" shape="rounded" onChange={handlePageChange}/>
              {multipleInvoiceSelectionId.length > 0 && <Button onClick={handleCloseModal} style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }}>Pay Multiple Invoices</Button>}
            </div>
            <div className="w-100">
              <Table responsive bordered hover >
                <thead className="bg-primary text-white">
                  <tr>
                  <th className="text-center">#</th>
                    <th onClick={() => sortTable('client_name')} style={{ cursor: 'pointer' }}>
                      Client {getSortIcon('client_name')}
                    </th>
                    <th onClick={() => sortTable('id')} style={{ cursor: 'pointer' }}>
                      Bill {getSortIcon('id')}
                    </th>
                    <th onClick={() => sortTable('created_at')} style={{ cursor: 'pointer' }}>
                      Creation Date {getSortIcon('created_at')}
                    </th>
                    <th onClick={() => sortTable('date_of_service')} style={{ cursor: 'pointer' }}>
                      Due Date {getSortIcon('date_of_service')}
                    </th>
                    <th onClick={() => sortTable('status')} style={{ cursor: 'pointer' }}>
                      Status {getSortIcon('status')}
                    </th>
                    <th onClick={() => sortTable('charge')} style={{ cursor: 'pointer' }}>
                      Amount {getSortIcon('charge')}
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(invoices.invoices) && invoices.invoices.map((invoice,index) => (
                    <tr key={invoice.id}>
                      <td className="text-center">{index+1}</td>
                      <td>{invoice.client_name}</td>
                      <td>{invoice.id}</td>
                      <td>{moment(invoice?.created_at).format('MM-DD-YYYY')}</td>
                      <td>{moment(invoice.date_of_service).format('MM-DD-YYYY')}</td>
                      <td>{getStatusBadge(invoice)}</td>
                      <td>${invoice.charge}</td>
                      <td className="text-center">
                        <a
                          href="#"
                          className="text-[#22D3EE]"
                          onClick={() => handleInvoiceClick(invoice)}
                        >Details
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
          )}
          {currentTab === "settings" && (
            <div className="sm:container p-4 bg-white border-2 rounded-lg">
              <div className="flex gap-3 items-center">
                <h4 className="text-1xl font-bold text-center">
                  <span className="text-gray-800 flex gap-3 items-center">
                    Vendor Name:
                    <span className=" text-blue-600">
                      {authUserState.user?.vendor_name}
                    </span>
                    <button
                      className="p-2  hover:bg-gray-200 rounded-lg transition-all"
                      onClick={hideUpdateVendorModal}
                    >
                      <Edit />
                    </button>
                  </span>
                </h4>
              </div>
              <div>
                <div className="flex gap-4 m-1 items-center pb-3">
                  <div >Charge client down payment of $50</div>
                  <input
                    checked={userProfileData.pay_50}
                    name="pay_50"
                    type="checkbox"
                    onChange={handleChargeClient}
                    className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
              </div>
              <div className="flex mr-8">
                {!(authUserState.user.has_access_only_to === "all") &&
                authUserState.user?.is_inv_manager ? (
                  // Show the button if user is authUserState.user.has_access_only_to array and is_inv_manager is true
                  <Button
                    onClick={() => {
                      getInventory();
                      setTimeout(() => {
                        setshowRequestInvetory(true);
                      }, 0);
                    }}
                    variant="outline-primary"
                    className="text-4xl font-bold text-center text-blue-600 !flex gap-x-2"
                  >
                    <GitPullRequestArrow /> <span>Request Inventory</span>
                  </Button>
                ) : !authUserState.user?.is_inv_manager &&
                  !authUserState.user?.is_admin ? (
                  // Show the button if user is neither an inv manager nor an admin
                  <Button
                    onClick={() => {
                      getInventory();
                      setTimeout(() => {
                        setshowRequestInvetory(true);
                      }, 0);
                    }}
                    variant="outline-primary"
                    className="text-4xl font-bold text-center text-blue-600 !flex gap-x-2"
                  >
                    <GitPullRequestArrow /> <span>Request Inventory</span>
                  </Button>
                ) : null}
              </div>

              <InviteClientsTab employee={authUserState.user} />
            </div>
          )}


          {currentTab === "mp" && (
            <Mentorship employee={authUserState.user} />
          )}
          {currentTab === "bank details" && (
            <BankDetails employee={authUserState.user} />
          )}

          {currentTab === "mp_invoice" && (
            <MPInvoice />
          )}

          {currentTab === "subscription" && (
            <PlanSubscription />
          )}

          {currentTab === "mySchedule" && (
            <div className="flex justify-center">
            <div className="bg-white rounded-md w-[65rem]">
              {templateTabs === "templates list" && <div className=" p-4 pt-2">
                <div className="bg-white rounded-lg">
                  <div className="flex justify-between items-center py-3">
                    <h2 className="text-gray-500">Template List</h2>
                    <div><div onClick={() => {setTemplateTabs("create new template"); setSelectedQuestionnaire(); setDuplicateQuestionnaire(); setFormChanges(false);}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Create New Template</div></div>
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
                          <Link className="text-black" to="#"><button className="bg-white border border-gray-900 px-2 py-1  rounded-md" onClick={() => {setTemplateTabs("create new template"); setDuplicateQuestionnaire(template?.id); setSelectedQuestionnaire(); setFormChanges(false)}}>Duplicate</button></Link>
                          {((authUserState?.user?.is_admin) === true || (authUserState?.user?.id === template?.employee?.id)) && (
                          <button className="bg-[#22d3ee] px-2 py-1 text-white  rounded-md" onClick={() => {setTemplateTabs("create new template"); setSelectedQuestionnaire(template?.id); setDuplicateQuestionnaire(); setFormChanges(false)}}>Edit</button>
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
                        <div onClick={() => {confirmToDiscard();}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Return to Questionnaire</div>
                      </div>
                    </div>
                  </div>
                  <div><Questionnaires title={title} selectedEmployee={authUserState.user} questionnaireId={selectedQuestionnaire} duplicateQuestionnaireId={duplicateQuestionnaire} setTemplateTabs={handleSetTemplateTabs} FormChanges={handleFormChanges}/></div>
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

          {currentTab === "treatment" && (
            <>
              <Treatment selectedEmployee={authUserState.user}></Treatment>{" "}
            </>
          )}
        </div>
        <Modal show={isAllChecked} onHide={handleCloseModal} size='xl' centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay for multiple invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: "max-content", maxHeight: "55vh", overflow: "scroll" }}>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Charge</th>
                  <th>Payment Frequency</th>
                  <th>Invoice Date</th>
                </tr>
              </thead>
              <tbody>
                {multipleInvoiceSelectionData.filter((inv) => !inv.is_paid).map((invoice, index) => {
                  return <tr key={index}>
                    <td>{invoice?.id}</td>
                    <td>{invoice?.charge}</td>
                    <td>{invoice?.instant_pay === true ? "Pay Faster" : "Default"}</td>
                    <td>{moment(invoice?.created_at).format("MM-DD-YYYY")}</td>
                  </tr>
                })}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>Close</Button>
          <Button variant="dark" disabled={loading} style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} onClick={handleMultipleInvoicePay}>
            Pay {loading && <Spinner animation="border" variant="white" style={{ width: "15px", height: "15px" }} />}
          </Button>
        </Modal.Footer>
      </Modal>
      </AsideLayout>
  );
};

export default MyProfile;
