import React, { useEffect, useState } from "react";
// import EmployeeInvoiceCard from "../components/Cards/EmployeeInvoiceCard";
import {
    deleteEmployeeRoute,
    getClients,
    getEmployeesList,
    // getInvoiceList,
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
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ButtonGroup, ToggleButton, Button } from "react-bootstrap";
import LineInput from "../components/Input/LineInput";
import InventoryTab from "../components/Tabs/InventoryTab";
import CustomModal from "../components/Modals/CustomModal";
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import CreateStaffCard from "../components/Cards/CreateStaffCard";
import InviteClientsTab from "../components/Tabs/InviteClientsTab";
import { FaUser, FaBriefcaseMedical, FaDollarSign, FaRegCalendarAlt, FaArrowRight, FaPrint, FaFileAlt, FaBell, FaQuestionCircle, FaThumbsUp } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { IoCallSharp, IoMailSharp, IoHome, IoMegaphoneSharp, IoChatbubble } from "react-icons/io5";
import { BsFillGearFill } from "react-icons/bs";

const AllClientRoot = () => {
    const { authUserState } = useAuthContext();
    // const [invoiceList, setInvoiceList] = useState([]);
    // const [invModalSHow, setInvModalSHow] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    // const [employeeInvoices, setEmployeeInvoices] = useState({
    //   invoices: [],
    //   employee: {},
    // });
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

    const getEmployees = async (refetch = false) => {
        try {
            const { data } = await getClients();
            console.log(data, 'adad')
            if (data?.length > 0) {
                setEmployeeList(data);
                handleSelect(data[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };
    // const getInvoices = async () => {
    //   // eslint-disable-next-line no-unused-vars
    //   const { data } = await getInvoiceList();
    //   // setInvoiceList(data);
    // };

    useEffect(() => {
        getEmployees();
        // getInvoices();
        return () => { };
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setSelectedEmployeeData(emp);
        setRadioTabs([]);
        setUpdateEmployeeInput({});
        setCurrentTab(emp.is_admin ? "invoice" : "profile");
        let addTabs = [
            // {
            //     name: "Invoices",
            //     value: "invoice",
            //     // data: getRequestInventoryData,
            // },
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
            addTabs.push({ name: "Edit/Settings", value: "settings" });
            addTabs.push({ name: "Chart", value: "Chart" });
            addTabs.push({ name: "Appointments", value: "Appointments" });
            addTabs.push({ name: "Billing", value: "Billing" });
            addTabs.push({ name: "Messages", value: "Messages" });
            addTabs.push({ name: "Files", value: "Files" });
            addTabs.push({ name: "Groups", value: "Groups" });

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
                    className={`p-2 border-b transition-all hover:bg-gray-200 rounded-md duration-700 ${selectedEmployeeData?.id === employee.id
                        ? "pointer-events-none bg-gray-200 "
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
                        <div>
                            <SearchInput
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="border-t-2  py-2 bg-white">
                            <h1 className="text-xl flex gap-x-2 items-center justify-center">
                                Clients <ChevronDown />
                            </h1>
                            <div className="flex  flex-col pl-2 gap-4 overflow-y-auto">
                                {(employeeList || []).length > 0 && (
                                    <List
                                        height={window.innerHeight}
                                        itemCount={employeeList.length}
                                        itemSize={45}
                                        width={"100%"}
                                    >
                                        {EmployeeItem}
                                    </List>
                                )}
                            </div>
                        </div>
                    </>
                }
            >
                <div className="flex-1" key={selectedEmployeeData?.name}>
                    {selectedEmployeeData && (
                        <div className=" p-2 sm:p-10">
                            <h1 className="text-3xl mt-10  font-bold">
                                {selectedEmployeeData?.name}
                            </h1>
                            <ButtonGroup className="w-full mb-4 md:w-auto">
                                {radioTabs.map((tab) => {
                                    return (
                                        <ToggleButton
                                            variant="link"
                                            key={tab.value}
                                            id={tab.value}
                                            type="radio"
                                            className={` !border-none !no-underline !rounded-lg !text-cyan-500 ${currentTab === tab.value ? "!bg-cyan-500 text-white pb-2" : "btn-link"
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
                                className={`sm:p-6 rounded-b-lg ${currentTab === "staff" ? "" : "bg-transparent"
                                    } `}
                            >
                                {true && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="grid grid-cols-2 col-span-2 gap-20 justify-between rounded-md py-6 items-center bg-white">
                                            <div className="flex items-start justify-evenly gap-6 text-center">
                                                <div className="flex flex-col max-w-[105px] justify-center items-center">
                                                    <div className="text-6xl">0</div>
                                                    <div>Total Bookings</div>
                                                </div>
                                                <div className="flex flex-col max-w-[105px] justify-center items-center">
                                                    <div className="text-6xl">0</div>
                                                    <div>Upcoming Appointment</div>
                                                </div>
                                                <div className="flex flex-col max-w-[105px] justify-center items-center">
                                                    <div className="text-6xl">0</div>
                                                    <div>No Shows</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start justify-evenly gap-6 text-center">
                                                <div className="flex flex-col max-w-[125px] justify-center items-center">
                                                    <div className="text-6xl"><span className="text-base align-text-top">$</span>0<span className="text-2xl">.</span><span className="text-xl align-text-top">00</span></div>
                                                    <div>Private Outstanding</div>
                                                </div>
                                                <div className="flex flex-col max-w-[125px] justify-center items-center">
                                                    <div className="text-6xl"><span className="text-base align-text-top">$</span>0<span className="text-2xl">.</span><span className="text-xl align-text-top">00</span></div>
                                                    <div>Credit</div>
                                                </div>
                                                <div className="flex flex-col max-w-[125px] justify-center items-center">
                                                    <div className="text-6xl"><span className="text-base align-text-top">$</span>0<span className="text-2xl">.</span><span className="text-xl align-text-top">00</span></div>
                                                    <div>Private Balance</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col mt-4 ">
                                            <div className="flex flex-col bg-white p-4">
                                                <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaUser className="w-6 h-6" />
                                                    <div>{selectedEmployeeData?.name}</div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <IoCallSharp className="w-6 h-6" />
                                                    <div>No phone number</div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <IoMailSharp className="w-6 h-6" />
                                                    <div>{selectedEmployeeData?.email}</div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <IoHome className="w-6 h-6" />
                                                    <div>No address found</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 my-2">
                                                <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaBriefcaseMedical className="w-6 h-6" />
                                                    <div>No medical info</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div>
                                                <div className="flex items-start gap-6 mb-4 text-lg">
                                                    <FaBell className="w-6 h-6" />
                                                    <div className="flex flex-col">
                                                        <div className="text-sm mb-2">Reminders</div>
                                                        <div className="text-base flex items-center gap-2 mb-2"><FaQuestionCircle /> Email 2 days before appoitment <span className="bg-amber-600">Not a valid email address</span></div>
                                                        <div className="text-base flex items-center gap-2 mb-2"><FaQuestionCircle />Text Message (SMS) 24 hours before appointment <span className="bg-amber-600">Not a valid phone number</span></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <IoMegaphoneSharp className="w-6 h-6" />
                                                    <div className="flex flex-col">
                                                        <div className="text-base">Marketing Emails</div>
                                                        <div>Opted Out</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <BsFillGearFill className="w-6 h-6" />
                                                    <div className="flex flex-col">
                                                        <div className="text-base">All Email Settings</div>
                                                        <div>Emails Allowed</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaThumbsUp className="w-6 h-6" />
                                                    <div className="flex flex-col">
                                                        <div className="text-base">Wow were you reffered to?</div>
                                                        <div>ReplenishMD</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col mt-4 ">
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                {/* <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div> */}
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaDollarSign className="w-6 h-6" />
                                                    <div className="text-sm">Billing Notices</div>
                                                    <div>No billing notices</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                {/* <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div> */}
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaRegCalendarAlt className="w-6 h-6" />
                                                    <div>test has no upcoming appointments. <span className="text-cyan-400 font-medium">Add a Return Visit Reminder</span></div>
                                                </div>
                                                <div className="flex">
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><FaArrowRight /> View All</Button>
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><IoMailSharp /> No Email Available</Button>
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><FaPrint /> Print</Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                {/* <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div> */}
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaRegCalendarAlt className="w-6 h-6" />
                                                    <div className="text-base">Username/Logins</div>
                                                    <div>No username or social logins</div>
                                                </div>
                                                <div className="flex">
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><IoMailSharp /> No Email Available</Button>
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><IoMailSharp /> No Email Available</Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                {/* <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div> */}
                                                <div className="flex items-center gap-6 mb-4 text-lg">
                                                    <FaFileAlt className="w-6 h-6" />
                                                    <div>Online Intake Forms</div>
                                                </div>
                                                <div className="flex">
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><BiSolidPencil /> Fill Out</Button>
                                                    <Button className="w-full !flex items-center justify-center gap-2 bg-white border rounded-none text-black"><IoMailSharp /> No Email Available</Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col bg-white p-4 mb-2">
                                                {/* <div className="flex justify-end text-cyan-400"><BiSolidPencil /></div> */}
                                                <div className="flex items-start gap-6 mb-4 text-lg">
                                                    <IoChatbubble className="w-6 h-6" />
                                                    <div className="flex w-full">
                                                        <textarea type="text" placeholder="Add Notes..." className="w-full !flex items-center justify-center gap-2 p-2 bg-white border rounded-none text-black"></textarea>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                        {/* {selectedEmployeeData?.invoices.length > 0 ? (
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
                                        )} */}
                                    </div>
                                )}
                                {currentTab === "Edit/Settings" && (
                                    <div>
                                        
                                    </div>
                                )}
                                {currentTab === "staff" && (
                                    <CreateStaffCard
                                        show={showCreateUserModal}
                                        onHide={() => setShowCreateUserModal(false)}
                                    />
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

export default AllClientRoot;
