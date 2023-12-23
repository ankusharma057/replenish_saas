import React, { useEffect,  useState } from "react";
// import EmployeeInvoiceCard from "../components/Cards/EmployeeInvoiceCard";
import {
  deleteEmployeeRoute,
  getEmployeesList,
  getInvoiceList,
  sendResetPasswordLinkRoute,
  updateVendore,
} from "../Server";
import { useAuthContext } from "../context/AuthUserContext";
// import InventoryModal from "../components/Modals/InventoryModal";
// import InvoiceListModal from "../components/Modals/InvoiceListModal";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
// import { Form, Popover } from "react-bootstrap";
// import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { ChevronDown, } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ButtonGroup, ToggleButton, Button } from "react-bootstrap";
import LineInput from "../components/Input/LineInput";
import InventoryTab from "../components/Tabs/InventoryTab";
import CustomModal from "../components/Modals/CustomModal";
import CreateUserModal from "../components/Modals/CreateUserModal";
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
const Employee = () => {
  const { authUserState } = useAuthContext();
  // const [invoiceList, setInvoiceList] = useState([]);
  // const [invModalSHow, setInvModalSHow] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  // const [employeeInvoices, setEmployeeInvoices] = useState({
  //   invoices: [],
  //   employee: {},
  // });
  const { isCollapsed, collapse } = useAsideLayoutContext();
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [currentTab, setCurrentTab] = useState("inventory");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [radioTabs, setRadioTabs] = useState([]);
  // const [invoiceModalShow, setInvoiceModalShow] = useState(false);
  // const [updateIvoiceInput, setUpdateIvoiceInput] = useState({
  //   name: employeeInvoices.employee?.name || "",
  //   vendor_name: employeeInvoices.employee?.vendor_name || "",
  //   email: employeeInvoices.employee?.email,
  //   gfe: employeeInvoices.employee?.gfe || false,
  //   service_percentage: employeeInvoices.employee?.service_percentage || 0,
  //   retail_percentage: employeeInvoices.employee?.retail_percentage || 0,
  // });
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoiceData, setSelectedInvoiceData] = useState({});
  const [updateEmployeeInput, setUpdateEmployeeInput] = useState({});
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      setEmployeeList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getInvoices = async () => {
    // eslint-disable-next-line no-unused-vars
    const { data } = await getInvoiceList();
    // setInvoiceList(data);
  };

  useEffect(() => {
    getEmployees();
    getInvoices();
    return () => {};
  }, []);

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
  //           defaultValue={updateIvoiceInput.name}
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
  //               defaultValue={updateIvoiceInput.vendor_name}
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
  //           value={updateIvoiceInput.email}
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
  //           checked={updateIvoiceInput.gfe}
  //           onChange={handleUpdateChange}
  //         />

  //         <LabelInput
  //           label="Service Percentage"
  //           type="number"
  //           defaultValue={updateIvoiceInput.service_percentage}
  //           controlId="service_percentage"
  //           onChange={handleUpdateChange}
  //           name="service_percentage"
  //         />

  //         <LabelInput
  //           label="Retail Percentage"
  //           controlId="service_percentage"
  //           type="number"
  //           name="retail_percentage"
  //           defaultValue={updateIvoiceInput.retail_percentage}
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
                  error.response.statusText ||
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
    setSelectedEmployeeData(emp);
    setRadioTabs([]);
    setUpdateEmployeeInput({});
    setCurrentTab("inventory");
    let addTabs = [
      {
        name: "Invoices",
        value: "invoice",
        // data: getRequestInventoryData,
      },
    ];
    if (emp.is_admin || emp.is_inv_manager) {
      addTabs.splice(0, 0, {
        name: "Inventories",
        value: "inventory",
        data: getEmployees,
      });
    }
    if (!emp.is_admin) {
      addTabs.splice(0, 0, { name: "Profile", value: "profile" });
      addTabs.push({ name: "Settings", value: "settings" });
    }
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
          className={`p-2 border-b transition-all duration-700 ${
            selectedEmployeeData?.id === employee.id
              ? "pointer-events-none"
              : "cursor-pointer "
          } `}
        >
          {employee.name || ""}
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
                  error.response.statusText ||
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
    //   email: updateIvoiceInput.email,
    //   gfe: updateIvoiceInput.gfe,
    //   name: updateIvoiceInput.name,
    //   retail_percentage: updateIvoiceInput.retail_percentage,
    //   service_percentage: updateIvoiceInput.service_percentage,
    //   vendor_name: updateIvoiceInput.vendor_name,
    // };
    try {
      setLoading(true);
      const { data } = await updateVendore(
        selectedEmployeeData.id,
        updateEmployeeInput
      );

      toast.success("Employee has been updated successfully.");
      await getEmployees(true);
      // setUpdateIvoiceInput(data);
      setSelectedEmployeeData(data);
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

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setUpdateEmployeeInput((pre) => ({
      ...pre,
      [name]: inputValue,
    }));
  };

  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <div >
              <SearchInput
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                All Staff <ChevronDown />
              </h1>
              <div className="flex pb-24 flex-col pl-2 gap-4 overflow-y-auto">
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
              onClick={() => setShowCreateUserModal(true)}
              className="w-full"
            >
              + Add Employee
            </Button>
          </>
        }
      >
        <div className="flex-1" key={selectedEmployeeData?.name}>
          {selectedEmployeeData && (
            <div className="p-10">
              <h1 className="text-3xl font-bold">
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
                      className={` !border-none !rounded-t-lg ${
                        currentTab === tab.value
                          ? "!bg-white pb-2 !no-underline"
                          : "btn-link"
                      }  `}
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

              <div className="bg-white p-4 rounded-b-lg">
                {currentTab === "profile" && (
                  <form onSubmit={updateEmployee}>
                    <table>
                      <tbody>
                        <tr>
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
                        </tr>
                        {authUserState.user?.is_admin && (
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

                        <tr>
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
                        </tr>

                        <tr>
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
                        </tr>

                        <tr>
                          <th className="px-4">Service Percentage:</th>
                          <td>
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
                        </tr>

                        <tr>
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
                        </tr>
                      </tbody>
                    </table>

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
                    {selectedEmployeeData?.invoices.length > 0 ? (
                      (selectedEmployeeData?.invoices || []).map((invoice) => {
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
                      <span>Delete this Employee:</span>
                      <Loadingbutton
                        onClick={deleteEmployee}
                        variant="danger"
                        title={"Delete"}
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <span>Send password Reset Link:</span>
                      <Loadingbutton
                        onClick={sendResetPasswordLink}
                        title={"Send"}
                      />
                    </div>
                  </div>
                )}
              </div>

              <CustomModal
                show={showInvoiceModal}
                onHide={() => setShowInvoiceModal(false)}
                invoiceData={selectedInvoiceData}
              />

              {/* <InvoiceListModal
                show={invoiceModalShow}
                onHide={() => setInvoiceModalShow(false)}
                setShowInvoiceModal={invoiceModalShow}
                employeeInvoices={employeeInvoices.invoices}
                EmployeeName={employeeInvoices.employee.name}
              /> */}
              {/* {invModalSHow && (
                <InventoryModal
                  inventoryList={employeeInvoices.employee}
                  showModal={invModalSHow}
                  setshowModal={setInvModalSHow}
                  isQtyUpdate={false}
                  employeeList={employeeList}
                  userProfile={authUserState.user}
                  // productList={productList}
                  // entireInventoryList={inventoryList}
                  getEmployees={getEmployees}
                />
              )} */}
              {/* <div className="mt-3 mb-3 mx-1 flex justify-center flex-wrap gap-3">
                {employeeList
                  ?.sort((a, b) => a?.name?.localeCompare(b?.name))
                  ?.map((employee) => {
                    return (
                      <EmployeeInvoiceCard
                        key={employee.id}
                        employeeList={employeeList}
                        employee={employee}
                        title={employee.name}
                        invoiceList={invoiceList}
                        userProfile={authUserState.user}
                        openShowInventory={openShowInventory}
                        openShowInvoice={openShowInvoice}
                        sendResetPasswordLink={sendResetPasswordLink}
                        updatePopover={updatePopover}
                        setUpdateIvoiceInput={setUpdateIvoiceInput}
                        deleteEmployee={deleteEmployee}
                      />
                    );
                  })}
              </div> */}
            </div>
          )}

          <CreateUserModal
            show={showCreateUserModal}
            onHide={() => setShowCreateUserModal(false)}
          />
        </div>
      </AsideLayout>
    </>
  );
};

export default Employee;
