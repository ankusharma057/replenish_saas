import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import CustomModal from "../components/Modals/CustomModal";
import Table from "react-bootstrap/Table";
import AssignModal from "../components/Modals/AssignModal";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert"; // Import
import ModalWraper from "../components/Modals/ModalWraper";
import { useAuthContext } from "../context/AuthUserContext";
import DataFilterService from "../services/DataFilterService";
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
  CalendarCheck,
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
} from "../Server";
import { LOGIN } from "../Constants/AuthConstants";
import AsideLayout from "../components/Layouts/AsideLayout";
import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import Select from "react-select";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import InviteClientsTab from "../components/Tabs/InviteClientsTab";
import MySchedule from "./MySchedule";

const MyProfile = () => {
  const { authUserState, authUserDispatch } = useAuthContext();
  const [userProfileData, setUserProfileData] = useState(authUserState.user)
  const [loading, setLoading] = useState(false);
  const { collapse } = useAsideLayoutContext();
  const [modalShow, setModalShow] = useState(false);
  const [currentTab, setCurrentTab] = useState("products");
  const [invoiceData, setinvoiceData] = useState(null);
  const [showAssignMadal, setShowAssignMadal] = useState(false);
  const [assigninventory_object, setAssigninventory_object] = useState({});
  const [vendorUpdateModalShow, setVendorUpdateModalShow] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [assignInput, setAssignInput] = useState({
    quantity: 0,
  });
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

  console.log("asdasddddddddddsaaaaaaaa", authUserState)
  // added
  const getEmployees = async () => {
    try {
      const { data } = await getEmployeesList();
      if (data) {
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

  const currentInvoices =
    (authUserState.user?.invoices || [])?.slice(startIndex, endIndex) || [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };


  const handleChargeClient = (event) => {
    console.log(event.target.checked, 'checked')
    confirmAlert({
      title: !event.target.checked ? "Don't charge $50" : "Charge $50?",
      message: !event.target.checked ? "Are you sure you don't want to charge client $50?" : `Are you sure to charge $50 for client?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const updateVendorDetails = { pay_50: !event.target.checked }
              const { data } = await updateVendore(
                authUserState.user.id,
                updateVendorDetails
              );

              toast.success("Updated successfully.");
              if (data) {
                setUserProfileData(data)
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
  }

  return (
    <div>
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
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md  ${currentTab === "products" && "pointer-events-none bg-gray-200"
                } `}
            >
              <Box />
              Products
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
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${currentTab === "assignedInventory" &&
                "pointer-events-none bg-gray-200"
                } `}
            >
              <ArrowRightLeft /> Assigned Inventory
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
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${currentTab === "invoice" && "pointer-events-none bg-gray-200"
                } `}
            >
              <FileText /> Invoices
            </div>

            {/* <div
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
              <CalendarCheck /> My Schedule
            </div> */}

            <div
              role="button"
              onClick={() => {
                currentTab !== "settings" && setCurrentTab("settings");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${currentTab === "settings" && "pointer-events-none bg-gray-200"
                } `}
            >
              <Settings /> Settings
            </div>
            <div
              role="button"
              onClick={() => {
                currentTab !== "treatment" && setCurrentTab("treatment");
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex flex-row items-center gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${currentTab === "treatment" && "pointer-events-none bg-gray-200"
                } `}
            >
              <ImProfile /> Treatments
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
              placeholder={`${requestInvetoryInput?.inventory_object?.quantity
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
            (authUserState.user?.inventory_prompts?.filter(
              (prompt) => !prompt.is_accepted === true
            )?.length > 0 ? (
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
              <div className="flex gap-x-4  w-full justify-end my-4">
                {/* Pagination controls */}
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="info"
                  className="text-white"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil(
                      (authUserState.user?.invoices || []).length / itemPerPage
                    )
                  }
                  variant="info"
                  className="text-white"
                >
                  <ChevronRight />
                </Button>
              </div>
              <ul className=" mx-1 mb-3 justify-center flex flex-wrap gap-3 ">
                {authUserState.user?.invoices?.length > 0 ? (
                  (currentInvoices || []).map((invoice) => {
                    return (
                      <li key={invoice?.id}>
                        <Card
                          className="text-center"
                          border="info"
                          style={{ width: "18rem" }}
                        >
                          <Card.Header as="h5">
                            Invoice ID {invoice.id}
                          </Card.Header>
                          <Card.Body className="">
                            <Button
                              onClick={async () => {
                                await setinvoiceData(invoice);
                                handleClick();
                              }}
                              variant="info"
                              className="text-white"
                            >
                              See More Details
                            </Button>
                          </Card.Body>
                        </Card>
                      </li>
                    );
                  })
                ) : (
                  <h2 className="text-4xl font-bold text-center text-cyan-400">
                    No Invoice Found
                  </h2>
                )}
              </ul>
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
                <div className="flex gap-4 m-1 items-center">
                  <div>Charge client down payment of $50</div>
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
          {currentTab === "mySchedule" && <MySchedule />}

          {
            currentTab === "treatment" && <><Treatment selectedEmployess={authUserState.user}></Treatment> </>
          }
        </div>
      </AsideLayout>
    </div>
  );
};

export default MyProfile;
