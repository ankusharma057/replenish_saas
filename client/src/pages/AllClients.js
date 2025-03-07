import React, { useEffect, useRef, useState } from "react";
import { momentLocalizer } from "react-big-calendar";
import { FaCaretDown, FaCaretUp } from "react-icons/fa"; 
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
    confirmPayment,
    getLocationsWithoutEmployee,
    createGroup,
    deleteGroup,
    updateGroup,
    uploadFiles,
    getFilesList,
    getProductsList,
    addProductToAppointment,
    updateProductQuantity,
    removeProductFromAppointment,
} from "../Server";
import { useAuthContext } from "../context/AuthUserContext";
// import InventoryModal from "../components/Modals/InventoryModal";
// import InvoiceListModal from "../components/Modals/InvoiceListModal";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
// import { Form, Popover } from "react-bootstrap";
// import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { ChevronDown, Plus, MoveRight, X, SlidersHorizontal, CalendarDays, Trash2, CheckCircle, XCircle } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { FixedSizeList as List } from "react-window";
import { ButtonGroup, ToggleButton, Button, Row, Col, Tooltip, OverlayTrigger, Dropdown, DropdownButton, FormControl, Form, Popover, ListGroup, Badge, Offcanvas, Modal, Card } from "react-bootstrap";
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
import { BsFileEarmarkTextFill, BsFillGearFill, BsPlusCircleFill, BsSliders2, BsThreeDots, BsThreeDotsVertical } from "react-icons/bs";
import SubmitedClientIntakeForm from "./SubmitedClientIntakeForm";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import CreateClientCard from "../components/Cards/CreateClientCart";
import ScheduleCalender from "../components/Schedule/ScheduleCalender";
import { MdDelete } from "react-icons/md";
import { DropDown } from "../components/DropDown/DropDown";
import SignatureCanvas from "react-signature-canvas";
import Select from "react-select";
import { FaBook, FaHeading } from "react-icons/fa6";
import { FaStar, FaCog, FaEye } from 'react-icons/fa';
import { TbCheckbox, TbEdit, TbSignature } from "react-icons/tb";
import { RxCross2, RxDropdownMenu } from "react-icons/rx";
import { PiColumnsFill, PiGridNineLight, PiPlusCircleFill, PiWarningCircleBold } from "react-icons/pi";
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
import Image from 'react-bootstrap/Image';
import Canvas from "../components/ChartItems/Canvas";
import BodyChart from "../components/ChartItems/BodyChart.jsx";
import Spine from "../components/ChartItems/Spine";
import SOAP from "../components/ChartTemplates/SOAP";
import COVID from "../components/ChartTemplates/COVID";
import FileImageUpload from "../components/ChartItems/FileImageUpload";
import SideBySide from "../components/ChartItems/SideBySide";
import Signature from "../components/ChartItems/Signature";
import Checkboxes from "../components/ChartItems/Checkboxes.jsx";
import ChartScale from "../components/ChartItems/ChartScale.jsx";
import SmartOptionsNarrative from "../components/ChartItems/SmartOptionsNarrative.jsx";
import ChartDropdown from "../components/ChartItems/ChartDropdown.jsx";
import OpticalMeasurements from "../components/ChartItems/OpticalMeasurements.jsx";
import ReactCardFlip from 'react-card-flip';
import CountUp from 'react-countup';
import DatePicker from "react-datepicker";
import { TiTick } from "react-icons/ti";
import { MdModeEditOutline } from "react-icons/md";
import { PiGridFourFill } from "react-icons/pi";
import { ImList } from "react-icons/im";
import { GrImage } from "react-icons/gr";

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
    const [flipLeftCardIndex, setFlipLeftCardIndex] = useState(null)
    const [flipRightCardIndex, setFlipRightCardIndex] = useState(null)
    const [appointmentTab,setAppointmentTab] = useState("Appointment");
    const [searchLocation, setSearchLocation] = useState("");
    const [searchEmployee, setSearchEmployee] = useState("");
    const [serviceLocation, setServiceLocation] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showEditAppointmentSection, setShowEditAppointmentSection] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [enableFilesDetails, setEnableFilesDetails] = useState(false);
    const [imageDescription, setImageDescription] = useState("");
    const [includeInClientChart, setIncludeInClientChart] = useState(false);
    const [imageVisibility, setImageVisibility] = useState("Viewable by Everyone");
    const [createGroupModal, setCreateGroupModal] = useState(false);
    const [searchClient, setSearchClient] = useState("");
    const [showSearchClient, setShowSearchClient] = useState("");
    const [showMessageDetails, setShowMessageDetails] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupType, setGroupType] = useState("create");
    const [createGroupPayload, setCreateGroupPayload] = useState({
      "group_id": 1,
      "clientId": "",
      "group_name": "",
      "client_ids": [],
      "new_group_name":""
    });
    const [uploadedFiles,setUploadedFiles]=useState([])

    const topleftCardsData = [
      {
          id: 1,
          count: 6,
          label: "Total Booking",
          backLable: "View Appointments",
          targetTab: "Appointments"
      },
      {
          id: 2,
          count: 0,
          label: "Upcomming appointment",
          backLable: "View Appointments",
          targetTab: "Appointments"
      },
      {
          id: 3,
          count: 1,
          label: "No Shows",
          backLable: "View Appointments",
          targetTab: "Appointments"
      },
      {
          id: 4,
          count: 5,
          label: "Month since last visit",
          backLable: "View Appointments",
          targetTab: "Appointments"
      },
  ];
  const topRightCardsData = [
      {
          id: 1,
          count: 685.00,
          label: "Total Booking",
          backLable: "Recieve Payments",
          targetTab: "Appointments"
      },
      {
          id: 2,
          count: 0.00,
          label: "Upcomming appointment",
          backLable: "View Credit",
          targetTab: "Billing"
      },
      {
          id: 3,
          count: 833.000,
          label: "No Shows",
          backLable: "View Purchases",
          targetTab: "Billing"
      },
  ];

    useEffect(() => {
        async function loadConfig() {
        const publicKey = await fetchConfig();
        setStripePublicKey("pk_test_51LB9bEBZZntSWQ9mTfXQdmFLUArwS1bGxqZmwR41fRs9waoUdV7Keg35ew885hCIug4aFlmI04EKn8Ah3T8RjV4s00M9v95cmy");
        }
        loadConfig();
        getAllEmployeeLocation();
    }, []);

    useEffect(() => {
        if (stripePublicKey) {
            setStripePromise(loadStripe(stripePublicKey));
        }
    }, [stripePublicKey]);
    const getAllEmployeeLocation = async (employeeId, refetch = false) => {
      const { data } = await getLocationsWithoutEmployee(employeeId, refetch);
      if (data?.length > 0) {
        setServiceLocation(
          data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
        );
      }
    };

    const symbols = ['↑', '↓', '←', '→', '↩', '↪', '↻', '↷', '℗', 'ℓ', '®', 'ℬ', '∅', '•'];
    const [showSymbol,setShowSymbol] = useState(null)
    const [cursorPosition, setCursorPosition] = useState(0);
  const getClientSchedule = async (selectedEmployeeData, refetch = true) => {
    try {
      if (selectedEmployeeData) {
        const { data } = await getClientSchedulesOnly(selectedEmployeeData, refetch);
        setSelectedClientSchedules(data);
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
        getUploadedFiles();
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
    { label: "text", className: "pinyon-script-regular" },
    { label: "text", className: "great-vibes-regular" },
    { label: "text", className: "herr-von-muellerhoff-regular" },
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
const urlParams = new URLSearchParams(window.location.search);
let retrievedSessionId = urlParams.get('session_id');

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
    const success = urlParams.get('payment_success');

    if (success && retrievedSessionId) {
        fetchPaymentConfirmation(retrievedSessionId);
    }
}, [retrievedSessionId]);

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
    const filteredEmployeeListNew = employeeList?.filter((employee) =>
        employee?.name?.toLowerCase()?.includes(searchEmployee?.toLowerCase())
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
            // addTabs.push({ name: "Edit/Settings", value: "settings" });
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
    function getInitials(str) {
        const words = str.split(" ");
        if (words.length >= 2) {
          return words[0][0] + words[1][0];
        }else if (words.length === 1) {
            return words[0][0]; 
          }
        return "";
      }
      useEffect(()=>{
        setCreateGroupPayload((prev)=>(
          {
            "clientId": selectedEmployeeData?.id,
            "group_name": "",
            "client_ids": [selectedEmployeeData?.id]
          }
        ))
      },[selectedEmployeeData])
    const EmployeeItem = ({ index, style }) => {
        const employee = filteredEmployeeList[index];
        let name=employee?.name+ " "
        if(employee?.last_name){
            name += employee?.last_name
        }
        return (
            employee && (
                <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-top">{name}</Tooltip>}
                >
                    <div
                        style={style}
                        onClick={() => {
                            selectedEmployeeData?.id !== employee.id && handleSelect(employee);
                            if (window.innerWidth < 1024) {
                                collapse();
                            }
                        }}
                    className={`p-2 border-b transition-all hover:bg-gray-200 rounded-md duration-700 d-flex justify-content-start align-items-center gap-[3px] ${selectedEmployeeData?.id === employee.id
                        ? " bg-gray-200 d-flex justify-content-start align-items-center gap-[3px]"
                        : "cursor-pointer d-flex justify-content-start align-items-center gap-[3px]"
                            } `}
                    >
                        {employee.profile_photo_url ?
                            <Image
                                roundedCircle
                                src={employee?.profile_photo_url}
                                style={{ width: "35px", height: "35px" }}
                            /> :
                            <div className="w-[35px] h-[35px] rounded-circle d-flex justify-content-center align-items-center border bg-white">
                                <p className="mb-0 fs-6 d-flex justify-content-center align-items-center">{getInitials(employee?.name)}</p>
                            </div>
                        }
                        {name?.length>19? name?.slice(0,19)+"...":name}
                    </div>
                </OverlayTrigger>
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
    const [showSearch, setShowSearch] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const [productList, setProductList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpenn, setIsDropdownOpenn] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
      if (selectedAppointment && selectedAppointment.products) {
        setProductList(selectedAppointment.products);
      }
    }, [selectedAppointment]);
    
    const handleDropdownToggle = () => {
      setIsDropdownOpenn(!isDropdownOpenn);
    };
    
    const handleAddItemm = () => {
      setShowSearch(true);
    };
    
    
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const { data } = await getProductsList();
          setProducts(data);
          setFilteredProducts(data);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      };

      fetchProducts();
    }, []);

    useEffect(() => {
      setFilteredProducts(
        products.filter((product) =>
          product.name?.toLowerCase().includes(searchTerm?.toLowerCase())
        )
      );
    }, [searchTerm, products]);

    const handleProductSelect = async (product) => {
      let response;
      try {
        response = await addProductToAppointment(selectedAppointment.id, {
          product_id: product.id,
          quantity: 1,
        });

        setProductList((prevList) => [
          ...prevList,
          { ...product, quantity: 1, schedule_product_id: response.id },
        ]);

        toast.success('Product Added successfully');
      } catch (error) {
        toast.error('Error saving product');
      }
    };

    const handleQuantityChange = async (index, change) => {
      try {
        const product = productList[index];
        const newQuantity = product.quantity + change;
        if (newQuantity < 1) return;
    
        await updateProductQuantity(selectedAppointment.id, product.id, { quantity: newQuantity });
    
        const updatedList = [...productList];
        updatedList[index].quantity = newQuantity;
        setProductList(updatedList);
      } catch (error) {
        toast.error('Error updating quantity');
      }
    };
    
    const handleRemoveProduct = async (index) => {
      try {
        const product = productList[index];
        await removeProductFromAppointment(selectedAppointment.id, product.id);
    
        const updatedList = [...productList];
        updatedList.splice(index, 1);
        setProductList(updatedList);
        toast.success('Product removed successfully');
      } catch (error) {
        toast.error('Error removing product');
      }
    };

  const toggleDrawer = async () => {
    setIsDrawerOpen(true);
  };

  const [selectedTreatments, setSelectedTreatments] = useState(new Set());
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  const handleItemSelection = (e, type) => {
    const { value, checked } = e.target;
    const productId = parseInt(value);

    if (type === 'treatment') {
      setSelectedTreatments((prev) => {
        const updated = new Set(prev);
        if (checked) {
          updated.add(value);
        } else {
          updated.delete(value);
        }
        return updated;
      });
    } else if (type === 'product') {
      setSelectedProducts((prev) => {
        const updated = new Set(prev);
        let productFound = false;

        updated.forEach((product) => {
          if (product.schedule_product_id === productId) {
            productFound = true;
            if (checked) {
              product.quantity += 1;
            } else {
              updated.delete(product);
            }
          }
        });

        if (!productFound && checked) {
          const product = productList.find((prod) => prod.schedule_product_id === productId);
          updated.add({ schedule_product_id: productId, quantity: product ? product.quantity : 1 });
        }

        return updated;
      });
    }
  };

  useEffect(() => {
    if (!isDrawerOpen) {
      setSelectedTreatments(new Set());
      setSelectedProducts(new Set());
    }
  }, [isDrawerOpen]);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setClientSecret(null);
  };

  const handleProceedToCheckout = async () => {
    if (selectedAppointment) {
      try {
        const { clientSecret } = await createCheckoutSession(
          selectedEmployeeData.id,
          selectedAppointment.id,
          selectedAppointment.remaining_amount,
          selectedEmployeeData.stripe_id,
          Array.from(selectedTreatments) || [],
          Array.from(selectedProducts) || [],
        );

        if (clientSecret) {
          setClientSecret(clientSecret);
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
    
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDischargeDropdownOpen, setIsDischargeDropdownOpen] = useState(false);
    
    const toggleDischargeDropdown = () => {
        setIsDischargeDropdownOpen(prev => !prev);
    };

    const handleDischarge = () => {
        console.log("Discharge option selected");
        setIsDischargeDropdownOpen(false); 
    };



    const templates = [
        { label: "Chief Complaint", value: "chief_complaint", description: "Record the Chief Complaint or Diagnosis" },
        { label: "Vitals", value: "vitals", description: "Record Weight, Height, Blood Pressure, Respiratory Rate, And Calculate BMI" },
        { label: "Note", value: "note", description: "A Plain Text Area To Type Notes" },
        { label: "Body Chart", value: "body_chart", description: "Draw Or Type Notes on the provided Body Chart or any image of your choosing" },
        { label: "Side By Side", value: "side_by_side", description: "Upload Two photos and draw or type notes on them" },
        { label: "Sketch", value: "sketch", description: "A Blank Canvas to draw, sketch or write ideally with a stylus on a touch screen" },
        { label: "File/Image", value: "file_image", description: "Upload any type of file with a preview of most common file types." },
        { label: "Signature", value: "signature", description: "Add A Signature By Drawing or Typing" },
        { label: "Spine", value: "spine", description: "Checkboxes for each Joint, Sketch on a spine diagram, and notes" },
        { label: "Heading", value: "heading", description: "A Simple Heading" },
        { label: "Check Boxes", value: "checkboxes", description: "Select one or more checkboxes and optimally add a note to each." },
        { label: "Drop Down", value: "drop_down", description: "Select one option from a list of options in a drop down menu." },
        { label: "Smart Options & Narrative", value: "smart_options", description: "Select a choice from a list of subjects and optimally display a sentence." },
        { label: "Range/Scale", value: "range_scale", description: "A customizable range/scale/slider allows you to choose from a range of values." },
        { label: "Optical Measurements", value: "optical_measurements", description: "Optical Measurements" },
        { label: "SOAP", value: "soap", description: "Chart Template ReplenishMD" },
        { label: "COVID", value: "covid", description: "Single Client Survey ReplenishMD" },
    ];
    const [expandedSections, setExpandedSections] = useState({});
    const [elements, setElements] = useState([]);
    const [vitalsText, setVitalsText] = useState('');

    const toggleDropdown = (sectionId) => {
        setIsDropdownOpen((prevState) => ({
          ...prevState,
          [sectionId]: !prevState[sectionId],
        }));
      };
      const handleAddItem = (sectionId, itemType) => {
        setCreatedSections((prevSections) =>
            prevSections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        items: Array.isArray(section.items)
                            ? [
                                ...section.items,
                                { type: itemType, id: Date.now() } 
                            ]
                            : [{ type: itemType, id: Date.now() }] 
                    }
                    : section
            )
        );
    };
    
    
  const [createdSections, setCreatedSections] = useState([]);
  const handleOptionClick = (templateValue) => {
    setCreatedSections((prevSections) => [
      ...prevSections,
      { type: templateValue, id: Date.now() }
    ]);
    setChartTab(null);
  };
  const handleLeftCardClick = (index) => {
    setFlipLeftCardIndex(index)
};
const handleLeftCardOut = () => {
    setFlipLeftCardIndex(null)
};
const handleRightCardClick = (index) => {
    setFlipRightCardIndex(index)
};
const handleRightCardOut = () => {
    setFlipRightCardIndex(null)
};
const formatAmount = (amount) => {
  const amountString = Number(amount).toFixed(2);
  const decimalPart = amountString.slice(-3);
  const mainAmount = amountString.slice(0, -3);
  return { mainAmount, decimalPart };
};
const handleSign = (sectionId) => {
    console.log(`Signing section with ID: ${sectionId}`);
  };
  const ChiefComplaint = ({ item }) => {
    return (
        <div>
            <h3 className="text-base">Chief Complaint</h3>
            <textarea
                key={item.id}
                placeholder="Enter details for Chief Complaint"
                className="border p-2 w-full rounded-md mt-2 h-24"
            />
        </div>
    );
};

  const VitalsSection = ({ vitalsText, setVitalsText }) => {
    return (
      <div className="p-4 mt-4 bg-gray-50">
        <h3 className="font-semibold text-lg flex justify-between items-center">
          Vitals
        </h3>
        <textarea
          value={vitalsText}
          onChange={(e) => setVitalsText(e.target.value)}
          placeholder="Enter Vitals information"
          className="border p-2 w-full rounded-md mt-2 h-24"
        ></textarea>
      </div>
    );
  };
 

const EditableHeading = ({ initialText }) => {
  const [headingText, setHeadingText] = useState(initialText);

  const handleChange = (event) => {
    setHeadingText(event.target.innerText); 
  };

  const headingStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '10px',
    borderBottom: '2px solid #ccc',
    marginBottom: '20px',
    cursor: 'text', 
    direction: 'ltr', 
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word', 
  };

  return (
    <div
      contentEditable
      style={headingStyle}
      onInput={handleChange}
      suppressContentEditableWarning={true}
    >
      {headingText} 
    </div>
  );
};


const FooterWithDropdown = ({
    section,
    isDropdownOpen,
    toggleDropdown,
    templates,
    handleAddItem,
    handleSign,
  }) => {
    return (
      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <div className="relative">
          <button
            className="flex items-center border rounded-md p-2 bg-white text-gray-500 text-sm"
            onClick={() => toggleDropdown(section.id)}
          >
            <FaCaretDown className="mr-1" />
            Add
          </button>
          {isDropdownOpen[section.id] && (
            <div className="absolute mt-1 w-48 bg-white border rounded-md shadow-lg">
              {templates.map((template) => (
                <div
                  key={template.value}
                  onClick={() => handleAddItem(section.id, template.value)}
                  className="px-4 py-2 hover:bg-gray-100"
                >
                  {template.label}
                </div>
              ))}
            </div>
          )}
        </div>
  
        <button
          onClick={() => handleSign(section.id)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Sign
        </button>
      </div>
    );
  };

  const toggleExpand = (sectionId) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [sectionId]: !prevState[sectionId], 
    }));
  };

  const togglePin = (sectionId) => {
    console.log(`Pin clicked for section ${sectionId}`);
  };

const TextareaInput = ({ placeholder }) => (
  <textarea
    placeholder={placeholder}
    className="border p-2 w-full rounded-md mt-2 h-24"
  />
);

const CanvasWrapper = () => (
  <div className="p-4 mt-4 bg-gray-50">
    <h3 className="font-semibold text-lg flex justify-between items-center">Sketch</h3>
    <div className="mt-2 border p-4">
      <Canvas />
    </div>
  </div>
);

const BodyChartWrapper = () => (
  <div className="p-4 mt-4 bg-gray-50">
    <h3 className="font-semibold text-lg flex justify-between items-center">Body Chart</h3>
    <div className="mt-2 border p-4">
      <BodyChart />
    </div>
  </div>
);

const SideBySideWrapper = () => (
  <div className="p-4 mt-4 bg-gray-50">
    <h3 className="font-semibold text-lg flex justify-between items-center">Side by Side</h3>
    <div className="mt-2 border p-4">
      <SideBySide />
    </div>
  </div>
);

const SignatureWrapper = () => (
  <div className="p-4 mt-4 bg-gray-50">
    <h3 className="font-semibold text-lg flex justify-between items-center">Signature</h3>
    <div className="mt-2 border p-4">
      <Signature />
    </div>
  </div>
);

const SpineWrapper = ({ index }) => (
  <div className="p-4 mt-4 bg-gray-50">
    <h3 className="font-semibold text-lg flex justify-between items-center">Spine</h3>
    <div className="mt-2 border p-4">
      <Spine key={`spine_${index}`} imageSrc={'/shutterstock_442112374_edited.png'} />
    </div>
  </div>
);
  
  
 
  const renderSection = (section) => {
    const clientName = "Patrick";
    const dateTime = new Date().toLocaleString();
    const isPinned = false;
    const renderHeader = () => (
      <div
        className="flex justify-between items-center bg-gray-200 p-4 rounded-t-md cursor-pointer"
        onClick={() => toggleExpand(section.id)}
      >
        <div className="flex items-center space-x-4">
          <button onClick={() => togglePin(section.id)} className="text-yellow-500">
            <FaStar />
          </button>
          <span className="text-sm text-gray-600">{dateTime}</span>
          <span className="font-semibold text-lg text-gray-800">{section.title}</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{clientName}</span>
          <button className="text-gray-500">
            <FaCaretDown />
          </button>
        </div>
      </div>
    );
  //   const renderItem = (item, index) => {
  //   const componentMap = {
  //     chief_complaint: <ChiefComplaint item={item} />,
  //     vitals: <VitalsSection vitalsText={vitalsText} setVitalsText={setVitalsText} />,
  //     file_image: <FileImageUpload sectionId={section.id} />,
  //     note: (
  //       <div key={item.id} className="mt-2">
  //         <h3 className="text-base">Note</h3>
  //         <TextareaInput placeholder="Enter details for Note" />
  //       </div>
  //     ),
  //     sketch: <CanvasWrapper key={section.id} />,
  //     body_chart: <BodyChartWrapper key={index} />,
  //     side_by_side: <SideBySideWrapper key={section.id} />,
  //     signature: <SignatureWrapper key={section.id} />,
  //     spine: <SpineWrapper key={`spine_${index}`} />,
  //     heading: <EditableHeading initialText="Click here to edit this heading" />,
  //     checkboxes: <Checkboxes />,
  //     dropdown: <ChartDropdown />,
  //     smart_options: <SmartOptionsNarrative />,
  //     range_scale: <ChartScale />,
  //     optical_measurements: <OpticalMeasurements />,
  //   };
  //   return componentMap[item.type] || null;
  // };
  const renderItem = (item, index) => {
    const componentMap = {
      chief_complaint: <ChiefComplaint item={item} />,
      vitals: <VitalsSection vitalsText={vitalsText} setVitalsText={setVitalsText} />,
      file_image: <FileImageUpload sectionId={section.id} />,
      note: (
        <div key={item.id} className="mt-2">
          <h3 className="text-base">Note</h3>
          <TextareaInput placeholder="Enter details for Note" />
        </div>
      ),
      sketch: <CanvasWrapper key={`sketch_${section.id}_${index}`} />,
      body_chart: <BodyChartWrapper key={`body_chart_${section.id}_${index}`} />,
      side_by_side: <SideBySideWrapper key={`side_by_side_${section.id}_${index}`} />,
      signature: <SignatureWrapper key={`signature_${section.id}_${index}`} />,
      spine: <SpineWrapper key={`spine_${section.id}_${index}`} />,
      heading: <EditableHeading initialText="Click here to edit this heading" />,
      checkboxes: <Checkboxes />,
      dropdown: <ChartDropdown />,
      smart_options: <SmartOptionsNarrative />,
      range_scale: <ChartScale />,
      optical_measurements: <OpticalMeasurements />,
    };
    
    return componentMap[item.type] || null;
  };
  

    const isExpanded = expandedSections[section.id] || false;

    const items = Array.isArray(section.items) ? section.items : [];
    switch (section.type) {
      case "chief_complaint":
        return (
            <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
              {renderHeader(section)}
              {isExpanded && (
                <div>
  <div className="p-4 mt-4">
  <h3 className="text-base">Chief Complaint</h3>
    <textarea
      placeholder="Enter details for Chief Complaint - inbuilt"
      className="border p-2 w-full rounded-md mt-2 h-24"
    />
  </div>

  <div className="p-4 mt-4">
            {/* {section.items.map((item, index) => renderItem(item, index))} */}
            {items.map((item, index) => renderItem(item, index))}
          </div>
                </div>
              )}
              {isExpanded &&(
            <FooterWithDropdown
        section={section}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        templates={templates}
        handleAddItem={handleAddItem}
        handleSign={handleSign}
      />
              )}
        </div>
        );

        case "vitals":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
                <VitalsSection vitalsText={vitalsText} setVitalsText={setVitalsText} />
      
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );
          
     
    case "sketch":
        return (
            <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
              {renderHeader(section)}
              {isExpanded && (
                <div>
            <h3 className="font-semibold text-lg flex justify-between items-center">
              Sketch
            </h3>
            <div className="mt-2 border p-4">
              <Canvas />
            </div>

            <div className="p-4 mt-4">
                
            {items.map((item, index) => renderItem(item, index))}
            </div>
                </div>
              )}
              {isExpanded &&(
            <FooterWithDropdown
        section={section}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        templates={templates}
        handleAddItem={handleAddItem}
        handleSign={handleSign}
      />
              )}
        </div>
        );

        case "note":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
     <div className="mt-2">
                                    <h3 className="text-base">Note</h3>
                                        <textarea
                                            placeholder="Enter details for Note"
                                            className="border p-2 w-full rounded-md mt-2 h-24"
                                        />
                                    </div>
    
                <div className="p-4 mt-4">
                    
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

      
        case "file_image":
            // return <FileImageUpload sectionId={section.id} />;
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
                        <FileImageUpload sectionId={section.id} />;
    
                <div className="p-4 mt-4">
                    
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "body_chart":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
                        <h3 className="font-semibold text-lg flex justify-between items-center">
                  Body Chart
                </h3>
                <div className="mt-2 border p-4">
                  {/* Use the Canvas component here */}
                  <BodyChart />
                </div>
    
                <div className="p-4 mt-4">
                    
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "sketch":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <h3 className="font-semibold text-lg flex justify-between items-center">
                                          Sketch
                                        </h3>
                                        <div className="mt-2 border p-4">
                                          <Canvas />
                                        </div>
      </div>
    
                <div className="p-4 mt-4">
                    
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "side_by_side":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <h3 className="font-semibold text-lg flex justify-between items-center">
                                            Side by Side
                                          </h3>
                                          <div className="mt-2 border p-4">
                                            <SideBySide />
                                          </div>
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "signature":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <h3 className="font-semibold text-lg flex justify-between items-center">
                                            Signature
                                          </h3>
                                          <div className="mt-2 border p-4">
                                            <Signature />
                                          </div>
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "spine":
                return (
                    <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                      {renderHeader(section)}
                      {isExpanded && (
                        <div>
          <div className="p-4 mt-4">
          <h3 className="font-semibold text-lg flex justify-between items-center">
                      Spine
                    </h3>
                    <div className="mt-2 border p-4">
                      <Spine key={`spine_`} imageSrc={'/shutterstock_442112374_edited.png'}/>
                    </div>
          </div>
        
                    <div className="p-4 mt-4">
                       
            {items.map((item, index) => renderItem(item, index))}
                    </div>
                        </div>
                      )}
                      {isExpanded &&(
                    <FooterWithDropdown
                section={section}
                isDropdownOpen={isDropdownOpen}
                toggleDropdown={toggleDropdown}
                templates={templates}
                handleAddItem={handleAddItem}
                handleSign={handleSign}
              />
                      )}
                </div>
                );
        
        case "heading":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <EditableHeading initialText="Click here to edit this heading" />
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "checkboxes":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <Checkboxes />
      </div>
    
                <div className="p-4 mt-4">
                    
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "dropdown":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <ChartDropdown />
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "smart_options":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <SmartOptionsNarrative />
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "range_scale":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
      <ChartScale />
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "optical_measurements":
            return (
                <div key={section.id} className="section-container bg-gray-50 p-4 mt-4">
                  {renderHeader(section)}
                  {isExpanded && (
                    <div>
      <div className="p-4 mt-4">
                    <OpticalMeasurements />
      </div>
    
                <div className="p-4 mt-4">
                   
            {items.map((item, index) => renderItem(item, index))}
                </div>
                    </div>
                  )}
                  {isExpanded &&(
                <FooterWithDropdown
            section={section}
            isDropdownOpen={isDropdownOpen}
            toggleDropdown={toggleDropdown}
            templates={templates}
            handleAddItem={handleAddItem}
            handleSign={handleSign}
          />
                  )}
            </div>
            );

        case "soap":
                return (
                    <div key={section.id} className="p-4 mt-4 bg-gray-50">
                      {/* Header */}
                      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-t-md cursor-pointer" onClick={toggleExpand}>
                        <div className="flex items-center space-x-4">
                          {/* Pin Icon */}
                          <button onClick={togglePin} className="text-yellow-500">
                            <FaStar />
                          </button>
                          
                          {/* Creation Date and Title */}
                          <span className="text-sm text-gray-600">{dateTime}</span>
                          <span className="font-semibold text-lg text-gray-800">SOAP</span>
                        </div>
                
                        {/* Right side - Client Name and Dropdown */}
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{clientName}</span>
                
                          {/* Dropdown for header */}
                          <button className="text-gray-500">
                            <FaCaretDown />
                          </button>
                        </div>
                      </div>
                
                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className="mt-2 border p-4">
                          <SOAP />
                        </div>
                      )}
                
                      {/* Footer */}
                      {isExpanded && (
                      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-b-md mt-4">
                        <div className="flex items-center space-x-4">
                          {/* Settings Dropdown */}
                          <div className="relative">
                            <button className="text-gray-500">
                              <FaCog />
                            </button>
                            {/* Dropdown Content */}
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                              {/* <div className="p-2 text-sm">Settings Option 1</div>
                              <div className="p-2 text-sm">Settings Option 2</div> */}
                            </div>
                          </div>
                
                          {/* Viewable by Everyone Dropdown */}
                          <div className="relative">
                            <button className="text-gray-500">
                              <FaEye />
                            </button>
                            {/* Dropdown Content */}
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                              {/* <div className="p-2 text-sm">Viewable Option 1</div>
                              <div className="p-2 text-sm">Viewable Option 2</div> */}
                            </div>
                          </div>
                        </div>
                
                        {/* Buttons */}
                        <div className="flex space-x-4">
                          <button className="px-4 py-2 bg-red-500 text-white rounded-md">Not Visible to Client</button>
                          <button className="px-4 py-2 bg-gray-500 text-white rounded-md">Close</button>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Sign</button>
                        </div>
                      </div>
                      )}
                    </div>
                  );
        case "covid":
                return (
                    <div key={section.id} className="p-4 mt-4 bg-gray-50">
                      {/* Header */}
                      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-t-md cursor-pointer" onClick={toggleExpand}>
                        <div className="flex items-center space-x-4">
                          {/* Pin Icon */}
                          <button onClick={togglePin} className="text-yellow-500">
                            <FaStar />
                          </button>
                          
                          {/* Creation Date and Title */}
                          <span className="text-sm text-gray-600">{dateTime}</span>
                          <span className="font-semibold text-lg text-gray-800">Covid-19 Screening Survey</span>
                        </div>
                
                        {/* Right side - Client Name and Dropdown */}
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">{clientName}</span>
                
                          {/* Dropdown for header */}
                          <button className="text-gray-500">
                            <FaCaretDown />
                          </button>
                        </div>
                      </div>
                
                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className="mt-2 border p-4">
                          <COVID />
                        </div>
                      )}
                
                      {/* Footer */}
                      {isExpanded && (
                      <div className="flex justify-between items-center bg-gray-200 p-4 rounded-b-md mt-4">
                        <div className="flex items-center space-x-4">
                          {/* Settings Dropdown */}
                          <div className="relative">
                            <button className="text-gray-500">
                              <FaCog />
                            </button>
                            {/* Dropdown Content */}
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                              {/* <div className="p-2 text-sm">Settings Option 1</div>
                              <div className="p-2 text-sm">Settings Option 2</div> */}
                            </div>
                          </div>
                
                          {/* Viewable by Everyone Dropdown */}
                          <div className="relative">
                            <button className="text-gray-500">
                              <FaEye />
                            </button>
                            {/* Dropdown Content */}
                            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md">
                              {/* <div className="p-2 text-sm">Viewable Option 1</div>
                              <div className="p-2 text-sm">Viewable Option 2</div> */}
                            </div>
                          </div>
                        </div>
                
                        {/* Buttons */}
                        <div className="flex space-x-4">
                          <button className="px-4 py-2 bg-red-500 text-white rounded-md">Not Visible to Client</button>
                          <button className="px-4 py-2 bg-gray-500 text-white rounded-md">Close</button>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-md">Sign</button>
                        </div>
                      </div>
                      )}
                    </div>
                  );
          
        

      default:
        return null;
    }
  };
const handleMessageDetails=()=>{
  setShowMessageDetails(!showMessageDetails)
};
const MessagesDetails=()=>{
  return <div>
    <Offcanvas show={showMessageDetails} onHide={handleMessageDetails} placement="end" style={{width:"80%"}}>
        <Offcanvas.Header closeButton style={{backgroundColor:"#ededed"}}>
          <Offcanvas.Title>Email Message</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{backgroundColor:"#ededed"}}>
          <div>
            <Row>
              <Col xs={11} sm={11} md={11} lg={11}>
              <div>
                <div className="d-flex justify-content-start align-items-center gap-[30px]">
                  <p className="mb-0 fw-bold w-[60px]">Date</p>
                  <p className="mb-0 text-muted ">December 12, 2024 4:02 AM</p>
                </div>
                <div className="d-flex justify-content-start align-items-center gap-[30px]">
                  <p className="mb-0 fw-bold w-[60px]">To</p>
                  <p className="mb-0 text-muted ">bichli.cam@gmail.com</p>
                </div>
                <div className="d-flex justify-content-start align-items-center gap-[30px]">
                  <p className="mb-0 fw-bold w-[60px]">Subject</p>
                  <p className="mb-0 text-muted ">Your Receipt - ReplenishMD</p>
                </div>
              </div>
              </Col>
              <Col xs={1} sm={1} md={1} lg={1}><Badge bg="warning" text="dark">Delivered</Badge></Col>
            </Row>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
  </div>
}

const handleAppointmentTabs=(tab)=>{
  setAppointmentTab(tab);
};
const filteredLocationItems = serviceLocation.filter((item) =>
  item.label?.toLowerCase().includes(searchLocation?.toLowerCase())
);
const filteredClientList = searchClient
  ? employeeList.filter((item) =>
      item.name?.toLowerCase().startsWith(searchClient?.toLowerCase()) &&
      !createGroupPayload.client_ids.includes(item.id)
    )
  : [];
const getEndDateMinDate = () => {
  if (startDate) {
    return getNextDay(startDate);
  }
  return null;
};
const getNextDay = (date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
};
const handleDrop = (event) => {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  if(files[0]){
    setSelectedFiles(files[0]);
  const reader = new FileReader();
  reader.onload=(e)=>{
    setPreviewImage(e.target.result)
  }
  reader.readAsDataURL(files[0]);
  setEnableFilesDetails(true)
}
};
const handleDragOver = (event) => {
  event.preventDefault();
};
const handleFileSelect = (event) => {
  const files = event.target.files[0];
  if(files){
    setSelectedFiles(files);
  const reader = new FileReader();
  reader.onload=(e)=>{
    setPreviewImage(e.target.result)
  }
  reader.readAsDataURL(files);
  setEnableFilesDetails(true)
}
};
const handleCreateGroupModal=()=>{
  setCreateGroupModal(!createGroupModal)
  setGroupType("create")
  setCreateGroupPayload(
    {
      "clientId": selectedEmployeeData?.id,
      "group_name": "",
      "client_ids": [selectedEmployeeData?.id]
    }
  )
}
  const handleGroupName = (event) => {
    if(groupType==="update"){
      setCreateGroupPayload((prev) => ({
        ...prev,
        new_group_name: event.target.value,
        group_name: createGroupPayload.group_name,
      }))
    }else{
      setCreateGroupPayload((prev) => ({
        ...prev,
        group_name: event.target.value
      }))
    }
  };
  const handleGroupMember = (clientId) => {
    if (!createGroupPayload.client_ids.includes(clientId)) {
      setCreateGroupPayload((prev) => ({
        ...prev,
        client_ids: [...prev?.client_ids, clientId]
      }))
      setSearchClient("")
    }
  }
  const handleRemoveGroupMember=(clientId)=>{
    if (createGroupPayload.client_ids.includes(clientId)) {
      setCreateGroupPayload((prev) => ({
        ...prev,
        client_ids: createGroupPayload.client_ids.filter((item)=>item!==clientId)
      }))
    }
  };
  const handleDisableCreateGroup=()=>{
    if(!createGroupPayload.group_name|| createGroupPayload.client_ids.length>1){
      return false
    }else{
      return true
    }
  }
  const handleGroup=async(type,groupId)=>{
      let response;
      if(type==="create"){
        response= await createGroup(createGroupPayload)
      }else if(type==="update"){
        response= await updateGroup(clientId,createGroupPayload)
      }else if(type==="delete"){
        response= await deleteGroup(clientId,{"group_id": groupId})
      }
      if(response.status=== 200){
        toast.success(response.data.message);
        setCreateGroupPayload((prev)=>({
          "clientId": selectedEmployeeData.id,
          "group_name": "",
          "client_ids": [selectedEmployeeData.id]
        }))
        if(type!=="delete"){
        setCreateGroupModal(!createGroupModal)
        }
        await getEmployees();
        setCurrentTab("Groups")
        setShowSearchClient(false)
      }else{
        toast.error(response.data.message)
      }
  };
  const handleEditGroup = (groupData) => {
    let data={
      "group_id": groupData.id,
      "clientId": clientId,
      "group_name": groupData?.group_name,
      "client_ids": groupData?.client_ids,
      "new_group_name":""
    }
    setCreateGroupPayload(data)
    setGroupType("edit");
    setCreateGroupModal(!createGroupModal)
  };
  const handleDescription=(event)=>{
    setImageDescription(event.target.value)
  };
  const handleIncludeInClientChart=(event)=>{
    setIncludeInClientChart(event.target.checked)
  };
  const handleImageVisibility=(event)=>{
    setImageVisibility(event.target.value)
  };
  const handleDeleteImage = () => {
    confirmAlert({
      title: "Are you sure you want to delete this file?",
      message: `This cannot be undone.`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setSelectedFiles(null)
            setEnableFilesDetails(false);
            setImageDescription("")
            setIncludeInClientChart(false);
            setImageVisibility("Viewable by Everyone");
          },
        },
        {
          label: "No",
          onClick: () => { },
        },
      ],
    });

  };
  const handleSubmitFiles = async () => {
    const formData = new FormData();
    formData.append("descriptions", imageDescription);
    formData.append("files", selectedFiles);
    let response = await uploadFiles(formData,clientId)
    if (response.status === 200) {
      await getUploadedFiles()
      toast.success(response.data.success)
      setSelectedFiles(null)
      setEnableFilesDetails(false);
      setImageDescription("")
      setIncludeInClientChart(false);
      setImageVisibility("Viewable by Everyone");
    } else {
      toast.error(response.data.error)
    }
  }
  const getUploadedFiles=async()=>{
    let response = await getFilesList(clientId,true);
    setUploadedFiles(response.data.files)
  };
  
  let filterClientList = employeeList.filter(client => createGroupPayload?.client_ids?.includes(client.id))
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
                                {selectedEmployeeData?.name}{" "}{selectedEmployeeData?.last_name}
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
                                    <ClientBilling stripeClientId={selectedEmployeeData?.stripe_id} clientId={selectedEmployeeData?.id} setCurrentTab={setCurrentTab}/>
                                )}

                  {currentTab === "Appointments" && (
                    <div className="flex bg-white min-h-screen">
                      <div className="flex-grow bg-gray-200">
                        <div className="bg-white p-3 rounded">
                          <Row xs={6} sm={6} md={6} lg={6} >
                            <Col xs={6} sm={6} md={6} lg={6}>
                              <div className="d-flex justify-content-between align-items-center">
                                {topleftCardsData.map((item, index) => {
                                  return <div onMouseOver={() => handleLeftCardClick(index)} onMouseOut={handleLeftCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                    <ReactCardFlip isFlipped={flipLeftCardIndex === index} flipDirection="horizontal">
                                      <div className="d-flex flex-column justify-content-between align-items-center">
                                        <div className="h2 text-secondary">
                                          <CountUp end={item.count} />
                                        </div>
                                        <div className="h6 text-center text-muted">{item.label}</div>
                                      </div>
                                      <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                        <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                      </div>
                                    </ReactCardFlip>
                                  </div>
                                })}
                              </div>
                            </Col>
                            <Col xs={6} sm={6} md={6} lg={6}>
                              <div className="d-flex justify-content-end align-items-center gap-[40px]">
                                {topRightCardsData.map((item, index) => {
                                  const { mainAmount, decimalPart } = formatAmount(item.count);
                                  return <div onMouseOver={() => handleRightCardClick(index)} onMouseOut={handleRightCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                    <ReactCardFlip isFlipped={flipRightCardIndex === index} flipDirection="horizontal">
                                      <div className="d-flex flex-column justify-content-between align-items-center">
                                        <div className="h2 text-secondary d-flex justify-content-start">
                                          <span className="fs-6 mt-[4px]">$</span>
                                          <span className="large"> <CountUp end={mainAmount} />{ }</span>
                                          <span className="fs-6  mt-[4px]">{decimalPart}</span>
                                        </div>
                                        <div className="h6 text-center text-muted">{item.label}</div>
                                      </div>
                                      <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                        <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                      </div>
                                    </ReactCardFlip>
                                  </div>
                                })}
                              </div>
                            </Col>
                          </Row>
                        </div>
                        <div className="mt-3 bg-white rounded-md">
                          <ButtonGroup aria-label="Basic example">
                            <Button className="py-3" active={appointmentTab === "Appointment"} variant="outline-secondary" style={{ border: "none" }} onClick={() => handleAppointmentTabs("Appointment")}>Appointment</Button>
                            <Button className="py-3" active={appointmentTab === "Return"} variant="outline-secondary" style={{ border: "none" }} onClick={() => handleAppointmentTabs("Return")}>Return & Visit Reminders</Button>
                          </ButtonGroup>
                        </div>
                        {appointmentTab === "Appointment" && <div className="mt-3 bg-white rounded">
                          <ButtonGroup aria-label="Basic example">
                            <Button variant="outline-secondary" style={{ border: "none" }} > <SlidersHorizontal size={20} color={"#696977"} /></Button>
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: "#fff", border: "none" }} className="py-3 text-muted">
                                All States
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: "#fff", border: "none" }} className="py-3 text-muted">
                                All Locations
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <FormControl
                                  type="text"
                                  placeholder="Search..."
                                  className="mx-3 my-2 w-auto"
                                  onChange={(e) => setSearchLocation(e.target.value)}
                                  value={searchLocation}
                                />
                                {filteredLocationItems.map((item) => (
                                  <Dropdown.Item key={item.key} eventKey={item.key}>
                                    {item.label}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: "#fff", border: "none" }} className="py-3 text-muted">
                                All Staff Members
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <FormControl
                                  type="text"
                                  placeholder="Search..."
                                  className="mx-3 my-2 w-auto"
                                  onChange={(e) => setSearchEmployee(e.target.value)}
                                  value={searchEmployee}
                                />
                                {filteredEmployeeListNew.map((item) => {
                                  return <Dropdown.Item key={item.key} eventKey={item.key}>{item.name}</Dropdown.Item>
                                })}
                              </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown>
                              <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: "#fff", border: "none" }} className="py-3 text-muted">
                                All Billing States
                              </Dropdown.Toggle>
                              <Dropdown.Menu className="w-[200px]">
                                <Dropdown.Item className="d-flex justify-content-between align-items">All Billing States<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Uninvoiced<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Unpaid<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Paid<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Partially Paid<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">No Charge<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Refunded<Form.Check type={"checkbox"} /></Dropdown.Item>
                                <Dropdown.Item className="d-flex justify-content-between align-items">Partially Invoiced<Form.Check type={"checkbox"} /></Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                                <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                                  <div className="d-flex justify-content-between gap-3 align-items-center">
                                    <div>
                                      <label>Start Date:</label>
                                      <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                                        dateFormat="yyyy/MM/dd"
                                        inline
                                      />
                                    </div>
                                    <div>
                                      <label>End Date:</label>
                                      <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                                        dateFormat="yyyy/MM/dd"
                                        inline
                                        minDate={getEndDateMinDate()}
                                        disabled={!startDate}
                                      />
                                    </div>
                                  </div>
                                </Popover.Body>
                              </Popover>}
                              rootClose
                            >
                              <Button
                                variant="outline-secondary"
                                style={{
                                  fontSize: "15px",
                                  border: "none",
                                  backgroundColor: "#fff",
                                }}
                              >
                                Select Date Range
                              </Button>
                            </OverlayTrigger>
                          </ButtonGroup>
                        </div>}
                        {appointmentTab === "Appointment" &&
                          <div className="mt-3 w-full mx-auto h-full bg-white rounded-md p-3">
                            <div className="flex justify-between items-center w-full h-[100px] text-gray-500">
                              <h2><span>Appointment Details</span></h2>
                            </div>
                            <div className="border rounded-lg">
                              <div className="flex flex-col gap-3">
                                {Array.isArray(selectedClientSchedules) && selectedClientSchedules.map((form, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col gap-2 border rounded-lg overflow-hidden"
                                    onClick={() => handleAppointmentClick(form)}
                                  >
                                    <div className=" flex flex-col justify-start py-2 px-3 bg-slate-50 hover:bg-blue-50 duration-300">
                                      <div className="flex justify-between mb-1">
                                        <div>
                                          Treatment: 
                                          <span className="text-blue-500">
                                            {form?.treatments?.map((treatment, index) => (
                                              <span key={index}>
                                                {treatment.name}
                                                {index < form.treatments.length - 1 && ", "}
                                              </span>
                                            ))}
                                          </span>
                                        </div>
                                        <div>Client: <span className="text-blue-500">{form?.client?.name}</span></div>
                                      </div>
                                      <div className="flex justify-between mb-1">
                                        <div>Location: <span className="text-blue-500">{form?.location?.name}</span></div>
                                        <div>
                                          Time:
                                          <span className="text-blue-500">
                                            {new Date(form?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} -
                                            {new Date(form?.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <span>Transaction Details</span>
                                        <div className="flex gap-4">
                                          <div className="d-flex gap-1">
                                            <span>Total Amount:</span>
                                            <span className="text-blue-500">{parseFloat(form?.total_amount)}</span>
                                          </div>
                                          <div className="d-flex gap-1">
                                            <span>Paid Amount:</span>
                                            <span className="text-blue-500">{parseFloat(form?.paid_amount)}</span>
                                          </div>
                                          <div className="d-flex gap-1">
                                            <span>Remaining Amount:</span>
                                            <span className="text-blue-500">{parseFloat(form?.remaining_amount)}</span>
                                          </div>
                                          <div className="d-flex gap-1">
                                            <span>Status:</span>
                                            <span className="text-blue-500">{getStatus(parseFloat(form?.total_amount), parseFloat(form?.remaining_amount))}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>}
                        {appointmentTab === "Return" &&
                          <div className="mt-3">
                            <ListGroup>
                              <ListGroup.Item>
                                <div className="bg-white rounded p-3">
                                  <p style={{ fontSize: "12px" }}>No upcoming appointments</p>
                                  <Dropdown>
                                    <Dropdown.Toggle id="dropdown-basic" style={{ backgroundColor: "#22D3EE" }} className="w-100">
                                      Add Return & Visit Reminders
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu style={{ maxHeight: "300px", overflow: "scroll" }}>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 1 day
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 2 days
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 3 days
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 4 days
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 5 days
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 6 days
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 1 week
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 2 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 3 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 4 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 5 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 6 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 7 weeks
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 8 weeks (2 months)
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 12 weeks (3 months)
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 16 weeks (4 months)
                                      </Dropdown.Item>
                                      <Dropdown.Divider />
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 6 months
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 1 year
                                      </Dropdown.Item>
                                      <Dropdown.Item className={"d-flex gap-[5px]"}>
                                        <CalendarDays className="me-2" />
                                        Next visit in 2 years
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                </div>
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <div className="">
                                  <Row>
                                    <Col xs={11} sm={11} md={11} lg={11}>
                                      <div className="p-2">
                                        <p style={{ color: "#3c763d",fontSize:"14px" }} className="d-flex align-items-center mb-0"><TiTick color="#3c763d" size={20} />Booked for: Sunday November 17, 2024 (24 days ago)</p>
                                        <p style={{ color: "#696977",fontSize:"12px" }} className="mb-0">Neurotoxin treatment with Ashrut Dev at Replenish- La Frontera. </p>
                                        <Badge bg="success" style={{color:"#333333",fontSize:"10px",fontWeight:400}}>Reminded 11/13/2024 by Email (Auto)</Badge>
                                      </div>
                                    </Col>
                                    <Col xs={1} sm={1} md={1} lg={1}>
                                    <div className="p-2 border rounded w-[35px]" onClick={()=>setShowEditAppointmentSection(!showEditAppointmentSection)}>
                                      <MdModeEditOutline />
                                    </div>
                                    </Col>
                                    {showEditAppointmentSection && 
                                    <Col xs={12} sm={12} md={12} lg={12}>
                                    <div className="w-100 d-flex justify-content-center align-items-center flex-column">
                                      <Link to={"/"} className="w-100 border border-secondary text-decoration-none m-auto rounded text-center py-1 text-dark">View In Schedule</Link>
                                      <div className="d-flex justify-content-end align-items-center gap-[20px] w-100 mt-3">
                                        <Button variant="danger"><Trash2 size={20}/></Button>
                                        <Button variant="outline-secondary" onClick={()=>setShowEditAppointmentSection(!showEditAppointmentSection)}>Done</Button>
                                      </div>
                                    </div>
                                    </Col>}
                                  </Row>
                                </div>
                              </ListGroup.Item>
                            </ListGroup>
                          </div>}
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
                                <div className="px-2">
                                  <span className="font-bold">Treatments:</span>
                                  <hr className="my-2" />
                                  <div className="mt-2 space-y-2">
                                    {selectedAppointment?.treatments?.map((treatment, index) => (
                                      <div key={index} className="border-b pb-2">
                                        <span className="block">
                                          <strong className="text-gray-700">Treatment {index + 1}:</strong>
                                        </span>
                                        <span className="block px-2">
                                          {treatment.name} -
                                          <span className="font-semibold"> ${treatment.cost?.toFixed(2)}</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="px-2">
                                  <span className="font-bold">Location:</span>
                                </div>
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
                                    onClick={() => handleAddItemm()}
                                  >
                                    Add Item
                                    <Plus />
                                  </button>
                                </div>
                                <hr className="my-2" />
                                {showSearch && (
                                  <div className="rounded-lg bg-white relative mx-2">
                                    <button
                                      className="border px-2 rounded-md w-full bg-white"
                                      onClick={handleDropdownToggle}
                                    >
                                      {selectedProduct ? selectedProduct : "Select a product"}
                                      <span className="ml-2">{isDropdownOpenn ? "▲" : "▼"}</span>
                                    </button>
                                    <hr className="my-2" />

                                    {isDropdownOpenn && (
                                      <div className="absolute mt-2 border rounded-md bg-white w-full shadow-lg z-10">
                                        <input
                                          type="text"
                                          className="border-b p-2 w-full z-10"
                                          placeholder="Search for a product"
                                          value={searchTerm}
                                          onChange={(e) => setSearchTerm(e.target.value)}
                                        />

                                        <ul className="max-h-40 overflow-y-auto px-0 z-auto">
                                          {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product) => (
                                              <li key={product.id}>
                                                <button
                                                  className="block w-full text-left p-2 hover:bg-gray-100"
                                                  onClick={() => handleProductSelect(product)}
                                                >
                                                  {product.name} - ${product.retail_price}
                                                </button>
                                              </li>
                                            ))
                                          ) : (
                                            <li className="p-2">No products found</li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {selectedAppointment.treatments?.map((treatment, index) => (
                                  <div key={index} className="flex flex-col px-2">
                                    <div className="flex py-1 items-center justify-between">
                                      <div className="flex-1">
                                        <span className="font-semibold break-words">{treatment.name}</span>
                                      </div>
                                      {
                                        treatment.paid ? (
                                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                            <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                            Paid
                                          </span>
                                        ) : (
                                          <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1 flex-shrink-0">
                                            <XCircle size={16} style={{ color: '#FFB800' }} />
                                            Unpaid
                                          </span>
                                        )
                                      }
                                    </div>

                                    <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                                      <div>Total Amount:</div>
                                      <div>${treatment.total_amt}</div>
                                    </div>
                                    <hr className="m-2" />
                                    <div className="flex justify-between px-2">
                                      <div>
                                        <span>Subtotal</span>
                                        <br />
                                        <span>Total</span>
                                      </div>
                                      <div className="text-right">
                                        <span>${treatment.total_amt}</span>
                                        <br />
                                        <span><strong>${treatment.total_amt}</strong></span>
                                      </div>
                                    </div>
                                    <hr className="m-2" />
                                    <div className="flex px-2">
                                      <div className="flex flex-col w-full">
                                        <div className="flex justify-between items-center">
                                          <div className="flex">
                                            <span className="font-semibold">Invoice #</span>
                                            {treatment.payment_intent && (
                                              <a
                                                href={`https://dashboard.stripe.com/payments/${treatment.payment_intent}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                              >
                                                {treatment.payment_intent.slice(0, 6) + '...'}
                                              </a>
                                            )}
                                          </div>
                                          {treatment.paid ? (
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                              <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                              Paid
                                            </span>
                                          ) : (
                                            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                              <XCircle size={16} style={{ color: '#FFB800' }} />
                                              Unpaid
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>Total</span>
                                          <span>${treatment.total_amt}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>Balance</span>
                                          <span>${treatment.remaining_amt}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className={`flex ${!treatment.paid ? 'p-2' : ''} gap-x-2`}>
                                      {!treatment.paid && (
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
                                    {index !== selectedAppointment.treatments.length - 1 && <hr className="my-2" />}
                                  </div>
                                ))}
                                {productList.map((product, index) => (
                                  <div key={index} className="bg-white">
                                    <hr className="my-2" />
                                    <div className="flex justify-between items-center px-2">
                                      <div className="flex items-center gap-x-2">
                                        <span className="font-semibold">{product.name}</span>

                                        {product.paid ? (
                                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                            <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                            Paid
                                          </span>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => handleRemoveProduct(index)}
                                              disabled={product.paid}
                                            >
                                              <X size={18} style={{ color: '#22D3EE' }} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                      <span>${product.retail_price}</span>
                                    </div>
                                    <hr className="m-2" />
                                    <div className="flex justify-between px-2">
                                      <span>Quantity</span>
                                      <br />

                                      <div className="flex items-center gap-x-1">
                                        <button
                                          className="px-1 py-1/2 rounded bg-gray-300"
                                          onClick={() => handleQuantityChange(index, 1)}
                                          disabled={product.paid === true}
                                        >
                                          +
                                        </button>
                                        <button
                                          className="px-1 py-1/2 rounded bg-gray-300"
                                          onClick={() => handleQuantityChange(index, -1)}
                                          disabled={product.paid === true}
                                        >
                                          -
                                        </button>
                                        <span>{product.quantity}</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between px-2">
                                      <div>
                                        <span>Subtotal</span>
                                        <br />
                                        <span>Total</span>
                                      </div>
                                      <div>
                                        <span>${product.retail_price * product.quantity}</span>
                                        <br />
                                        <span><strong>${product.retail_price * product.quantity}</strong></span>
                                      </div>
                                    </div>
                                    <hr className="m-2" />
                                    <div className="flex px-2">
                                      <div className="flex flex-col w-full">
                                        <div className="flex justify-between items-center">
                                          <div className="flex">
                                            <span className="font-semibold">Invoice #</span>
                                            {product.payment_intent && (
                                              <a
                                                href={`https://dashboard.stripe.com/payments/${product.payment_intent}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                              >
                                                {product.payment_intent.slice(0, 6) + '...'}
                                              </a>
                                            )}
                                          </div>
                                          {product.paid ? (
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                              <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                              Paid
                                            </span>
                                          ) : (
                                            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                              <XCircle size={16} style={{ color: '#FFB800' }} />
                                              Unpaid
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>Total</span>
                                          <span>${product.total_amt || (product.retail_price * product.quantity)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span>Balance</span>
                                          <span>${product.remaining_amt || (product.retail_price * product.quantity)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {!product.paid && (
                                      <div>
                                        <div className="flex gap-x-4 p-2">
                                          <button
                                            className="flex items-center bg-[#22D3EE] text-white py-2 px-4 rounded hover:bg-[#1cb3cd] gap-x-2"
                                            onClick={() => console.log('Adjustment button clicked')}
                                          >
                                            <Plus />
                                            <span>Adjustment</span>
                                          </button>
                                          <button
                                            className="flex items-center bg-[#22D3EE] text-white py-2 px-4 rounded hover:bg-[#1cb3cd] gap-x-2"
                                            onClick={toggleDrawer}
                                          >
                                            <MoveRight />
                                            <span>Pay</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
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
                            onClick={closeDrawer}
                            aria-label="Close drawer"
                          >
                            <X size={24} />
                          </button>
                        </div>

                        {clientSecret ? (
                          <>
                            <div className="mb-4">
                              <button
                                onClick={() => setClientSecret(null)} // Reset clientSecret to go back
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                ← Back to Products
                              </button>
                            </div>
                            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                              <EmbeddedCheckout />
                            </EmbeddedCheckoutProvider>
                          </>
                        ) : (
                          <div>
                            <div className="mb-4">
                              <button
                                onClick={closeDrawer}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                ← Back
                              </button>
                            </div>
                            <div className="mt-8">
                              <h4 className="text-xl font-medium text-gray-700">Treatments</h4>
                              <div className="space-y-4 mt-4">
                                {selectedAppointment?.treatments &&
                                  selectedAppointment?.treatments.map((treatment) => (
                                    <div
                                      key={treatment.id}
                                      className="flex items-center justify-between p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                                    >
                                      <div className="flex items-center space-x-4">
                                        <input
                                          type="checkbox"
                                          value={treatment.id}
                                          checked={selectedTreatments.has(treatment.id.toString())}
                                          onChange={(e) => handleItemSelection(e, 'treatment')}
                                          disabled={treatment.paid}
                                          className="h-5 w-5 text-blue-500 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <label
                                          className={`text-lg font-semibold ${
                                            treatment.paid ? 'text-gray-400' : 'text-gray-800'
                                          }`}
                                        >
                                          {treatment.name}
                                        </label>
                                        {treatment.paid && (
                                          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                            <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                            Paid
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-col items-end space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm text-gray-600">Cost:</span>
                                          <span className="font-semibold text-gray-800">
                                            ${treatment.cost.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>

                            <div className="mt-8">
                              <h4 className="text-xl font-medium text-gray-700">Products</h4>
                              <div className="space-y-4 mt-4">
                                {productList.map((product) => (
                                  <div
                                    key={product.schedule_product_id}
                                    className="flex items-center justify-between p-4 border border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <input
                                        type="checkbox"
                                        value={product.schedule_product_id}
                                        checked={Array.from(selectedProducts).some(
                                          (item) => item.schedule_product_id === product.schedule_product_id
                                        )}
                                        onChange={(e) => handleItemSelection(e, 'product')}
                                        disabled={product.paid === true} // Disable checkbox if product is paid
                                        className="h-5 w-5 text-blue-500 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                      <label
                                        className={`text-lg font-semibold ${
                                          product.paid ? 'text-gray-400' : 'text-gray-800'
                                        }`}
                                      >
                                        {product.name}
                                      </label>
                                      {product.paid && (
                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-x-1">
                                          <CheckCircle size={16} style={{ color: '#4CAF50' }} />
                                          Paid
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex flex-col items-end space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Unit Price:</span>
                                        <span className="font-semibold text-gray-800">
                                          ${product.retail_price.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Quantity:</span>
                                        <span className="font-semibold text-gray-800">{product.quantity}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Total:</span>
                                        <span className="font-semibold text-gray-800">
                                          ${(product.retail_price * product.quantity).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>


                            <div className="mt-8">
                              <button
                                  onClick={handleProceedToCheckout}
                                  className="w-full bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition duration-200"
                              >
                                  Proceed to Payment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                                {currentTab === "Forms" && (
                                    // navigate("/submited-intake-forms-preview")
                                    <SubmitedClientIntakeForm clientId={selectedEmployeeData?.id}/>
                                )}
                               {currentTab === "chart_entries" && (
  <div>
    {/* Navbar Section */}
    <div className="bg-white shadow">
      <div className="rounded-md flex justify-between items-center p-3">
        <h2 className="text-gray-500">Chart Entries List</h2>
        <div>
          <div
            onClick={() => setChartTab("create_new_chart_entries")}
            className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md"
          >
            Create New Chart Entry
          </div>
        </div>
      </div>
      {/* Navbar Items */}
      <div className="flex items-center justify-between p-3 border-t">
        <div className="flex flex-grow">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-md p-2 w-3/4"
          />
        </div>
        <div className="flex items-center space-x-2">
          {/* Dropdown for Discharge */}
          <div className="relative">
            <button
              className="flex items-center border rounded-md p-1 bg-white text-gray-500 text-sm"
              onClick={toggleDischargeDropdown}
            >
              <FaCaretDown className="mr-1" /> {/* Down arrow icon */}
            </button>
            {isDischargeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg">
                <div className="px-4 py-2 hover:bg-gray-100" onClick={handleDischarge}>
                  Discharge
                </div>
              </div>
            )}
          </div>
          {/* Additional Navbar Items */}
          <button
            className="border rounded-md p-1 bg-white text-gray-500 text-sm"
            onClick={() => console.log("Pinned Entries")}
          >
            Pinned Entries
          </button>
          <button
            className="border rounded-md p-1 bg-white text-gray-500 text-sm"
            onClick={() => console.log("Medical Alert")}
          >
            Medical Alert
          </button>
          <button
            className="border rounded-md p-1 bg-white text-gray-500 text-sm"
            onClick={() => console.log("Filter/Export")}
          >
            Filter/Export
          </button>
          {/* Expand/Collapse All Button */}
          <button
            className="border rounded-md p-1 bg-white text-gray-500 text-sm"
            onClick={() => console.log("Toggle Expand/Collapse")}
          >
            Expand/Collapse All
          </button>
        </div>
      </div>
    </div>

    {/* Create New Chart Entry Popup */}
    {/* {chartTab === "create_new_chart_entries" && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white border border-gray-300 rounded-md shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-4">Select a Template</h2>
            {templates.map((template) => (
              <div
                key={template.value}
                onClick={() => handleOptionClick(template.value)} // Add template to created sections
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                {template.label}
              </div>
            ))}
            <button
              onClick={() => setChartTab(null)} // Close the popup
              className="mt-4 w-full bg-gray-300 text-white p-2 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    {chartTab === "create_new_chart_entries" && (
  <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white border border-gray-300 rounded-md shadow-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Select a Template</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.value}
            onClick={() => handleOptionClick(template.value)} // Add template to created sections
            className="cursor-pointer flex items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg shadow-sm transition duration-300"
          >
            {/* Template image or icon (if applicable, can be replaced with an actual image) */}
            <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex items-center justify-center">
              {/* Placeholder for icon */}
              <span className="text-lg text-gray-600">{template.icon}</span>
            </div>

            {/* Text content */}
            <div className="flex flex-col">
              <h3 className="font-medium text-sm text-gray-700">{template.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => setChartTab(null)} // Close the popup
        className="mt-4 w-full bg-gray-300 text-white p-2 rounded-md hover:bg-gray-400"
      >
        Close
      </button>
    </div>
  </div>
)}



      {/* Render Created Sections */}
      {createdSections.map((section) => renderSection(section))}
    

{/* Handle other template sections as needed... */}

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
                                {/* {currentTab === "Edit/Settings" && (
                                    <div>
                                        
                                    </div>
                                )} */}
                                {currentTab === "staff" && (
                                    <CreateStaffCard
                                        show={showCreateUserModal}
                                        onHide={() => setShowCreateUserModal(false)}
                    />
                  )}
                  {currentTab === "Files" && (
                    <div className="border p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fs-3 text-muted font-light">Files <span className="fs-6 font-light">Drag and drop files below to upload</span></h3>
                        <div className="d-flex justify-content-end align-items-center gap-[10px]">
                          {/* <ButtonGroup aria-label="Basic example">
                            <Button variant="outline-secondary" style={{ padding: "10px 10px" }}><PiGridFourFill /></Button>
                            <Button variant="outline-secondary" style={{ padding: "10px 10px" }}> <ImList /></Button>
                          </ButtonGroup> */}
                          <div>
                            <Button onClick={() => document.getElementById("fileUpload").click()} className="d-flex align-items-center gap-[5px]" style={{ color: "#22D3EE", color: "#fff" }}><GrImage />Add Files/Image</Button>
                            <input
                              type="file"
                              id="fileUpload"
                              className="d-none"
                              onChange={handleFileSelect}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <div>
                          <div
                            className="dotted-border border-secondary d-flex justify-content-center align-items-center flex-column rounded w-100 p-2 h-[200px]"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            style={{ textAlign: "center", cursor: "pointer", borderStyle: "dashed", border: "1px dashed" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" strokeLinejoin="round" className="lucide lucide-circle-arrow-up"><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="M12 16V8" /></svg>
                            <span>Drag & Drop to upload</span>
                            <input
                              type="file"
                              id="fileUpload"
                              className="d-none"
                              onChange={handleFileSelect}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                      <ListGroup>
                        {Array.isArray(uploadedFiles)&&uploadedFiles.map((item, index) => {
                          return <ListGroup.Item key={index} >
                            <div className="w-100 h-[55px] p-[10px] d-flex justify-content-between align-items-center p-1">
                              <div className="d-flex align-items-center justify-content-start gap-[5px] ">
                              <img src={item?.file_url} className="w-[50px] h-[50px] rounded" style={{objectFit:"cover"}}/>
                              <Card.Header style={{fontSize:"13px"}}>{decodeURIComponent(item?.file_url?.split('/').pop())}</Card.Header>
                              </div>
                              <div>
                                <p className="d-flex align-items-center justify-content-start gap-[10px]" style={{fontSize:"13px"}}>{moment(item?.created_at).format('MMMM DD, YYYY')}<Badge bg="secondary">PNG</Badge></p>
                              </div>
                            </div>
                          </ListGroup.Item>
                        })}
                        </ListGroup>
                      </div>
                      <Offcanvas show={enableFilesDetails} placement="end" onHide={() => { setEnableFilesDetails(false) }}>
                        <Offcanvas.Header >
                          <Offcanvas.Title className="w-100">
                            <div className=" w-100 d-flex justify-content-between align-items-center">
                              <p className="text-muted fs-4 fw-light">Edit Files</p>
                              <Button style={{ backgroundColor: "#22D3EE" }} onClick={handleSubmitFiles} disabled={selectedFiles !==null?false:true}>Save</Button>
                            </div>
                          </Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                          <p>{selectedFiles?.name}</p>
                          <div className="w-100 h-[400px] border rounded dotted-border p-2">
                            <img
                              src={previewImage}
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                              }}
                            />
                          </div>
                          <div className="mt-3">
                            <Button variant="outline-secondary" onClick={() => document.getElementById("fileUpload").click()} className="d-flex align-items-center gap-[5px]"><GrImage />Add Files/Image</Button>
                            <input
                              type="file"
                              id="fileUpload"
                              className="d-none"
                              onChange={handleFileSelect}
                            />
                          </div>
                          <div className="mt-3">
                            <Form.Group controlId="formFile" className="mb-3">
                              <Form.Label className="text-muted">File Description</Form.Label>
                              <Form.Control
                                as="textarea"
                                style={{ height: '100px' }}
                                onChange={handleDescription}
                                value={imageDescription}
                              />
                            </Form.Group>
                          </div>
                          <div className="mt-3">
                            <Form className="d-flex justify-content-between align-items-center">
                            <Form.Label className="text-muted">Include in client chart</Form.Label>
                              <Form.Check
                                type="switch"
                                id="custom-switch"
                                onChange={handleIncludeInClientChart}
                                value={includeInClientChart}
                              />
                            </Form>
                          </div>
                          <div className="mt-3">
                            <Form.Select aria-label="Default select example" onChange={handleImageVisibility} value={imageVisibility}>
                              <option value="Viewable by Everyone">Viewable by Everyone</option>
                              <option value="Viewable by all Doctors">Viewable by all Doctors</option>
                              <option value="Viewable by all Aesthetics">Viewable by all Aesthetics</option>
                              <option value="Viewable by all Consultants">Viewable by all Consultants</option>
                            </Form.Select>
                          </div>
                          <div className="d-flex justify-content-end align-items-center gap-[10px] mt-3">
                            <Button variant="danger" onClick={handleDeleteImage}><Trash2/></Button>
                            <Button style={{ backgroundColor: "#22D3EE" }} onClick={handleSubmitFiles} disabled={selectedFiles !==null?false:true}>Save</Button>
                          </div>
                        </Offcanvas.Body>
                        
                      </Offcanvas>
                    </div>
                  )}
                  {currentTab === "Groups" && (
                    <div className="border p-3 bg-white">
                      <div className="d-flex justify-content-between align-items-center">
                        <h3 className="fs-3 text-muted font-light">Groups</h3>
                        <Button variant="outline-secondary d-flex align-items-center gap-[10px]" onClick={handleCreateGroupModal}><PiPlusCircleFill /> New Group</Button>
                      </div>
                      <div>
                        <div>
                          {Array.isArray(selectedEmployeeData?.groups)&&selectedEmployeeData?.groups.map((group,index)=>{
                            return <div key={index} className="mt-2 border rounded p-3 my-2 d-flex justify-content-between align-items-center">
                            <div className="fw-bold w-100 d-flex justify-content-start align-items-center">{group?.group_name}</div>
                            <div className="fw-bold w-100 d-flex justify-content-center align-items-center">{group?.client_ids.length} Members</div>
                            <div className="w-100 d-flex justify-content-end align-items-center">
                            <OverlayTrigger
                                trigger="click"
                                placement="bottom"
                                overlay={<Popover id="date-picker-popover">
                                  <Popover.Body className="p-0 w-[200px]">
                                    <div className="d-flex justify-content-between gap-3 align-items-center">
                                      <ListGroup className="w-[200px]">
                                        <ListGroup.Item className="d-flex align-items-center gap-[5px] cursor-pointer" onClick={(e)=>{e.stopPropagation();handleEditGroup(group)}}><TbEdit size={20} />Edit</ListGroup.Item>
                                        <ListGroup.Item className="d-flex align-items-center text-danger gap-[5px] cursor-pointer" onClick={(e)=>{e.stopPropagation();handleGroup("delete",group?.id)}}><Trash2 size={20} color="red"/>Delete</ListGroup.Item>
                                      </ListGroup>
                                    </div>
                                  </Popover.Body>
                                </Popover>}
                                rootClose
                              >
                                <Button variant="outline-secondary" style={{padding:"10px 10px"}}>
                                  <BsThreeDots />
                                </Button>
                              </OverlayTrigger>
                            </div>
                          </div>
                          })}
                        
                        </div>
                        <Modal show={createGroupModal} onHide={handleCreateGroupModal}>
                          <Modal.Header closeButton>
                            <Modal.Title className="text-muted">{groupType==="create"?"New Group":"Edit Group"}</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <div>
                              <Form>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                  <Form.Label>Name of the group</Form.Label>
                                  <Form.Control type="email" placeholder="Name of The Group" required onChange={handleGroupName} value={groupType==="update"?createGroupPayload?.new_group_name:createGroupPayload?.group_name} />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                  <Form.Label>Members</Form.Label>
                                  {filterClientList.reverse()?.map((item) => {
                                    return <div className="mt-2 p-4 d-flex justify-content-between align-items-center border rounded">
                                      <div className="d-flex gap-[5px]">{item.name}{item.id===selectedEmployeeData.id &&<Badge bg="secondary">Primary</Badge>}</div>
                                      <div onClick={()=>handleRemoveGroupMember(item.id)}>
                                        <RxCross2 />
                                      </div>
                                    </div>
                                  })}
                                </Form.Group>
                              </Form>
                              <div>
                                {!showSearchClient && <Button variant="outline-secondary d-flex justify-content-start align-items-center gap-[5px]" size="sm" onClick={()=>setShowSearchClient(true)}><BsPlusCircleFill />Members</Button>}
                                {showSearchClient &&
                                <Form>
                                  <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                  <Form.Label>Add Client</Form.Label>
                                    <Form.Control type="search" placeholder="Add Client..." required onChange={(e) => { setSearchClient(e.target.value) }} />
                                  </Form.Group>
                                </Form>}
                                {searchClient && <ListGroup style={{ maxHeight: "300px", overflow: "scroll" }}>
                                  {filteredClientList.map((item) => {
                                    return <ListGroup.Item onClick={()=>handleGroupMember(item?.id)}>{item.name}</ListGroup.Item>
                                  })}
                                </ListGroup>}
                              </div>
                            </div>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button variant="outline-secondary" onClick={handleCreateGroupModal}>
                              Cancel
                            </Button>
                            <Button variant="primary" 
                            onClick={()=>
                              {groupType==="create"? handleGroup("create"): handleGroup("update")}
                            }
                            disabled={handleDisableCreateGroup()}>
                            {groupType==="create"?"Create":"Edit"}
                            </Button>
                          </Modal.Footer>
                        </Modal>
                        
                      </div>
                    </div>
                  )}
                  {currentTab === "Messages" && (
                    <div>
                      <div className="bg-white p-3 rounded">
                        <Row xs={6} sm={6} md={6} lg={6} >
                          <Col xs={6} sm={6} md={6} lg={6}>
                            <div className="d-flex justify-content-between align-items-center">
                              {topleftCardsData.map((item, index) => {
                                return <div onMouseOver={() => handleLeftCardClick(index)} onMouseOut={handleLeftCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                  <ReactCardFlip isFlipped={flipLeftCardIndex === index} flipDirection="horizontal">
                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                      <div className="h2 text-secondary">
                                        <CountUp end={item.count} />
                                      </div>
                                      <div className="h6 text-center text-muted">{item.label}</div>
                                    </div>
                                    <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                      <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                    </div>
                                  </ReactCardFlip>
                                </div>
                              })}
                            </div>
                          </Col>
                          <Col xs={6} sm={6} md={6} lg={6}>
                            <div className="d-flex justify-content-end align-items-center gap-[40px]">
                              {topRightCardsData.map((item, index) => {
                                const { mainAmount, decimalPart } = formatAmount(item.count);
                                return <div onMouseOver={() => handleRightCardClick(index)} onMouseOut={handleRightCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                  <ReactCardFlip isFlipped={flipRightCardIndex === index} flipDirection="horizontal">
                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                      <div className="h2 text-secondary d-flex justify-content-start">
                                        <span className="fs-6 mt-[4px]">$</span>
                                        <span className="large"> <CountUp end={mainAmount} />{ }</span>
                                        <span className="fs-6  mt-[4px]">{decimalPart}</span>
                                      </div>
                                      <div className="h6 text-center text-muted">{item.label}</div>
                                    </div>
                                    <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                      <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                    </div>
                                  </ReactCardFlip>
                                </div>
                              })}
                            </div>
                          </Col>
                        </Row>
                      </div>
                      <div className="mt-3 bg-white border rounded p-3">
                        <ListGroup>
                          <ListGroup.Item onClick={handleMessageDetails} className="cursor-pointer">
                            <div>
                              <Row>
                                <Col xs={11} sm={11} md={11} lg={11}>
                                <div>
                                  <p className="mb-0 text-dark" style={{fontSize:"13px"}}>Payment Receipt - December 12, 2024 4:02 AM</p>
                                  <p className="mb-0 text-muted" style={{fontSize:"13px"}}>Your receipt.Hello Tester,You have a new receipt available. Please visit the link below to securely review, download, or print your receipt.View Receipt [LINK] Thanks for choosing ReplenishMD.ReplenishMD - Concierge 1818 Washington Ave Houston, TX 77007-6131[LINK]</p>
                                </div>
                                </Col>
                                <Col xs={1} sm={1} md={1} lg={1}>
                                  <Badge bg="warning" text="dark">Delivered</Badge>
                                </Col>
                              </Row>
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                        <MessagesDetails/>
                      </div>
                    </div>
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
