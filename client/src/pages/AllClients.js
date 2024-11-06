import React, { useEffect, useRef, useState } from "react";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
// import EmployeeInvoiceCard from "../components/Cards/EmployeeInvoiceCard";
import {
    deleteEmployeeRoute,
    getClients,
    getEmployeesList,
    createChartEntries,
    getChartEntry,
    getChartEntries,
    // getInvoiceList,
    sendResetPasswordLinkRoute,
    updateVendore,
    getClientSchedules,
    getClientSchedulesOnly,
    UpdateClient,
    createCheckoutSession,
    confirmPayment
} from "../Server";
import { useAuthContext } from "../context/AuthUserContext";
// import InventoryModal from "../components/Modals/InventoryModal";
// import InvoiceListModal from "../components/Modals/InvoiceListModal";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
// import { Form, Popover } from "react-bootstrap";
// import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { ChevronDown, Plus, MoveRight, X } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ButtonGroup, ToggleButton, Button, Row, Col } from "react-bootstrap";
import LineInput from "../components/Input/LineInput";
import InventoryTab from "../components/Tabs/InventoryTab";
import CustomModal from "../components/Modals/CustomModal";
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import CreateStaffCard from "../components/Cards/CreateStaffCard";
import InviteClientsTab from "../components/Tabs/InviteClientsTab";
import { FaUser, FaBriefcaseMedical, FaDollarSign, FaRegCalendarAlt, FaArrowRight, FaPrint, FaFileAlt, FaBell, FaQuestionCircle, FaThumbsUp, FaRegEdit, FaLongArrowAltUp, FaLongArrowAltDown, FaUndo } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { IoCallSharp, IoMailSharp, IoHome, IoMegaphoneSharp, IoChatbubble, IoDocumentText } from "react-icons/io5";
import { BsFileEarmarkTextFill, BsFillGearFill, BsSliders2, BsThreeDotsVertical } from "react-icons/bs";
import SubmitedClientIntakeForm from "./SubmitedClientIntakeForm";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import CreateClientCard from "../components/Cards/CreateClientCart";
import ScheduleCalender from "../components/Schedule/ScheduleCalender";
import { MdDelete } from "react-icons/md";
import { DropDown } from "../components/DropDown/DropDown";
import SignatureCanvas from "react-signature-canvas";
import Select from "react-select";
import { FaBook, FaHeading } from "react-icons/fa6";
import { TbCheckbox, TbSignature } from "react-icons/tb";
import { RxDropdownMenu } from "react-icons/rx";
import { PiColumnsFill, PiGridNineLight, PiWarningCircleBold } from "react-icons/pi";
import { TopModel } from "../components/TopModel";
import Switch from "@mui/material/Switch";
import { IoIosArrowDown, IoIosArrowUp, IoMdAdd } from "react-icons/io";
import { add, set, template } from "lodash";
import { createIntakeForm, getIntakeForm, updateIntakeForm, getQuestionnaires, getQuestionnaire, fetchConfig } from "../Server";
import ClientProfile from "./ClientProfile";
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import ClientBilling from "./ClientBilling";

const AllClientRoot = () => {
    let { clientId } = useParams();
    const { authUserState } = useAuthContext();
    // const [invoiceList, setInvoiceList] = useState([]);
    // const [invModalSHow, setInvModalSHow] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    // const [employeeInvoices, setEmployeeInvoices] = useState({
    //   invoices: [],
    //   employee: {},
    // });
    const navigate = useNavigate();
    const location = useLocation();
    let queryParams = new URLSearchParams(location.search);
    const { collapse } = useAsideLayoutContext();
    const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
    const sessionIdExists = queryParams.has('session_id');

    const [currentTab, setCurrentTab] = useState(
        queryParams.get('payment_success') === 'true' ? "Appointments" : sessionIdExists ? "Billing" : "Profile"
    );
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [radioTabs, setRadioTabs] = useState([]);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedInvoiceData, setSelectedInvoiceData] = useState({});
    const [updateEmployeeInput, setUpdateEmployeeInput] = useState({});
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showCreateClientModel, setShowCreateClientModel] = useState(false);
    const [selectedClientSchedules, setSelectedClientSchedules] = useState([]);
    const [chartTab, setChartTab] = useState("chart_entries_list");
    const [showEditProfileModal,setShowEditProfileModal]=useState(false)
    const [editProfileData,setEditProfileData]=useState()
    const [searchedClients,setSearchedClients]=useState([])
    const localizer = momentLocalizer(moment);
    const [stripePublicKey, setStripePublicKey] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        async function loadConfig() {
        const publicKey = await fetchConfig();
        setStripePublicKey(publicKey);
        }
        loadConfig();
    }, []);

    useEffect(() => {
        if (stripePublicKey) {
            setStripePromise(loadStripe(stripePublicKey));
        }
    }, [stripePublicKey]);

    const symbols = ['↑', '↓', '←', '→', '↩', '↪', '↻', '↷', '℗', 'ℓ', '®', 'ℬ', '∅', '•'];
    const [showSymbol,setShowSymbol] = useState(null)
    const [cursorPosition, setCursorPosition] = useState(0);
  const getClientSchedule = async (selectedEmployeeData, refetch = true) => {
    try {
      if (selectedEmployeeData) {
        const { data } = await getClientSchedulesOnly(selectedEmployeeData, refetch);
        setSelectedClientSchedules(data);
        console.log("@@@@@@@@",data);
        
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

    useEffect(() => {
    getClientSchedule(selectedEmployeeData?.id, true);
    }, [selectedEmployeeData, reload]);

    const getEmployees = async (refetch = false) => {
        try {
            const { data } = await getClients();
            if (data?.length > 0) {
                const newData = data.filter((client) => client?.email !== null && client?.email !== undefined && client?.email.trim() !== "");
                setEmployeeList(newData);
                if (clientId) {
                    let newClient = newData.find(client => client.id == clientId)
                    if(newClient){
                    handleSelect(newClient);
                    }else{
                        handleSelect(newData[0]);
                        navigate(`/customers/${newData[0].id}`)
                    }
                }else{
                    handleSelect(newData[0]);
                }
            }
        } catch (error) {
      toast.error(error.message)

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

    const qutionaryInputOption = [
    {
        label: "Note",
        icon: <BsFileEarmarkTextFill />,
        field: "initialNote",
        description: "A Plain Text Area To Types Notes",
    },
    // {
    //     label: "Signature",
    //     icon: <TbSignature />,
    //     field: "initialSignature",
    //     description: "Add A Signature By Drawing Or Typing",
    // },
    {
        label: "Heading",
        icon: <FaHeading />,
        field: "initialHeading",
        description: "A Simple Heading",
    },
    {
        label: "Check Boxes",
        icon: <TbCheckbox />,
        field: "initialCheckBox",
        description:
        "Select One or More CheckBoxes And Correctly And Operationally Add A Note To Each",
    },
    {
        label: "Drop Down",
        icon: <RxDropdownMenu />,
        field: "initialDropdown",
        description: "Select One Option From List Of Options In A Drop Down Menu",
    },
    {
        label: "Range/Scale",
        icon: <BsSliders2 />,
        field: "initialRange",
        description:
        "A Customizable Range/Scale Slicer Allows You To Choose From A Range Of Values",
    },
    {
        label: "Instruction",
        icon: <PiWarningCircleBold />,
        field: "initialInstruction",
        description:
        "Add Instructions To Your Template That Will Noe Be Visible When Exploring Or Printing The Chart",
    },
    ];

    const qutionaryInputs = {
        initialNote: {
            id: null,
            type: "textarea",
            label: "Notes",
            value: "",
            required: false,
            read_only: false,
        },
        initialSignature: {
            id: null,
            type: "signature",
            label: "Signature",
            sign_type: "draw",
            sign: "Signature value",
            required: false,
            read_only: false,
        },
            initialHeading: {
            id: null,
            type: "heading",
            label: "Heading",
            required: false,
            read_only: false,
        },
        initialCheckBox: {
            id: null,
            type: "checkbox",
            label: "Check Box",
            layout: "horizontal",
            value: [
                { label: "Check Box 1", value: true },
                { label: "Check Box 2", value: false },
                { label: "Check Box 3", value: false },
                { label: "Check Box 4", value: false },
                { label: "Check Box 5", value: false },
                { label: "Check Box 6", value: false },
            ],
            required: false,
            read_only: false,
        },
        initialDropdown: {
            id: null,
            type: "dropdown",
            label: "Dropdown",
            value: [
                { label: "Dropdown 1", value: "value 1" },
                { label: "Dropdown 2", value: "value 2" },
                { label: "Dropdown 3", value: "value 3" },
                { label: "Dropdown 4", value: "value 4" },
                { label: "Dropdown 5", value: "value 5" },
                { label: "Dropdown 6", value: "value 6" },
            ],
            required: false,
            read_only: false,
            },
            initialRange: {
            id: null,
            type: "range",
            label: "Range",
            range_value: "",
            value: [
                { label: 1, value: 10 },
                { label: 2, value: 10 },
                { label: 3, value: 10 },
                { label: 4, value: 10 },
                { label: 5, value: 10 },
                { label: 6, value: 10 },
                { label: 7, value: 10 },
                { label: 8, value: 10 },
                { label: 9, value: 10 },
                { label: 10, value:10 }
            ],
            required: false,
            read_only: false,
            values:{value:5}
            },
            initialInstruction: {
            id: null,
            type: "instruction",
            label: "Instruction",
            required: false,
            value: "Instruction 1",
            read_only: false,
            },
        };

    const questionnaireTabs = [
        {
            tab_name: "Items",
            value: 0,
        },
        {
            tab_name: "Templates",
            value: 1,
        },
    ];

    const profile_fields = [
        {
            input_name: "First Name",
            name: "first-name",
            include_in_intake: true,
            input_type: "text",
            required: true,

        },
        {
            input_name: "Last Name",
            name: "last-name",
            include_in_intake: true,
            input_type: "text",
            required: true,
        },
        {
            input_name: "Email",
            name: "email",
            include_in_intake: true,
            input_type: "Email",
            required: true,

        },
        {
            input_name: "Preferred Name (if different)",
            name: "preferred-name",
            include_in_intake: false,
            input_type: "text",
            required: false,
            discription: "<div style='font-size:14px;'><em> Help Text Displayed:</em>  This is the name you identity with, Providing this allows the staff to address you appropriatly </div>"

        },
        {
            input_name: "Prefix/Title",
            name: "prefix-title",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Pronouns",
            name: "pronouns",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Home Phone",
            name: "home-phone",
            include_in_intake: false,
            input_type: "number",
            required: false,

        },
        {
            input_name: "Mobile Phone",
            name: "mobile-phone",
            include_in_intake: false,
            input_type: "number",
            required: false,
            discription: "<div style='font-size:14px;'><em> Help Text Displayed:</em> A mobile phone is required if you would like to receive SMS appropriatly reminders </div>"

        },
        {
            input_name: "Work Phone",
            name: "work-phone",
            include_in_intake: false,
            input_type: "number",
            required: false,

        },
        {
            input_name: "Fax Phone",
            name: "fax-phone",
            include_in_intake: false,
            input_type: "number",
            required: false,

        },
        {
            input_name: "Address",
            name: "address",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Date of Birth",
            name: "dob",
            include_in_intake: false,
            input_type: "date",
            required: false,
        },

        {
            input_name: "Gender",
            name: "gender",
            include_in_intake: false,
            input_type: "text",
            required: false,
            discription: "<div style='font-size:14px;'><em> Help Text Displayed:</em>  Refers to current gender which may be different then what is indicated on your insurance policies or medical record  </div>"
        },

        {
            input_name: "Sex",
            name: "sex",
            include_in_intake: false,
            input_type: "text",
            required: false,
            discription: "<div style='font-size:14px;'><em> Help Text Displayed:</em> This field may be used for submitting claims to your insurance provider. Please ensure the sex you provide here matches what your insurance provider has one file or what is indicated on your midical record</div>"

        },
        {
            input_name: "Personal Health Number",
            name: "personal-health-number",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Guardian",
            name: "guardian",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Emergency Contact",
            name: "emergency-contact",
            include_in_intake: false,
            input_type: "number",
            required: false,

        },
        {
            input_name: "Family Doctor",
            name: "family-doctor",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Name of referring Professional",
            name: "referring-professional",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Occupation",
            name: "occupation",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Employer",
            name: "employer",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "How did you hear about us?",
            name: "how did you hear about us?",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Who were you referred to?",
            name: "who were you referred to?",
            include_in_intake: false,
            input_type: "text",
            required: false,

        },
        {
            input_name: "Yes, I would like to receive news and special promotions by email",
            name: "yes, I would like to receive news and special promotions by email",
            include_in_intake: false,
            input_type: "text",
            required: false,
        }
    ];

const automaticOrManual = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' },
];

const initialConsent =  { name: "", text: "",type:"must agree", declaration : "" };



    const [qutionaryFields, setQutionaryFields] = useState([]);
    const [editModel, setEditModel] = useState({ name: "", index: "" });
    const topModelRef = useRef(null);
    const [changes, setChanges] = useState(false)
    const sigCanvasRef = useRef(null);
    const [drawSignarure, setDrawSignarure] = useState();
    const canvasRef = useRef(null);
    const [optionModel, setOptionModel] = useState(false);
    const [inputHover, setInputHover] = useState(null);
    const [templateTabsPopup, setTemplateTabsPopup] = useState(0);
    const [questionnaireForms, setQuestionnaireForms]=useState()
    const [chartEntriesData, setChartEntriesData]=useState()
    const [editId, setEditId]=useState(null)
    const [intakeFormData, setIntakeFormData] = useState({
        form_data: {
            profile_fields: profile_fields,
            questionnaires:[],
            consents:{
            signature:false,
            consentForms: [initialConsent]}},
        employee_id: authUserState?.user?.id,
        prompt_type: "automatic",
        valid_for: "forever"
    });

    const [edittitle, setEditTitle] = useState(false)
    const [title, setTitle] = useState("Chart Entry")
    const billingInfoRef = useRef(null);
    const handleItemClick = (name, index) => {
        if(!editId){
        setEditModel({ name, index });
        setTimeout(() => {
            openModalFromParent();
        }, 0)
    }
    }


    useEffect(() => {
        if (selectedEmployeeData) {
            const today = new Date().toLocaleDateString();
            setTitle(`${selectedEmployeeData.name} - ${today}`);
        }
    }, [selectedEmployeeData]); 

    const openModalFromParent = () => {
        if (topModelRef.current && typeof topModelRef.current.openModal === 'function') {
        topModelRef.current.openModal();
        } else {
        console.error('openModal is not a function or topModelRef.current is not set');
        }
        setChanges(false);
    };

    const handleEditField = (field,index) => {
    handleItemClick(field, index)
    };
    
    const handleRemoveField = (index) => {
    handleDeleteField(index);
    };
    
    const handleDownField = (index,length) => {
    if(index < length-1){
        const upadtedValue = [...qutionaryFields];
        const temp = upadtedValue[index]
        upadtedValue[index] = upadtedValue[index+1]
        upadtedValue[index+1]=temp
        setQutionaryFields(upadtedValue)
    }
    };
    
    const handleUpField = (index) => {
    if (index > 0) {
        const updatedValue = [...qutionaryFields];
        const temp = updatedValue[index];
        updatedValue[index] = updatedValue[index - 1];
        updatedValue[index - 1] = temp;
        setQutionaryFields(updatedValue);
    }
    };

  // delete input field
const handleDeleteField = (index) => {
confirmAlert({
    title: "Delete Field",
    message: `Are you sure Delete this Field ?`,
    buttons: [
    {
        label: "Yes",
        onClick: () => {
        setQutionaryFields((prev) => {
            const updatedFields = [...qutionaryFields];
            updatedFields.splice(index, 1);
            return updatedFields;
        });
        closeModel();

            if(qutionaryFields.length > 0 ){
                setChanges(true)
            }else{
                setChanges(false)
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

const closeModel = () => {
    if (topModelRef.current && typeof topModelRef.current.closeModal === 'function') {
    topModelRef.current.closeModal();
    } else {
    console.error('closeModal is not a function or topModelRef.current is not set');
    }
};

  // Change input Field Data Changes
const handleChange = (key, value, index) => {
setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    return updatedFields;
});
setChanges(true);
};

const fonts = [
    { label: "text", class: "pinyon-script-regular" },
    { label: "text", class: "great-vibes-regular" },
    { label: "text", class: "herr-von-muellerhoff-regular" },
];

const saveSignature = () => {
    if (sigCanvasRef.current) {
    const base64Signature = sigCanvasRef.current.toDataURL();
    setDrawSignarure(base64Signature);
    }
};

// Option Values Changes for DropDown, Range, CheckBox
const handleOptionsChange = (objIndex, optionIndex, key, value) => {
    setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    const copyObj = [...updatedFields[objIndex]?.value];
    copyObj[optionIndex] = { ...copyObj[optionIndex], [key]: value };
    updatedFields[objIndex] = { ...updatedFields[objIndex], value: copyObj };
    return updatedFields;
    });
    setChanges(true);
};

const createQutionaryFields = (intialFieldName) => {
    setQutionaryFields((prev) => [
        ...prev,
        { ...qutionaryInputs[intialFieldName], id: qutionaryFields.length + 1 },
    ]);
};

  const handleSave = () => {
    console.log("Save button clicked");
  };

    // close Model in Buttons
const closeModalFromParent = (input) => {
    if (changes) {
    confirmAlert({
        title: "Discard Changes",
        message: `Are you sure Delete ?`,
        buttons: [
        {
            label: "Yes",
            onClick: () => {
            setQutionaryFields((prev) => {
                const updatedData = [...prev];
                updatedData[editModel?.index] = qutionaryInputs[input];
                return updatedData;
            });
            closeModel();
            },
        },
        {
            label: "No",
            onClick: () => {},
        },
        ],
    });
    } else {
    closeModel();
    }
};

// Add options for Dropdown, range, Checkboxes
const addOption = (input, objIndex, optionIndex) => {
setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    const copyValue = [...updatedFields[objIndex]?.value];
    copyValue.splice(optionIndex, 0, { label: `new ${input}`, value: false });
    updatedFields[objIndex] = {
    ...updatedFields[objIndex],
    value: copyValue,
    };
    return updatedFields;
});
};

// Delete options for Dropdown, range, CheckBox
const deleteOption = (objIndex, optionIndex) => {
setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    const copyValue = [...updatedFields[objIndex].value];
    copyValue.splice(optionIndex, 1);
    updatedFields[objIndex] = {
    ...updatedFields[objIndex],
    value: copyValue,
    };
    return updatedFields;
});
};

const handleAppointmentClick = (form) => {
    if (selectedAppointment === form) {
        setSelectedAppointment(null);
    } else {
    setSelectedAppointment(form);
    setTimeout(() => {
        billingInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    }
};

let confirmationInProgress = false;

const fetchPaymentConfirmation = async (retrievedSessionId) => {
    if (confirmationInProgress) return;
    confirmationInProgress = true;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const response = await confirmPayment(retrievedSessionId, urlParams.get('schedule_id'));

        if (response.status === 'success') {
            toast.success('Payment confirmed successfully')
            setReload(prev => !prev);
        } else {
            toast.error('Payment confirmation failed:', response);
        }
    } catch (error) {
        toast.error('Error confirming payment:', error);
    }
    window.history.replaceState({}, document.title, `${window.location.pathname}?tab=Appointments`);

};

useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('payment_success');
    const retrievedSessionId = urlParams.get('session_id');

    if (success && retrievedSessionId) {
        fetchPaymentConfirmation(retrievedSessionId);
    }
}, []);

const confirmToAddTemplate = (templateId) => {
    confirmAlert({
    customUI: ({ onClose }) => {
        return (
            <div className='custom-ui p-4 shadow-lg'>
                <h3>This Template Cotains O inadmissible item</h3>
                <p>Are you sure you want to add this template</p>
                <div className="flex gap-4 justify-end">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary"
                        onClick={() => {
                            templateData(templateId);
                            onClose();
                        }}
                    >
                        Admissible 
                    </button>
                </div>
            </div>
        );
    }
    });
}

const templateData = async (templateId) => {
    try {
        const response = await getQuestionnaire(templateId, true);    
        // if (authUserState?.user?.is_admin ||(authUserState?.user?.id === response?.data?.employee?.id)) {
            if (response.status === 200) {
                    setIntakeFormData((prev) => {
                    return {
                        ...prev,
                        form_data: {
                        ...prev?.form_data,
                        questionnaires: response.data?.template?.qutionaryFields
                        }
                    };
                })
                setQutionaryFields((prev) => {
                    const updatedData = [
                        ...prev,
                        ...response?.data?.template?.qutionaryFields,
                    ];
                    return updatedData;
                });
            
              // setQutionaryFields(response?.data?.template?.qutionaryFields);
            } else {
        }
        // }else{
        //   navigate('/intake-forms')
        //   toast.error("You don't have permission to edit this intake form");
        // }
    } catch (err) {}
};

const addTitle = (title) =>{
    setTitle(title)
}

const handleCreateChartEntries = () => {
    if(!title){
        toast.error("Name can't be blank")
    }
    else if(qutionaryFields.length === 0){
        toast.error("Select any fields")
    }
    else{
        createChartEntries({name:title,
            employee_id:authUserState?.user?.id,
            client_id:selectedEmployeeData?.id,
            chart_histroy:{formData:qutionaryFields}})
            setTimeout(()=>{ getChartEntriess();setChartTab("chart_entries_list")},500)
    }
   
}

//Return to Charts Discard Fucntion

const handleUndoField = (index) => {
    if(qutionaryFields.length > 0){
        confirmAlert({
            title: "Discard Changes",
            message: `Are you sure discard this changes ?`,
            buttons: [
            {
                label: "Yes",
                onClick: () => {
                    setChartTab("chart_entries_list"); 
                    setQutionaryFields([]); 
                    setEditId(null);
               
                },
            },
            {
                label: "No",
                onClick: () => {},
            },
            ],
        });
    }
    else{
        setChartTab("chart_entries_list"); 
        setQutionaryFields([]); 
        setEditId(null);
    }
    };

const getChartEntriess = async() =>{
    try{
        const response = await getChartEntries(authUserState?.user?.id,selectedEmployeeData?.id)
        if(response?.status === 200){
            setChartEntriesData(response?.data)
        }
        else{
            toast.error("Something went wrong")
        }
    }   
    catch (err) {
        console.error(err);
    }
}

useEffect(()=>{
    if(selectedEmployeeData){
        getChartEntriess();
    }
},[selectedEmployeeData])

const getChartEntryData = async(editId) =>{
    try{
        const response = await getChartEntry(editId)
        if(response?.status === 200){
            setQutionaryFields(response?.data?.chart_histroy?.formData)
            setTitle(response?.data?.name)
        }
        else{
            toast.error("Something went wrong")
        }
    }   
    catch (err) {
        console.error(err);
    }
}

useEffect(()=>{
    if(editId){
        getChartEntryData(editId)
    }
},[editId])

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
        navigate(`/customers/${emp.id}?${queryParams?.toString()}`);
        setSelectedEmployeeData(emp);
        setRadioTabs([]);
        setUpdateEmployeeInput({});
        setCurrentTab(
        emp.is_admin 
            ? "invoice" 
            : (queryParams.get('payment_success') === 'true' || queryParams.get('tab') === 'Appointments'
            ? "Appointments" 
            : queryParams.has('session_id') 
                ? "Billing" 
                : "profile")
        );
        let addTabs = [
            // {
            //     name: "Invoices",
            //     value: "invoice",
            //     // data: getRequestInventoryData,
            // },
            // { name: "Chart Entries",value: "chart_entries"}
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
            addTabs.push({ name: "Forms", value: "Forms" });
            addTabs.push({ name: "Appointments", value: "Appointments" });
            addTabs.push({ name: "Billing", value: "Billing" });
            addTabs.push({ name: "Messages", value: "Messages" });
            addTabs.push({ name: "Files", value: "Files" });
            addTabs.push({ name: "Groups", value: "Groups" });

        }
        addTabs.splice(3,0,{ name: "Chart Entries",value: "chart_entries"})
        setRadioTabs(addTabs);
        setIsDrawerOpen(false);
        setSelectedAppointment(null);
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

    const handleNavigation=(clientData,type)=>{
        navigate(`/client-profile-update/${clientData.id}/${type}`)
    };

    const handleAddNewClient=(clientData)=>{
        navigate(`/add-new-client`)
    };

    const handleClientProfileFlipCard=()=>{
        setCurrentTab("Appointments");
    };

    const handleSearchClients = (event) => {
        setSearchedClients([])
        setSearchQuery(event.target.value)
        const timer = setTimeout(() => {
            setSearchedClients(filteredEmployeeList)
        }, 1000);
        return () => clearTimeout(timer);
    };

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [showBookingInfo, setShowBookingInfo] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [showBillingInfo, setShowBillingInfo] = useState(false);
    const [isAddingNote, setIsAddingNote] = useState(false);

    const toggleDrawer = async () => {
        if (selectedAppointment) {
            try {
                const { clientSecret } = await createCheckoutSession(
                    selectedEmployeeData.id,
                    selectedAppointment.id,
                    selectedAppointment.remaining_amount,
                    selectedEmployeeData.stripe_id
                );
                
        
                if (clientSecret) {
                    setClientSecret(clientSecret);
                    setIsDrawerOpen(true);
                }
            } catch (error) {
                toast.error("Error creating checkout session:", error);
            }
        }
    };

    const getStatus = (totalAmount, remainingAmount) => {
        if(totalAmount === remainingAmount) return 'Unpaid'
        if(remainingAmount === 0) return 'Paid'
        return 'Partially Paid'
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
                        <div className="border-t-2  py-2 bg-white h-[70vh]">
                            <h1 className="text-xl flex gap-x-2 items-center justify-center">
                                Clients <ChevronDown />
                            </h1>
                            <div className="flex h-[59vh] flex-col pl-2 gap-4 overflow-y-auto border">
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
                        <Button
                            onClick={handleAddNewClient}
                            variant="info"
                            className="w-full text-white"
                            >
                            + Add Client
                        </Button>
                    </>
                }
            >
                <div className="flex-1 border p-3 h-[89vh] overflow-scroll" key={selectedEmployeeData?.name}>
                    {selectedEmployeeData && (
                        <div className=" p-3 sm:p-10">
                            <h1 className="text-3xl font-bold">
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
                                className={`sm:p-0 rounded-b-lg ${currentTab === "staff" ? "" : "bg-transparent"
                                    } `}
                            >
                                {currentTab === "profile" && (
                                        <ClientProfile clientProfileData={selectedEmployeeData} handleClientProfileFlipCard={handleClientProfileFlipCard} handleSearchClients={handleSearchClients} searchQuery={searchQuery} searchedClients={searchedClients} handleNavigation={handleNavigation}/>
                                )}

                                {currentTab === "Billing" && (
                                    <ClientBilling stripeClientId={selectedEmployeeData?.stripe_id} clientId={selectedEmployeeData?.id} />
                                )}

                                {currentTab === "Appointments" && (
                                    <div className="flex bg-white min-h-screen">
                                        <div className="flex-grow bg-gray-200 p-3 px-4">
                                            <div className="w-full mx-auto h-full bg-white rounded-md px-6 py-1 pb-4 lg:px-16">
                                                <div className="flex justify-between items-center w-full h-[100px] text-gray-500">
                                                    <h2><span>Appointment Details</span></h2>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <div className="flex flex-col gap-3">
                                                        {Array.isArray(selectedClientSchedules) && selectedClientSchedules.map((form, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex flex-col gap-2 border rounded-lg overflow-hidden"
                                                                onClick={() => handleAppointmentClick(form)}
                                                            >
                                                                <div className="p-1 flex flex-col justify-start py-2 px-3 bg-slate-50 hover:bg-blue-50 duration-300">
                                                                    <div className="flex justify-between p-3">
                                                                        <div>Treatment: <span className="text-blue-500">{form?.treatment?.name}</span></div>
                                                                        <div>Client: <span className="text-blue-500">{form?.client?.name}</span></div>
                                                                    </div>
                                                                    <div className="flex justify-between p-3">
                                                                        <div>Location: <span className="text-blue-500">{form?.location?.name}</span></div>
                                                                        <div>
                                                                            Time:
                                                                            <span className="text-blue-500">
                                                                                {new Date(form?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} -
                                                                                {new Date(form?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-2 p-3">
                                                                        <span>Transaction Details</span>
                                                                        <div className="flex gap-4">
                                                                            <div className="flex flex-col gap-1">
                                                                                <span>Total Amount</span>
                                                                                <span className="text-blue-500">{parseFloat(form?.total_amount)}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1">
                                                                                <span>Paid Amount</span>
                                                                                <span className="text-blue-500">{parseFloat(form?.paid_amount)}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1">
                                                                                <span>Remaining Amount</span>
                                                                                <span className="text-blue-500">{parseFloat(form?.remaining_amount)}</span>
                                                                            </div>
                                                                            <div className="flex flex-col gap-1">
                                                                                <span>Status</span>
                                                                                <span className="text-blue-500">{getStatus(parseFloat(form?.total_amount), parseFloat(form?.remaining_amount))}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedAppointment && (
                                            <div className="w-full lg:w-1/4 bg-gray-100 p-4" ref={billingInfoRef}>
                                                <div className="mt-4">
                                                    <button
                                                        className="flex justify-between w-full rounded"
                                                        onClick={() => setShowBookingInfo(!showBookingInfo)}
                                                    >
                                                        <span className="text-xl text-[#22D3EE]">Booking Info</span>
                                                        <ChevronDown className={`transform ${showBookingInfo ? "rotate-180" : ""}`} style={{ color: '#22D3EE' }} />
                                                    </button>
                                                    {showBookingInfo && (
                                                        <div className="border rounded-lg bg-white mt-2 py-2">
                                                            <span className="px-2"><strong>Client:</strong></span><br />
                                                            <span className="px-2">{selectedAppointment?.client?.name}</span><br />
                                                            <span className="px-2">{selectedAppointment?.client?.email}</span>
                                                            <hr className="my-2" />
                                                            <span className="px-2"><strong>Location:</strong></span><br />
                                                            <span className="px-2">{selectedAppointment?.location?.name}</span>
                                                            <hr className="my-2" />
                                                            <span className="px-2"><strong>Time:</strong></span><br />
                                                            <p className="px-2 font-medium">
                                                                {new Date(selectedAppointment?.start_time).toLocaleDateString([], {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                                <br />
                                                                {new Date(selectedAppointment?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} -
                                                                {new Date(selectedAppointment?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                            </p>
                                                            <hr className="my-2" />
                                                            <span className="px-2"><strong>Treatment:</strong></span>
                                                            <br />
                                                            <span className="px-2 ">{selectedAppointment?.treatment?.name} - <span className="font-semibold"> ${selectedAppointment?.total_amount}</span></span>
                                                            <br />
                                                            <span className="px-2 ">{selectedAppointment?.employee?.name}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4">
                                                    <button
                                                        className="flex justify-between w-full rounded"
                                                        onClick={() => setShowNotes(!showNotes)}
                                                    >
                                                        <span className="text-xl text-[#22D3EE]">Notes</span>
                                                        <ChevronDown className={`transform ${showNotes ? "rotate-180" : ""}`} style={{ color: '#22D3EE' }} />
                                                    </button>
                                                    {showNotes && (
                                                        <div className="border p-2 rounded-lg bg-white mt-2">
                                                            <div className="mt-4">
                                                                <textarea
                                                                    className="w-full p-2 border rounded"
                                                                    placeholder="Write a note..."
                                                                    rows="3"
                                                                    onFocus={() => setIsAddingNote(true)}
                                                                ></textarea>
                                                            </div>

                                                            {isAddingNote && (
                                                                <div className="flex justify-end mt-2">
                                                                    <button
                                                                        className="text-gray-500 py-1 px-4 rounded"
                                                                        onClick={() => {
                                                                            setIsAddingNote(false);
                                                                        }}
                                                                    >
                                                                        Close
                                                                    </button>
                                                                    <button
                                                                        className="bg-[#22D3EE] text-white py-1 px-4 rounded hover:bg-[#1cb3cd]"
                                                                        onClick={() => {
                                                                            console.log("API for adding the note will be handled later");
                                                                            setIsAddingNote(false);
                                                                        }}
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>


                                                <div className="mt-4">
                                                    <button
                                                        className="flex justify-between w-full rounded"
                                                        onClick={() => setShowBillingInfo(!showBillingInfo)}
                                                    >
                                                        <span className="text-xl text-[#22D3EE]">Billing Info</span>
                                                        <ChevronDown className={`transform ${showBillingInfo ? "rotate-180" : ""}`} style={{ color: '#22D3EE' }} />
                                                    </button>
                                                    {showBillingInfo && (
                                                        <div className="border rounded-lg bg-white pt-2">
                                                            <div className="flex justify-between px-2 pt-2">
                                                                <div>
                                                                    <span className="font-semibold pt-4">Status: </span>
                                                                    <span className="text-green-500">{getStatus(parseFloat(selectedAppointment?.total_amount), parseFloat(selectedAppointment?.remaining_amount))}</span>
                                                                </div>

                                                                <button
                                                                    className="flex text-[#22D3EE] rounded"
                                                                >
                                                                    Add Item
                                                                    <Plus />
                                                                </button>
                                                            </div>
                                                            <hr className="my-2" />
                                                            <div className="flex justify-between px-2">
                                                                <div>
                                                                    <span className="font-semibold">{selectedAppointment.treatment?.name}</span>
                                                                </div>
                                                                <div>
                                                                    <span>${selectedAppointment.total_amount}</span>
                                                                </div>
                                                            </div>
                                                            <hr className="m-2" />
                                                            <div className="flex justify-between px-2">
                                                                <div>
                                                                    <span>Subtotal</span>
                                                                    <br />
                                                                    <span>Total</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span>${selectedAppointment.total_amount}</span>
                                                                    <br />
                                                                    <span><strong>${selectedAppointment.total_amount}</strong></span>
                                                                </div>
                                                            </div>
                                                            <hr className="m-2" />
                                                            <div className="flex justify-between px-2">
                                                                <div>
                                                                    <span className="font-semibold">Invoice # </span>
                                                                    {selectedAppointment?.payment_intent_id && (
                                                                        <a 
                                                                            href={`https://dashboard.stripe.com/payments/${selectedAppointment.payment_intent_id}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className="text-blue-500 hover:underline"
                                                                        >
                                                                            {selectedAppointment.payment_intent_id.slice(0, 6) + '...'}
                                                                        </a>
                                                                    )}
                                                                    <br />
                                                                    <span>Total</span>
                                                                    <br />
                                                                    <span>Balance</span>
                                                                    <br />
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[#22D3EE]">{selectedAppointment.status}</span>
                                                                    <br />
                                                                    <span>${selectedAppointment.total_amount}</span>
                                                                    <br />
                                                                    <span>${selectedAppointment.remaining_amount}</span>
                                                                    <br />
                                                                </div>
                                                            </div>

                                                            <div className="flex p-2 gap-x-2">
                                                                {selectedAppointment.remaining_amount > 0 && (
                                                                    <>
                                                                        <button
                                                                            className="flex items-center bg-[#22D3EE] text-white py-2 px-4 rounded hover:bg-[#1cb3cd] gap-x-2"
                                                                            onClick={() => console.log('Adjustment button clicked')}
                                                                        >
                                                                            <span>Adjustment</span>
                                                                            <Plus />
                                                                        </button>
                                                                        <button
                                                                            className="flex items-center bg-[#22D3EE] text-white py-2 px-2 rounded hover:bg-[#1cb3cd] gap-x-2"
                                                                            onClick={toggleDrawer}
                                                                        >
                                                                            <span>Pay</span>
                                                                            <MoveRight />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="bg-[#f5f5f5] min-h-8 px-6 py-2">
                                                                <div className="flex justify-end gap-8">
                                                                    <div>
                                                                        <span className="font-semibold text-md">Client Total</span>
                                                                        <br />
                                                                    </div>
                                                                    <div>
                                                                        <span className="font-semibold">${selectedAppointment.total_amount}</span>
                                                                        <br />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className={`fixed top-0 right-0 h-full overflow-y-auto w-full lg:w-1/2 z-10 bg-white shadow-lg p-6 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                                            <div className="flex justify-end items-center mb-4 pt-20">
                                                <button
                                                    className="text-gray-500 hover:text-red-500 focus:outline-none"
                                                    onClick={() => {
                                                        setIsDrawerOpen(false);
                                                        setClientSecret(null);
                                                    }}
                                                    aria-label="Close drawer"
                                                >
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            {clientSecret ? (
                                                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                                                    <EmbeddedCheckout />
                                                </EmbeddedCheckoutProvider>
                                            ) : (
                                                <p>Loading payment details...</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentTab === "Forms" && (
                                    // navigate("/submited-intake-forms-preview")
                                    <SubmitedClientIntakeForm clientId={selectedEmployeeData?.id}/>
                                )}
                                {currentTab === "chart_entries" && (
                            <div className="">
                                {/* ---------- */}
                                <div className=" rounded-md  flex justify-center">
                                <div className="w-100 bg-white">
                                {chartTab === "chart_entries_list" && 
                                <div className=" p-4 pt-2">
                                    <div className="bg-white rounded-lg">
                                    <div className="flex justify-between items-center py-3">
                                        <h2 className="text-gray-500">Chart Entries List</h2>
                                        <div><div onClick={() => {setChartTab("create_new_chart_entries");}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Create New Chart Entry</div></div>
                                    </div>
                                    <div className=" flex flex-col gap-1 border p-3 rounded-lg ">
                                        <div className={`flex justify-between p-3 border-b `}>
                                            <div>Name</div>
                                            <div className="text-right">Client Name</div>
                                        </div>
                                        {Array.isArray(chartEntriesData) && chartEntriesData.map((template, i) => (
                                        <div onClick={()=>{setChartTab("create_new_chart_entries"); setEditId(template?.id); setChanges(false)}}  key={i} className={`grid grid-cols-[1fr] gap-4 border rounded-md`}>
                                            <div className="flex flex-col w-full">
                                                <div className="flex justify-between p-3 border-b bg-[#f3f4f6]">
                                                    <div className="flex items-center">
                                                    <div>
                                                        <div className="text-[20px]">{template?.name}</div>
                                                    </div>
                                                    </div>
                                                    <div className="self-center grid grid-cols-[1fr] gap-1 pt-1 text-[15px] text-right">
                                                        {template?.client?.name}
                                                    {/* <Link className="text-black" to="#"><button className="bg-white border border-gray-900 px-2 py-1  rounded-md" onClick={() => {setChartTab("create_new_chart_entries");}}>Duplicate</button></Link>
                                                    {((authUserState?.user?.is_admin) === true || (authUserState?.user?.id === template?.employee?.id)) && (
                                                    <button className="bg-[#22d3ee] px-2 py-1 text-white  rounded-md" onClick={() => {setChartTab("create_new_chart_entries");}}>Edit</button>
                                                    )} */}
                                                    </div>
                                                </div>
                                                <div className="p-3 line-clamp-3 max-h-[90px]">
                                                    {template?.chart_histroy?.formData.find(field => field.type === "textarea")?.value}
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                    </div>
                                </div>}
                                {chartTab === "create_new_chart_entries" &&
                                    <div className="p-3 flex flex-col gap-2">
                                    <div className="text-gray-500 flex justify-between">
                                    <div>
                                        <div className={`flex gap-3 items-center ${edittitle ? "hidden": "block"}`}>
                                        <h2>{title}</h2>
                                        {!editId && <div onClick={()=>{setEditTitle(true)}}><FaRegEdit /></div>}
                                        </div>
                                        {!editId && <div  className={`flex gap-3 items-center ${!edittitle ? "hidden": "block"}`}>
                                        <input type="text" value={title} onBlur={()=>{setEditTitle(false)}} onChange={(e)=>{setTitle(e?.target?.value); setChanges(true)} } placeholder="Title " className="text-[30px] focus:outline-none border-b" />
                                        </div>}
                                    </div>
                                        <div className="flex items-center">
                                        <div className="flex gap-2">
                                        <div className="relative">
                                            {optionModel && (
                                            <div className="bg-gray-100 duration-200 rounded-md absolute z-10 top-[42px] right-[0px] w-[200px] h-[200px] overflow-y-auto">
                                                <div className="py-1">
                                                {Array.isArray(qutionaryInputOption) &&
                                                    qutionaryInputOption.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => {
                                                        createQutionaryFields(option?.field);
                                                        setChanges(true)
                                                        setOptionModel(false);
                                                        }}
                                                        className="grid grid-cols-[1fr,auto] px-2 hover:bg-white duration-300 py-[5px]"
                                                    >
                                                        <div className="text-[15px]">{option?.label}</div>
                                                        <div className="text-[18px]">{option?.icon}</div>
                                                    </div>
                                                    ))}
                                                </div>
                                            </div>
                                            )}
                                            {!editId &&<div className="flex justify-between items-center w-full">
                                            <div className="flex bg-[#0dcaf0] text-white rounded-md">                    
                                            <button
                                                type="button"
                                                className="whitespace-nowrap flex gap-2 justify-center items-center  px-4 py-[8px] rounded-md"
                                                onClick={() => {
                                                    setOptionModel(!optionModel);
                                                }}
                                                >
                                                Add Item
                                                </button>
                                            </div>
                                            </div>}
                                        </div>
                                        <div
                                            onClick={() => {
                                                if (editId) {
                                                setChartTab("chart_entries_list");
                                                setQutionaryFields([]);
                                                setEditId(null);
                                                } else {
                                                handleUndoField();
                                                }
                                            }}
                                            className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 flex items-center bg-white rounded-md"
                                            >
                                            Return to Chart Entries List
                                            </div>

                                        </div>
                                        </div>
                                    </div>
                                    <div>
                                        {/* ------------------------------------------- */}
                                        <div className=" ">
                                    <div className="bg-white  px-3 py-2">
                                    <div className=" py-3 flex flex-col gap-4">
                                        {Array.isArray(qutionaryFields) &&
                                        qutionaryFields.map((field, index) =>
                                            field?.type === "textarea" ? (
                                            <span key={index}>
                                                {/* Note */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex justify-between items-center py-1">
                                                    <div className="font-semibold text-[17px]"onClick={() => {
                                                    // setEditModel({ name: "initialNote", index: index });
                                                    // openModalFromParent();
                                                    handleItemClick('initialNote', index)
                                                }}>
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&  <div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialNote',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div className="border rounded-md overflow-hidden border-black p-1 bg-white ">
                                                    <textarea
                                                    className="w-full focus:outline-none"
                                                    required={field?.required}
                                                    value={qutionaryFields[index]?.value}
                                                    onChange={(e) => {
                                                        handleChange("value", e?.target?.value, index);
                                                    }}
                                                    style={{resize:"none"}}
                                                    rows="3"
                                                    onSelect={(event) => {
                                                        const { selectionStart } = event.target;
                                                        setCursorPosition(selectionStart);
                                                      }}
                                                            ></textarea>
                                                            <div className="d-flex justify-content-end align-items-center cursor-pointer pr-3" >
                                                                {
                                                                     showSymbol === index ?
                                                                     <h6 style={{gap:"10px",color:"rgb(13 202 240)"}} className="d-flex justify-content-center align-items-center " onClick={()=>{setShowSymbol(null)}}><IoIosArrowUp />Hide Symbol</h6>:
                                                                     <h6 style={{gap:"10px",color:"rgb(13 202 240)"}} className="d-flex justify-content-center align-items-center" onClick={()=>{setShowSymbol(index)}}><IoIosArrowDown />Show Symbol</h6>
                                                                }
                                                            </div>
                                                            {
                                                                showSymbol === index &&
                                                                <div className="bg-light">
                                                                    <div className="mt-2 d-flex gap-[25px] px-4">
                                                                            {symbols.map((symbol, i) => (
                                                                                <div xs="auto" key={i} className="mb-2 cursor-pointer">
                                                                                    <div style={{ fontSize: "22px" }} onClick={() => {

                                                                                        const newText =
                                                                                            qutionaryFields[index]?.value.substring(0, cursorPosition) +
                                                                                            symbol +
                                                                                            qutionaryFields[index]?.value.substring(cursorPosition);
                                                                                    handleChange("value", newText, index);
                                                                                    
                                                                                    }}>
                                                                                    {symbol}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            }
                                                </div>
                                                </div>
                                            </span>
                                            ) : field?.type === "signature" ? (
                                            <>
                                                {/* Signature */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex justify-between items-center">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        // setEditModel({ name: "initialSignature", index: index });
                                                        // openModalFromParent();
                                                        handleItemClick('initialSignature', index)
                                                    }}
                                                    >
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&<div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialSignature',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div>
                                                    <div className="flex justify-between py-1">
                                                    <div className="flex gap-3">
                                                        <div className="flex gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`sign${index}`}
                                                            readOnly={editId ? true : false}
                                                            checked={field?.sign_type === "draw"}
                                                            id="draw"
                                                            onChange={(e) => {handleChange("sign_type","draw",index)}}
                                                        />
                                                        <label htmlFor="draw" className="flex items-center">
                                                            Draw
                                                        </label>
                                                        </div>
                                                        <div className="flex gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`sign${index}`}
                                                            readOnly={editId ? true : false}
                                                            checked={field?.sign_type === "type"}
                                                            id="type"
                                                            onChange={(e) => {handleChange("sign_type","type",index)}}
                                                        />
                                                        <label htmlFor="type" className="flex items-center">
                                                            Type
                                                        </label>
                                                        </div>
                                                    </div>
                                                    {field?.sign_type === "type" && (
                                                        <div className="w-[300px]">
                                                        <DropDown
                                                            placeholder={"Select Font Style"}
                                                            options={fonts}
                                                            readonly={editId ? true : false}
                                                            onChange={(value) => {}}
                                                        />
                                                        </div>
                                                    )}
                                                    </div>
                                                    <div className="">
                                                    {field?.sign_type === "draw" ? (
                                                        <div className="flex gap-3 ">
                                                        <div className="border-b-[2px]">
                                                            <SignatureCanvas
                                                            penColor="black"
                                                            readOnly={editId ? true : false}
                                                            throttle={10}
                                                            maxWidth={2.2}
                                                            onEnd={() => {
                                                                saveSignature();
                                                                handleChange("sign", drawSignarure, index);
                                                            }}
                                                            ref={sigCanvasRef}
                                                            canvasProps={{
                                                                width: 400,
                                                                height: 70,
                                                                className: "sigCanvas",
                                                            }}
                                                            />
                                                        </div>
                                                        <div className="flex items-end">
                                                            <div className="flex gap-2 items-center text-[14px] text-[#0dcaf0]">
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => {}}
                                                                disabled={false}
                                                            >
                                                                <FaUndo />
                                                            </div>
                                                            <div className="text-gray-400">|</div>
                                                            <div
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                sigCanvasRef.current.clear();
                                                                }}
                                                            >
                                                                Clear
                                                            </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                        <div className="flex h-[70px]  gap-4">
                                                            <div className="flex items-end ">
                                                            <div className="border-b-[2px] w-[300px]">
                                                                <input
                                                                type="text"
                                                                placeholder="Enter your Signature"
                                                                className={` p-2 focus:outline-none w-full  px-2 h-[50px]`}
                                                                onChange={(e) => {}}
                                                                />
                                                            </div>
                                                            </div>
                                                            <canvas
                                                            ref={canvasRef}
                                                            width="500"
                                                            height="100"
                                                            style={{ display: "none" }}
                                                            ></canvas>
                                                        </div>
                                                        </>
                                                    )}
                                                    </div>
                                                </div>
                                                </div>
                                            </>
                                            ) : field?.type === "heading" ? (
                                            <>
                                                {/* Heading */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex justify-between items-center ">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        handleItemClick('initialHeading', index)
                                                    }}
                                                    >
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&<div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialHeading',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div className="text-[22px] py-2 font-medium">
                                                    {field?.value}
                                                </div>
                                                </div>
                                            </>
                                            ) : field?.type === "checkbox" ? (
                                            <>
                                                {/* Check Boxes */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex flex-col ">
                                                    <div className="flex justify-between items-center py-1">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        handleItemClick('initialCheckBox', index)
                                                    }}
                                                    >
                                                        {field?.label}
                                                    </div>
                                                    {!editId && <div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialCheckBox',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                    </div>

                                                    <div
                                                    className={`${
                                                        field?.layout === "horizontal"
                                                        ? "grid grid-cols-5"
                                                        : field?.layout === "vertical"
                                                        ? "grid grid-cols-1"
                                                        : "grid grid-cols-3"
                                                    }`}
                                                    >
                                                    {Array.isArray(field.value) &&
                                                        field.value.map((checkbox, i) => (
                                                        <div key={i} className="flex gap-2  items-center">
                                                            <input
                                                            readOnly={true}
                                                            disabled={editId ? true : false}
                                                            id={checkbox?.label}
                                                            required={field?.required}
                                                            checked={checkbox?.value}
                                                            onChange={(e) => {
                                                                handleOptionsChange(
                                                                index,
                                                                i,
                                                                "value",
                                                                e.target.checked
                                                                );
                                                            }}
                                                            type="checkbox"
                                                            />
                                                            <label htmlFor={checkbox?.label}>
                                                            {checkbox?.label}
                                                            </label>
                                                        </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                </div>
                                            </>
                                            ) : field?.type === "dropdown" ? (
                                            <>
                                                {/* Drop down */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex justify-between items-center ">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        handleItemClick('initialDropdown', index)
                                                    }}
                                                    >
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&<div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialDropdown',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div className="py-3">
                                                    <div className="w-[300px]">
                                                    <Select
                                                        inputId="availableEmployee"
                                                        isClearable
                                                        readOnly={editId ? true : false}
                                                        options={field?.value}
                                                        value={field?.value.find((option)=>option?.label === field?.values?.value )}
                                                        // onChange={(e) => {
                                                        //   handleChange("values",{value: e?.label}, index);
                                                        // }}
                                                        // readOnly={field?.read_only}
                                                        required={field?.required}
                                                    />
                                                    </div>
                                                </div>
                                                </div>
                                            </>
                                            ) : field?.type === "range" ? (
                                            <>
                                                {/* Range */}
                                                <div
                                                className="hover:bg-gray-100 rounded-md p-[6px] pb-6 flex flex-col gap-1 "
                                                >
                                                <div className="flex justify-between items-center ">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        handleItemClick('initialRange', index)
                                                    }}
                                                    >
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&<div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField('initialRange',index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                    type="range"
                                                    readOnly={editId ? true : false}
                                                    min={0}
                                                    max={field.value.length}
                                                    className="w-full"
                                                    value={field?.values?.value }
                                                    // onChange={(e) => {
                                                    //   handleChange("values", {value: field?.value[e.target.value]}, index
                                                    //   );
                                                    // }}
                                                    />
                                                    <div className=" grid grid-flow-col ">
                                                    {Array.isArray(field.value) &&
                                                        field?.value.map((option, i) => (
                                                        <div className="justify-self-end " key={i}>
                                                            <div className="flex justify-end">|</div>
                                                            <div className="relative">
                                                            <div className="absolute -top-[3px] -right-[2px]">
                                                                {" "}
                                                                {option?.label}
                                                            </div>
                                                            </div>
                                                        </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                </div>
                                            </>
                                            ) : field?.type === "instruction" ? (
                                            <>
                                                {/* Instructions */}
                                                <div
                                                className=" hover:bg-gray-100  rounded-md p-[6px] flex flex-col gap-1"
                                                >
                                                <div className="flex justify-between items-center  py-1">
                                                    <div className="font-semibold text-[17px]"
                                                    onClick={() => {
                                                        setEditModel({
                                                        name: "initialInstruction",
                                                        index: index,
                                                        });
                                                        openModalFromParent();
                                                    }}
                                                    >
                                                    {field?.label}
                                                    </div>
                                                    {!editId &&<div className="text-[20px] cursor-pointer flex gap-2 items-center group relative group">
                                                    <div className="bg-white flex gap-[25px] text-[16px] py-[4px] hidden px-[14px] rounded-[14px] group-hover:inline-flex ">
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleEditField(index)}}><FaRegEdit /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleRemoveField(index);}}><MdDelete /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e) => {e.stopPropagation();handleUpField(index,qutionaryFields.length);}}><FaLongArrowAltUp /></div>
                                                        <div className="hover:bg-slate-300 hover:text-white p-1 rounded-[50%]" onClick={(e)=>{e.stopPropagation();handleDownField(index,qutionaryFields.length)}}><FaLongArrowAltDown /></div>
                                                    </div>
                                                    <BsThreeDotsVertical />
                                                    </div>}
                                                </div>
                                                <div className="text-[18px] bg-white  rounded-lg pl-3 font-medium py-3">
                                                    <em>{field?.value}</em>
                                                </div>
                                                </div>
                                            </>
                                            ) : null
                                        )}
                                    </div>
                                        <div className="h-[calc(100%-50px)] overflow-y-auto">
                                        <div className="flex flex-col justify-between items-center h-[40vh]">
                                            <div className="flex justify-between gap-4">

                                            {!editId && <div className="flex bg-[#0dcaf0] text-white rounded-md">
                                                
                                                <button
                                                type="button"
                                                className="whitespace-nowrap flex gap-2 justify-center items-center  px-3 py-[8.5px] rounded-md"
                                                onClick={() => {
                                                    handleCreateChartEntries()
                                                }}
                                                >
                                                Save
                                                </button>
                                            </div>}
                                            {/* <div className="relative">
                                            {optionModel && (
                                            <div className="bg-gray-100 duration-200 rounded-md absolute z-10 -top-[200px] left-[30px] w-[200px] h-[200px] overflow-y-auto">
                                                <div className="py-1">
                                                {Array.isArray(qutionaryInputOption) &&
                                                    qutionaryInputOption.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => {
                                                        createQutionaryFields(option?.field);
                                                        setOptionModel(false);
                                                        }}
                                                        className="grid grid-cols-[1fr,auto] px-2 hover:bg-white duration-300 py-[5px]"
                                                    >
                                                        <div className="text-[15px]">{option?.label}</div>
                                                        <div className="text-[18px]">{option?.icon}</div>
                                                    </div>
                                                    ))}
                                                </div>
                                            </div>
                                            )}
                                            <div className="flex justify-between items-center w-full">
                                            <div className="flex bg-[#0dcaf0] text-white rounded-md">
                                                
                                                <button
                                                type="button"
                                                className="whitespace-nowrap flex gap-2 justify-center items-center  px-3 py-[8.5px] rounded-md"
                                                onClick={() => {
                                                    setOptionModel(!optionModel);
                                                }}
                                                >
                                                Add Item
                                                </button>
                                            </div>
                                            </div>
                                        </div> */}
                                            </div>
                                        </div>
                                        </div> 
                                    </div>
                                    {editModel?.name === "initialNote" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialNote");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div className="w-[400px] flex flex-col gap-3">
                                        <h3>Edit Note</h3>
                                        <div className="flex flex-col gap-2">
                                            <div>
                                            <label>Label</label>
                                            <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                type="text"
                                                className="w-full focus:outline-none"
                                                value={qutionaryFields[editModel?.index]?.label}
                                                onChange={(e) => {
                                                    handleChange("label", e?.target?.value, editModel?.index);
                                                }}
                                                />
                                            </div>
                                            </div>
                                            <div className="border-[2px] overflow-hidden  rounded-md px-2">
                                            <textarea
                                                className="w-full focus:outline-none resize-y"
                                                value={qutionaryFields[editModel?.index]?.value}
                                                onChange={(e) => {
                                                    handleChange("value", e.target.value, editModel?.index);
                                                }}
                                                rows="3"
                                            ></textarea>

                                            </div>
                                            <div className="flex justify-between py-1">
                                            <div>Required</div>
                                            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                            <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                );
                                                }}
                                                defaultChecked
                                            />
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialSignature" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialSignature");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div>
                                        <div className="w-[400px]">
                                            <h3>Edit Signature</h3>
                                            <div className="flex flex-col gap-2">
                                            <div>
                                                <label>Label</label>
                                                <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                    type="text"
                                                    className="w-full focus:outline-none"
                                                    value={qutionaryFields[editModel?.index]?.label}
                                                    onChange={(e) => {
                                                    handleChange(
                                                        "label",
                                                        e?.target?.value,
                                                        editModel?.index
                                                    );
                                                    }}
                                                />
                                                </div>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <div>Required</div>
                                                {/* <div><input type="radio" onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                                <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                    handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                    );
                                                }}
                                                defaultChecked
                                                />
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialHeading" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialHeading");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div>
                                        <div className="w-[400px]">
                                            <h3>Edit Heading</h3>
                                            <div className="flex flex-col gap-2">
                                            <div>
                                                <label>Label</label>
                                                <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                    type="text"
                                                    className="w-full focus:outline-none"
                                                    value={qutionaryFields[editModel?.index]?.label}
                                                    onChange={(e) => {
                                                    handleChange(
                                                        "label",
                                                        e?.target?.value,
                                                        editModel?.index
                                                    );
                                                    }}
                                                />
                                                </div>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <div>Required</div>
                                                {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} /></div> */}
                                                <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                    handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                    );
                                                }}
                                                defaultChecked
                                                />
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialCheckBox" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialCheckBox");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div className="w-[400px]">
                                        <h3>Edit Check Boxes</h3>
                                        <div className="flex flex-col gap-2">
                                            <div>
                                            <label>Label</label>
                                            <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                type="text"
                                                className="w-full focus:outline-none"
                                                value={qutionaryFields[editModel?.index]?.label}
                                                onChange={(e) => {
                                                    handleChange("label", e?.target?.value, editModel?.index);
                                                }}
                                                />
                                            </div>
                                            </div>
                                            <div>
                                            <label>Checkbox Layout</label>
                                            <div className="flex gap-4">
                                                <div className="flex gap-1">
                                                <input
                                                    type="radio"
                                                    id="horizontal"
                                                    name="Layout"
                                                    checked={
                                                    qutionaryFields[editModel?.index]?.layout ===
                                                    "horizontal"
                                                    }
                                                    onChange={(e) => {
                                                    handleChange("layout", "horizontal", editModel?.index);
                                                    }}
                                                />
                                                <label htmlFor="horizontal">Horizontal</label>
                                                </div>
                                                <div className="flex gap-1">
                                                <input
                                                    type="radio"
                                                    id="vertical"
                                                    name="Layout"
                                                    checked={
                                                    qutionaryFields[editModel?.index]?.layout === "vertical"
                                                    }
                                                    onChange={(e) => {
                                                    handleChange("layout", "vertical", editModel?.index);
                                                    }}
                                                />
                                                <label htmlFor="vertical">Vertical</label>
                                                </div>
                                                <div className="flex gap-1">
                                                <input
                                                    type="radio"
                                                    id="column"
                                                    name="Layout"
                                                    checked={
                                                    qutionaryFields[editModel?.index]?.layout === "column"
                                                    }
                                                    onChange={(e) => {
                                                    handleChange("layout", "column", editModel?.index);
                                                    }}
                                                />
                                                <label htmlFor="column">Column</label>
                                                </div>
                                            </div>
                                            </div>
                                            <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
                                            <div className="grid grid-cols-[15%,1fr,20%] items-center py-1 bg-gray-200">
                                                <div>Input</div>
                                                <div className="pl-4">Value</div>
                                                <div className="flex justify-center">Action</div>
                                            </div>
                                            <div className="top-model-table">
                                                {Array.isArray(qutionaryFields[editModel?.index]?.value) &&
                                                qutionaryFields[editModel?.index]?.value.map(
                                                    (option, i) => (
                                                    <div
                                                        key={i}
                                                        className="grid grid-cols-[15%,1fr,20%] items-center hover:bg-gray-100 py-[2px] group"
                                                    >
                                                        <div className="">
                                                        <input
                                                            type="checkbox"
                                                            id={option?.label}
                                                            checked={option?.value}
                                                            onChange={(e) => {
                                                            handleOptionsChange(
                                                                editModel?.index,
                                                                i,
                                                                "value",
                                                                e.target.checked
                                                            );
                                                            }}
                                                            className="w-[20%]"
                                                        />
                                                        </div>

                                                        <div
                                                        onMouseEnter={() => {
                                                            setInputHover(i);
                                                        }}
                                                        className=" py-[2px]  flex items-center"
                                                        onMouseLeave={() => {
                                                            setInputHover("");
                                                        }}
                                                        >
                                                        {inputHover === i ? (
                                                            <div className="flex items-center ">
                                                            <input
                                                                className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100"
                                                                type="text"
                                                                value={option?.label}
                                                                onChange={(e) => {
                                                                handleOptionsChange(
                                                                    editModel?.index,
                                                                    i,
                                                                    "label",
                                                                    e.target.value
                                                                );
                                                                }}
                                                            />
                                                            </div>
                                                        ) : (
                                                            <div htmlFor={option?.label}>{option?.label}</div>
                                                        )}
                                                        </div>

                                                        <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex ">
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                            addOption("checkbox", editModel?.index, i + 1);
                                                            }}
                                                        >
                                                            <IoMdAdd />
                                                        </div>
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                            deleteOption(editModel?.index, i);
                                                            }}
                                                        >
                                                            <MdDelete />
                                                        </div>
                                                        <div className="cursor-pointer">
                                                            <PiColumnsFill />
                                                        </div>
                                                        </div>
                                                    </div>
                                                    )
                                                )}
                                            </div>
                                            </div>
                                            <div className="flex justify-between">
                                            <div>Required</div>
                                            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                            <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                );
                                                }}
                                                defaultChecked
                                            />
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialDropdown" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialDropdown");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div className="w-[400px]">
                                        <h3>Edit Dropdown</h3>
                                        <div className="flex flex-col gap-2">
                                            <div>
                                            <label>Label</label>
                                            <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                type="text"
                                                className="w-full focus:outline-none"
                                                value={qutionaryFields[editModel?.index]?.label}
                                                onChange={(e) => {
                                                    handleChange("label", e?.target?.value, editModel?.index);
                                                }}
                                                />
                                            </div>
                                            </div>
                                            <div>
                                            <label>Default Value</label>
                                                <Select
                                                inputId="availableEmployee"
                                                isClearable
                                                options={qutionaryFields[editModel?.index]?.value}
                                                value={qutionaryFields[editModel?.index]?.value.find((option)=>option?.label === qutionaryFields[editModel?.index]?.values?.value)}
                                                onChange={(e) => {
                                                    handleChange("values", {value:e?.label}, editModel?.index);
                                                }}
                                                readOnly={qutionaryFields[editModel?.index]?.read_only}
                                                required={qutionaryFields[editModel?.index]?.required}
                                                />
                                            </div>
                                            <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
                                            <div className="grid grid-cols-[1fr,25%] items-center py-1 bg-gray-200">
                                                <div className="pl-4">Options</div>
                                                <div className="flex justify-center">Action</div>
                                            </div>
                                            <div className="top-model-table">
                                                {Array.isArray(qutionaryFields) &&
                                                qutionaryFields[editModel?.index]?.value.map(
                                                    (option, i) => (
                                                    <div
                                                        key={i}
                                                        className="grid grid-cols-[1fr,25%] items-center hover:bg-gray-100 py-[2px] group"
                                                    >
                                                        <div
                                                        onMouseEnter={() => {
                                                            setInputHover(i);
                                                        }}
                                                        className=" py-[2px]  flex items-center"
                                                        onMouseLeave={() => {
                                                            setInputHover("");
                                                        }}
                                                        >
                                                        {inputHover === i ? (
                                                            <div className="flex items-center ">
                                                            <input
                                                                className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100"
                                                                type="text"
                                                                value={option?.label}
                                                                onChange={(e) => {
                                                                handleOptionsChange(
                                                                    editModel?.index,
                                                                    i,
                                                                    "label",
                                                                    e.target.value
                                                                );
                                                                }}
                                                            />
                                                            </div>
                                                        ) : (
                                                            <div htmlFor={option?.label}>{option?.label}</div>
                                                        )}
                                                        </div>
                                                        <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex">
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => {
                                                            addOption("dropdown", editModel?.index, i + 1);
                                                            }}
                                                        >
                                                            <IoMdAdd />
                                                        </div>
                                                        <div className="cursor-pointer">
                                                            <MdDelete
                                                            onClick={() => {
                                                                deleteOption(editModel?.index, i);
                                                            }}
                                                            />
                                                        </div>
                                                        <div className="cursor-pointer">
                                                            <PiColumnsFill />
                                                        </div>
                                                        </div>
                                                    </div>
                                                    )
                                                )}
                                            </div>
                                            </div>
                                            <div className="flex justify-between py-2">
                                            <div>Required</div>
                                            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                            <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                );
                                                }}
                                                defaultChecked
                                            />
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialRange" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialRange");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div className="w-[400px]">
                                        <h3>Edit Range</h3>
                                        <div className="flex flex-col gap-2">
                                            <div>
                                            <label>Label</label>
                                            <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                type="text"
                                                className="w-full focus:outline-none"
                                                value={qutionaryFields[editModel?.index]?.label}
                                                onChange={(e) => {
                                                    handleChange("label", e?.target?.value, editModel?.index);
                                                }}
                                                />
                                            </div>
                                            </div>
                                            <div>
                                            <label>Default Value</label>
                                            <Select
                                                inputId="availableEmployee"
                                                isClearable
                                                options={qutionaryFields[editModel?.index]?.value}
                                                value={Array.isArray(qutionaryFields[editModel?.index]?.value) && qutionaryFields[editModel?.index]?.value?.find((option)=>option?.label === qutionaryFields[editModel?.index]?.values?.value)}
                                                onChange={(e) => {
                                                handleChange("values", {value:e?.label}, editModel?.index);
                                                }}
                                                readOnly={qutionaryFields[editModel?.index]?.read_only}
                                                required={qutionaryFields[editModel?.index]?.required}
                                            />
                                            </div>
                                            <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
                                            <div className="grid grid-cols-[1fr,25%] items-center py-1 bg-gray-200">
                                                <div className="pl-4">Options</div>
                                                <div className="flex justify-center">Action</div>
                                            </div>
                                            <div className="top-model-table">
                                                {Array.isArray(qutionaryFields) &&
                                                qutionaryFields[editModel?.index]?.value.map((option, i) => (
                                                    <div
                                                    key={i}
                                                    className="grid grid-cols-[1fr,25%] items-center hover:bg-gray-100 py-[2px] group"
                                                    >
                                                    <div
                                                        onMouseEnter={() => {
                                                        setInputHover(i);
                                                        }}
                                                        className=" py-[2px]  flex items-center"
                                                        onMouseLeave={() => {
                                                        setInputHover("");
                                                        }}
                                                    >
                                                        {inputHover === i ? (
                                                        <div className="flex items-center ">
                                                            <input
                                                            className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100"
                                                            type="text"
                                                            value={option?.label}
                                                            onChange={(e) => {
                                                                handleOptionsChange(
                                                                editModel?.index,
                                                                i,
                                                                "label",
                                                                e.target.value
                                                                );
                                                            }}
                                                            />
                                                        </div>
                                                        ) : (
                                                        <div htmlFor={option?.label}>{option?.label}</div>
                                                        )}
                                                    </div>

                                                    <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex">
                                                        <div
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            addOption("range", editModel?.index, i + 1);
                                                        }}
                                                        >
                                                        <IoMdAdd />
                                                        </div>
                                                        <div className="cursor-pointer">
                                                        <MdDelete
                                                            onClick={() => {
                                                            deleteOption(editModel?.index, i);
                                                            }}
                                                        />
                                                        </div>
                                                        <div className="cursor-pointer">
                                                        <PiColumnsFill />
                                                        </div>
                                                    </div>
                                                    </div>
                                                ))}
                                            </div>
                                            </div>
                                            <div className="flex justify-between py-2">
                                            <div>Required</div>
                                            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                            <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                );
                                                }}
                                                defaultChecked
                                            />
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "initialInstruction" && (
                                    <TopModel
                                        onSave={handleSave}
                                        ref={topModelRef}
                                        footer={
                                        <div className="flex justify-between gap-2">
                                            <button
                                            type="button"
                                            className="bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white"
                                            onClick={() => {
                                                handleDeleteField(editModel?.index);
                                            }}
                                            >
                                            <MdDelete />
                                            </button>
                                            <div className="flex gap-2">
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModalFromParent("initialInstruction");
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                type="button"
                                                className="bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white"
                                                onClick={() => {
                                                closeModel();
                                                }}
                                            >
                                                Save
                                            </button>
                                            </div>
                                        </div>
                                        }
                                    >
                                        <div>
                                        <div className="w-[400px]">
                                            <h3>Edit Instructions</h3>
                                            <div className="flex flex-col gap-2">
                                            <div>
                                                <label>Label</label>
                                                <div className="border-[2px] overflow-hidden py-1 rounded-md px-2">
                                                <input
                                                    type="text"
                                                    className="w-full focus:outline-none"
                                                    value={qutionaryFields[editModel?.index]?.value}
                                                    onChange={(e) => {
                                                    handleChange(
                                                        "value",
                                                        e?.target?.value,
                                                        editModel?.index
                                                    );
                                                    }}
                                                />
                                                </div>
                                            </div>
                                            <div className="flex justify-between">
                                                <div>Required</div>
                                                {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
                                                <Switch
                                                checked={qutionaryFields[editModel?.index]?.required}
                                                onChange={(e) => {
                                                    handleChange(
                                                    "required",
                                                    e?.target?.checked,
                                                    editModel?.index
                                                    );
                                                }}
                                                defaultChecked
                                                />
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}

                                    {editModel?.name === "gridModel" && (
                                    <TopModel ref={topModelRef}>
                                        <div className="w-[700px] flex flex-col">
                                        <div className="pb-2 border-b">
                                            <h4>Add Form Template Library</h4>
                                        </div>
                                        <div>
                                            <div className="h-[55px] flex items-end border-b-[2px] relative mt-2">
                                            <div className="flex w-full absolute bottom-[-2px]">
                                                {questionnaireTabs.map((tab, index) => (
                                                <div
                                                    key={index}
                                                    className={` tabs cursor-pointer ${
                                                    templateTabsPopup === tab.value
                                                        ? "selected-tab "
                                                        : "border-0"
                                                    }`}
                                                    onClick={() => {
                                                    setTemplateTabsPopup(tab.value);
                                                    }}
                                                >
                                                    <span>{tab.tab_name}</span>
                                                </div>
                                                ))}
                                            </div>
                                            </div>
                                            {templateTabsPopup === 0 && (
                                            <>
                                                <div className="h-[calc(100%-55px)] pb-3 border-b">
                                                <div className="grid grid-cols-3 gap-2 w-full px-3 pt-4 pb-2">
                                                    {Array.isArray(qutionaryInputOption) &&
                                                    qutionaryInputOption.map((option, i) => (
                                                        <div
                                                        key={i}
                                                        className={`grid grid-cols-[auto,1fr] shadow-sm rounded-md gap-4  p-[8px]`}
                                                        onClick={() => {
                                                            createQutionaryFields(option?.field);
                                                            setEditModel({
                                                            name: template?.field,
                                                            index: null,
                                                            });
                                                        }}
                                                        >
                                                        <div className="self-start pt-1">
                                                            <div className="text-[#0dcaf0] rounded-[50%] bg-slate-200 h-[45px] w-[45px] flex justify-center items-center">
                                                            {option?.icon}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <div>
                                                            <div className="text-[15px] text-gray-500 font-semibold pb-1">
                                                                {option?.label}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400 pb-1 font-medium">
                                                                {option?.description}
                                                            </div>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                </div>
                                                <div className="flex w-full justify-end py-2">
                                                <button
                                                    type="button"
                                                    className=" px-4 py-2 text-black text-[16px] border-[1px] border-[#cccccc] shadow-md rounded-md"
                                                    onClick={() => {
                                                    closeModel();
                                                    }}
                                                >
                                                    Close
                                                </button>
                                                </div>
                                            </>
                                            )}
                                            {templateTabsPopup === 1 && (
                                            <div className="h-[calc(100%-55px)]">
                                                <div className="grid grid-cols-3 gap-2 w-full px-3 pt-4 pb-2 top-model-table">
                                                {Array.isArray(questionnaireForms) &&
                                                    questionnaireForms.map((template, i) => (
                                                    <div
                                                        key={i}
                                                        className={`grid grid-cols-[auto,1fr] shadow-sm rounded-md gap-4  p-[8px]`}
                                                        onClick={() => {
                                                        setEditModel({
                                                            name: template?.field,
                                                            index: null,
                                                        });
                                                        confirmToAddTemplate(template?.id);
                                                        }}
                                                    >
                                                        <div className="self-start pt-1">
                                                        <div className="rounded-[50%] bg-slate-200 h-[45px] w-[45px] flex justify-center items-center">
                                                            <IoDocumentText />
                                                        </div>
                                                        </div>
                                                        <div className="flex items-center">
                                                        <div>
                                                            <div className="text-[15px] text-gray-500 font-semibold pb-1">
                                                            {template?.name}
                                                            </div>
                                                            <div className="text-[13px] text-gray-400 pb-1 font-medium">
                                                            Chart Template
                                                            </div>
                                                            <div className="text-[12px] text-gray-400 pb-1 font-medium">
                                                            {template?.employee?.name}
                                                            </div>
                                                        </div>
                                                        </div>
                                                    </div>
                                                    ))}
                                                </div>
                                            </div>
                                            )}
                                        </div>
                                        </div>
                                    </TopModel>
                                    )}
                                </div>
                                        {/* ------------------------------------------- */}
                                    </div>
                                    </div>}
                                    </div>
                                </div>
                                {/* ------------------- */}
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
                    {currentTab === "client" && (
                        <CreateClientCard
                            show={showCreateClientModel}
                            onHide={() => {setShowCreateClientModel(false)}}
                            getEmployees =  {getEmployees}
                        />
                    )}
                </div>
            </AsideLayout>
        </>
    );
};

export default AllClientRoot;
