import React, { useEffect, useState, useRef } from "react";
import { useAuthContext } from "../context/AuthUserContext";
import { createIntakeForm, getIntakeForm, updateIntakeForm, getQuestionnaires, getQuestionnaire } from "../Server";
import { toast } from "react-toastify";
import Select from "react-select";
import { confirmAlert } from "react-confirm-alert";
import { useNavigate } from 'react-router-dom';
import { PiGridNineLight } from "react-icons/pi";
import { TopModel } from "../components/TopModel";
import { IoDocumentText } from "react-icons/io5";
import { template } from "lodash";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { TbSignature } from "react-icons/tb";
import { FaHeading } from "react-icons/fa6";
import { TbCheckbox } from "react-icons/tb";
import { RxDropdownMenu } from "react-icons/rx";
import { BsSliders2 } from "react-icons/bs";
import { PiWarningCircleBold } from "react-icons/pi";
import Questionnaires from "./Questionnaires";
import { FaBook, FaUndo } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import SignatureCanvas from "react-signature-canvas";
import { DropDown } from "../components/DropDown/DropDown";
import { Range } from "react-range";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { PiColumnsFill } from "react-icons/pi";
import Switch from "@mui/material/Switch";


const Tabs = [
  {
    tab_name: "General",
    value: 0
  },
  // {
  //   tab_name: "Appoinment Type",
  //   value: 1
  // },
  {
    tab_name: "Profile Fields",
    value: 2
  },
  // {
  //   tab_name: "Credit cards",
  //   value: 3
  // },
  {
    tab_name: "Questionnaires",
    value: 4
  },
  {
    tab_name: "Consents",
    value: 5
  },
  // {
  //   tab_name: "Form Preview",
  //   value: 6
  // }
];

// const questionnaireTabs = [
//   {
//     tab_name: "Items",
//     value: 0
//   },
//   {
//     tab_name: "Templates",
//     value: 1
//   }
// ];

// const qutionaryInputOption = [
//   {
//     label: "Note",
//     icon: <BsFileEarmarkTextFill />,
//     description: "A Plain Text Area To Types Notes",
//   },
//   {
//     label: "Signature",
//     icon: <TbSignature />,
//     description: "Add A Signature By Drawing Or Typing",
//   },
//   {
//     label: "Heading",
//     icon: <FaHeading />,
//     description: "A Simple Heading",
//   },
//   {
//     label: "Check Boxes",
//     icon: <TbCheckbox />,
//     description: "Select One or More CheckBoxes And Correctly And Operationally Add A Note To Each",
//   },
//   {
//     label: "Drop Down",
//     icon: <RxDropdownMenu />,
//     description: "Select One Option From List Of Options In A Drop Down Menu",
//   },
//   {
//     label: "Range/Scale",
//     icon: <BsSliders2 />,
//     description: "A Customizable Range/Scale Slicer Allows You To Choose From A Range Of Values"
//   },
//   {
//     label: "Instruction",
//     icon: <PiWarningCircleBold />,
//     description: "Add Instructions To Your Template That Will Noe Be Visible When Exploring Or Printing The Chart",
//   },
// ];

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
    input_name: "Preferred Name (if dirrerent)",
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

const valiadte = [
  { value: 'forever', label: 'Forever' },
  { value: '3 days', label: '3 days' },
  { value: '1 week', label: '1 week' },
  { value: '2 weeks', label: '2 weeks' },
  { value: '3 weeks', label: '3 weeks' },
  { value: '1 month', label: '1 month' },
  { value: '2 months', label: '2 months' },
  { value: '3 months', label: '3 months' },
  { value: '4 months', label: '4 months' },
  { value: '5 months', label: '5 months' },
  { value: '6 months', label: '6 months' },
  { value: '7 months', label: '7 months' },
  { value: '8 months', label: '8 months' },
  { value: '9 months', label: '9 months' },
  { value: '10 months', label: '10 months' },
  { value: '11 months', label: '11 months' },
  { value: '1 year', label: '1 year' },
  { value: '2 years', label: '2 years' },
  { value: '3 years', label: '3 years' },
  { value: '4 years', label: '4 years' },
  { value: '5 years', label: '5 years' },
  { value: '6 years', label: '6 years' },
  { value: '7 years', label: '7 years' },
  { value: '8 years', label: '8 years' },
  { value: '9 years', label: '9 years' },
  { value: '10 years', label: '10 years' }
];

const consentType = [
  { value: 'must agree', label: 'Must Agree' },
  { value: 'agree or disagree', label: 'Agree or Disagree' },
  { value: 'acnowledge with initials', label: 'Acknowledge with Initials' },
];

const initialConsent =  { name: "", text: "",type:"must agree", declaration : "" };

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

const qutionaryInputOption = [
  {
    label: "Note",
    icon: <BsFileEarmarkTextFill />,
    field: "initialNote",
    description: "A Plain Text Area To Types Notes",
  },
  {
    label: "Signature",
    icon: <TbSignature />,
    field: "initialSignature",
    description: "Add A Signature By Drawing Or Typing",
  },
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
    value: "Heading value",
    required: false,
    read_only: false,
  },
  initialCheckBox: {
    id: null,
    type: "checkbox",
    label: "CheckBox",
    layout: "horizontal",
    value: [
      { label: "CheckBox 1", value: true },
      { label: "CheckBox 2", value: false },
      { label: "CheckBox 3", value: false },
      { label: "CheckBox 4", value: false },
      { label: "CheckBox 5", value: false },
      { label: "CheckBox 6", value: false },
    ],
    required: false,
    read_only: false,
  },
  initialDropdown: {
    id: null,
    type: "dropdown",
    label: "Dropdown",
    drop_down_value: "",
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
    value: [{ label: "Range 1", value: 10 }],
    required: false,
    read_only: false,
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

const fonts = [
  { label: "text", class: "pinyon-script-regular" },
  { label: "text", class: "great-vibes-regular" },
  { label: "text", class: "herr-von-muellerhoff-regular" },
];

const NewIntakeForm = () => {
  const { authUserState } = useAuthContext();
  const navigate = useNavigate();  
  const [selectedTab, setSelectedTab] = useState(4);
  const [templateTabsPopup, setTemplateTabsPopup] = useState(0);
  const [changes, setChanges] = useState(false)
  const topModelRef = useRef(null);
  const [questionnaireForms, setQuestionnaireForms]=useState()
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
  const [intakeFormError, setIntakeFormError] = useState({
    name:"",
    prompt_type:"",
    valid_for:"",
    form_data:{consents:{
      signature:"",
      consentForms: []
    }}
  });
  const [editedId, setEditedId] = useState();
  const [duplicateId, setDuplicateId] = useState();

  const [formChanges,setFormChanges] = useState(false)
  const [formChanged,setFormChanged] = useState(false)

  const location = useLocation();
  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [inputHover, setInputHover] = useState(null);
  const [optionModel, setOptionModel] = useState(false);
  const [qutionaryFields, setQutionaryFields] = useState([]);
  const [drawSignarure, setDrawSignarure] = useState();
  const [values, setValues] = useState(
    qutionaryInputs?.initialRange?.value.map((v) => v.value)
  );
  const [editModel, setEditModel] = useState({ name: "", index: "" });

  useEffect(() => {
    setIntakeFormData((prev)=>({...prev,form_data:{...prev.form_data,questionnaires:[...qutionaryFields]}}))
  },[qutionaryFields])

  console.log("intakeFormDataintakeFormData",intakeFormData);

  const handleOnChange = (fieldName, index, value) => {
    setChanges(true);
    const copyProfileFields = [...intakeFormData?.form_data?.profile_fields];
    copyProfileFields[index][fieldName] = value;
    setIntakeFormData((prev) => ({ ...prev, form_data: { ...prev?.form_data, profile_fields: copyProfileFields } }));
  };

  const duplicate_employee_intake_form = () => {
    setIntakeFormData((prev) => {
      const { id, employee, ...rest } = prev;
      return {
        ...rest,
        employee_id: authUserState?.user?.id,
      };
    });
  };

  const addConsent = () => {
    setIntakeFormData((prev)=>({...prev,form_data:{...prev?.form_data,consents:{...prev?.form_data?.consents,consentForms:[...prev?.form_data?.consents?.consentForms,initialConsent]}}}))
  };

  const removeConsent = (index) => {
    if (index >= 0) {
      const newConsents = intakeFormData?.form_data?.consents?.consentForms
      const afterDelete = newConsents.filter((_,i)=>(index !== i))
      setIntakeFormData((prev)=>({...prev,form_data:{...prev?.form_data,consents:{...prev?.form_data?.consents,consentForms:afterDelete}}}))

    }
  };

  const handleConsentChange = (index, field, value) => {
    setChanges(true);
    setIntakeFormData((prevState) => {
      const updatedConsents = [...prevState?.form_data?.consents?.consentForms];
      const updatedConsent = { ...updatedConsents[index], [field]: value };

      if (field === "type") {
        if (value === "agree or disagree") {
          updatedConsent.declaration = "";
          updatedConsent.disagreeOption = "";
        } else if (value === "must agree") {
          updatedConsent.declaration = "";
          delete updatedConsent?.disagreeOption;
        } else {
          delete updatedConsent.declaration;
          delete updatedConsent.disagreeOption;
        }
      }

      updatedConsents[index] = updatedConsent;

      return {
        ...prevState,
        form_data: {
          ...prevState?.form_data,
          consents: {
            ...prevState?.form_data?.consents,consentForms:updatedConsents
          },
        },
      };
    });
  };

  const formValidation = () => {
    let hasError = false;

    const newConsentsError = intakeFormData?.form_data?.consents?.consentForms?.map(() => ({}));

    intakeFormData?.form_data?.consents?.consentForms?.forEach((consent, index) => {
      const { name, text, type, declaration, disagreeOption } = consent;
      const consentErrors = {};

      if (name === "") consentErrors.name = "Name can't be blank";
      if (type === "") consentErrors.type = "Type can't be blank";
      if (declaration === "") consentErrors.declaration = "Declaration can't be blank";
      if (disagreeOption === "") consentErrors.disagreeOption = "Disagree Option can't be blank";

      if (Object.keys(consentErrors)?.length > 0) {
        hasError = true;
        newConsentsError[index] = consentErrors;
      }
    });

    const newFormErrors = {
      ...intakeFormError,
      form_data: {
        ...intakeFormError?.form_data,
        consents: {
          ...intakeFormError?.form_data?.consents,consentForms:newConsentsError
        }
      }
    };

    if (intakeFormData?.name === "") {
      hasError = true;
      setIntakeFormError((prev)=>({...prev,["name"]:"Name can't be blank"}))
    }

    if (intakeFormData?.prompt_type === "") {
      hasError = true;
      setIntakeFormError((prev)=>({...prev,["prompt_type"]:"prompt_type can't be blank"}))
    }

    if (intakeFormData?.valid_for === "") {
      hasError = true;
      setIntakeFormError((prev)=>({...prev,["valid_for"]:"valid_for can't be blank"}))

    }

    setIntakeFormError(newFormErrors);

    if (hasError) {
      toast.error("Something went wrong");
      return false;
    } else {
      return true;
    }
  };

  const submitData = async (e) => {
    e.preventDefault()
    if(formValidation()){
    try {
      const response = await createIntakeForm(intakeFormData);
      if (response.status === 201) {
        toast.success("Intake form successfully created");
        setTimeout(() => { window.location.replace("/intake-forms"); }, 1500);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log("err", error?.response?.data?.error);
      setIntakeFormError((prev)=>({...prev,...error?.response?.data?.error}))
    }
  }
  };


  const upadteData = async (e) => {
    e.preventDefault()
    if(formValidation()){
    try {
      const response = await updateIntakeForm(intakeFormData?.id, intakeFormData);
      if (response?.status === 200) {
        toast.success("Intake form successfully updated");
        setTimeout(() => { window.location.replace("/intake-forms"); }, 1500);
        setIntakeFormData(response?.data)
      }
    } catch (error) {
      toast.error("Something Went Wrong ");
      console.log("err", error?.response?.data?.error);
      setIntakeFormError((prev)=>({...prev,...error?.response?.data?.error}))
    }
  }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window?.location?.search);
    setEditedId(urlParams.get('intake-form-id'))
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window?.location?.search);
    setDuplicateId(urlParams.get('duplicate-intake-form-id'))
  }, [])

  const editData = async () => {
    try {
      const response = await getIntakeForm(editedId);
      if (authUserState?.user?.is_admin ||(authUserState?.user?.id === response?.data?.employee?.id)) {
        if (response.status === 200) {
          setIntakeFormData(response.data);
        } else {
        }
      }else{
        navigate('/intake-forms')
        toast.error("You don't have permission to edit this intake form");
      }
    } catch (err) {
    }
  };

  const duplicateIntakeForm = async () => {
    try {
      const response = await getIntakeForm(duplicateId);
      if (response.status === 200) {
        setIntakeFormData(response.data);
      } else {
      }
    } catch (err) {
    }
  };



  console.log("intakeFormData", intakeFormData);

  const openModalFromParent = () => {
    console.log(topModelRef?.current);
    if (topModelRef?.current) {
      topModelRef?.current?.openModal();
    }
  };
  
  const closeModel = () =>{
    if (topModelRef?.current) {
      topModelRef?.current?.closeModal();
    }
  }

  useEffect(() => {
    if (editedId) {
      editData();
    }
  }, [editedId]);

  useEffect(() => {
    if (duplicateId) {
      duplicateIntakeForm();
    }
  }, [duplicateId]);


  const returnToIntakeForm = () => {
    confirmAlert({
      title: "Return To Intake Forms ",
      message: `Are you sure Return to Intake Forms ?`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            navigate('/intake-forms');
            setChanges(false)
          },
        },
        {
          label: "No",
          onClick: () => {
          },
        },
      ],
    });
  }


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
              setFormChanged(true);
            },
          },
          {
            label: "No",
          },
        ],
      });
    }
    else{
      // setTemplateTabs("templates list");
    }
  }

  const createQutionaryFields = (intialFieldName) => {
    setQutionaryFields((prev) => [
      ...prev,
      { ...qutionaryInputs[intialFieldName], id: qutionaryFields.length + 1 },
    ]);
  };
  
  // useEffect(()=>{
  //   setQutionaryFields([])

  // },[formChanged])

  // useEffect(() => {
  //   setQuestionnaireFormData((prev) => ({
  //     ...prev,
  //     template: { ...prev.template, ["qutionaryFields"]: qutionaryFields },
  //   }));
  // }, [qutionaryFields]);



  // ----------------------------------------------------
  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const base64Signature = sigCanvasRef.current.toDataURL();
      setDrawSignarure(base64Signature);
      console.log(base64Signature);
    }
  };

  const handleSave = () => {
    console.log("Save button clicked");
  };
  // ---------------------------------------------------
  // qutionaryFields onchange

  // topModel Open
  // const openModalFromParent = () => {
  //   console.log(topModelRef?.current);
  //   if (topModelRef?.current) {
  //     topModelRef?.current?.openModal();
  //   }
  //   setChanges(false);
  // };
  // // topModel Open
  // const closeModel = () => {
  //   if (topModelRef?.current) {
  //     topModelRef?.current?.closeModal();
  //   }
  // };



  const templateData = async (templateId) => {
    console.log();
    try {
      const response = await getQuestionnaire(templateId, true);    
      // if (authUserState?.user?.is_admin ||(authUserState?.user?.id === response?.data?.employee?.id)) {
        if (response.status === 200) {
          console.log("response.data?.qutionaryFields", response.data?.template?.qutionaryFields);
          toast.success("Questionnaire Template successfully fetched");
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



  useEffect(() => {
    const fetchData = async (refetch = true) => {
      try {
        const response = await getQuestionnaires( refetch );
        if (response.status === 200) {
          setQuestionnaireForms(response.data);
        }
      } catch (error) {
        console.error("Error fetching intake forms:", error);
      }
    };
    fetchData();
  }, []);

  console.log("qutionaryFields", qutionaryFields);


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
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
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

  // Option Values Changes for DropDown, Range, CheckBox
  const handleOptionsChange = (objIndex, optionIndex, key, value) => {
    setQutionaryFields((prev) => {
      console.log(objIndex, optionIndex, key, value);
      const updatedFields = [...prev];
      const copyObj = [...updatedFields[objIndex]?.value];
      copyObj[optionIndex] = { ...copyObj[optionIndex], [key]: value };
      updatedFields[objIndex] = { ...updatedFields[objIndex], value: copyObj };
      return updatedFields;
    });
    setChanges(true);
  };

  // Delete options for Dropdown, range, CheckBox
  const deleteOption = (objIndex, optionIndex) => {
    console.log(objIndex, optionIndex);
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

  const handleItemClick = (name, index) => {
    setEditModel({ name, index });
    openModalFromParent(); // Call this function immediately after updating the state
  };

  useEffect(() => {
    if (editModel.name) {
      openModalFromParent(); // Ensure the modal opens when editModel changes
    }
  }, [editModel]);

  return (
    <div className={`bg-gray-200   p-3 px-4 ${selectedTab === 2 ? "" : ""}`}>
      <div className="w-[82rem] mx-auto h-full bg-white  rounded-md px-16 py-1">
        <div className="flex justify-between items-center w-full h-[100px] text-gray-500">
          {editedId ? <h2>Update Intake Form</h2> : duplicateId ? <h2>Duplicate Intake Form</h2> : <h2>New Intake Form</h2>}
          {/* <Link className="no-underline" to={"/intake-forms"}> */}
            <div onClick={()=>{(changes) ?returnToIntakeForm() : navigate('/intake-forms');}} className="border-[2px]  text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Return to Intake Form</div>
          {/* </Link> */}
        </div>
        <div className=" ">
          <div className="h-full  pb-0">
            {/* Tabs */}
            <div className="h-[55px] flex items-end border-b-[2px] relative ">
              <div className="flex w-full absolute bottom-[-2px]">
                {Tabs.map((tab, index) => (<div key={index} className={` tabs cursor-pointer ${selectedTab === tab.value ? "selected-tab " : "border-0"}`} onClick={() => { setSelectedTab(tab.value) }}><span>{tab.tab_name}</span></div>))}
              </div>
            </div>
            {/* Tab contents */}
            <form onSubmit={(e) => { (editedId) ? upadteData(e) : submitData(e) }} className=" py-2   m-0">
              <div className="h-full ">

              {/* Profile fields Tab */}
                {selectedTab === 0 && <div className="">
                  <div className="h-[50px] flex items-center">
                    <div>
                      <h3 className="m-0">General</h3>
                    </div>
                  </div>
                  <div className="  ">
                    <div className="h-[65%] flex flex-col justify-between">
                      {/* input 1 */}
                      <div className="flex">
                        <div className="w-3/4">
                          <label className="text-[18px] ">
                            Name -<em> Required</em>
                          </label>
                        </div>
                        <div className="w-1/4 flex flex-col gap-[1px] ">
                          <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300" >
                            <input className="focus:outline-none w-full" type="text" value={intakeFormData.name} required onChange={(e) => { setChanges(true); setIntakeFormData((prev) => ({ ...prev, ["name"]: e.target.value })) }} />
                          </div>
                          <div className="text-red-400 text-sm">
                            {intakeFormError?.name}
                          </div>
                        </div>
                      </div>
                      <hr />
                      {/* input 2 */}
                      <div className="flex ">
                        <div className="w-3/4 ">
                          <label >
                            <div className="text-[18px] "> Automatic or Manual -<em> Required</em></div>
                            <div><em>Choose if client will be automatically prompted to complete this take form.</em></div>
                          </label>
                        </div>
                        <div className="w-1/4 flex flex-col gap-[1px]">
                          <Select
                            inputId="availableEmployee"
                            value={automaticOrManual.find(option => option.value === intakeFormData.prompt_type)}
                            isClearable
                            onChange={(e) => {
                              setChanges(true);
                              setIntakeFormData((prev) => ({ ...prev, ["prompt_type"]: e?.value }))
                            }}

                            options={automaticOrManual}
                            defaultValue={"Automatic"}
                            required
                          />
                          <div className="text-red-400 text-sm">
                            {intakeFormError?.prompt_type}
                          </div>
                        </div>
                      </div>
                      <hr />
                      {/* input 3 */}
                      <div className="flex ">
                        <div className="w-3/4 ">
                          <div className=" ">
                            <div className="text-[18px]">Required for New & Existing Clients as of this Date</div>
                            <div><em>Require clientes to fill out this intake form for their first booking after this date. even if they <br /> have previously filled out an intake form. Leave blank to not require this intake form for <br /> clients that have already visited </em></div>
                          </div>
                        </div>
                        <label className="w-1/4 flex flex-col gap-[1px]" htmlFor="date" >
                          <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300" >
                            <input className="focus:outline-none w-full" value={intakeFormData.effective_date} id="date" type="date" onChange={(e) => {setChanges(true); setIntakeFormData((prev) => ({ ...prev, ["effective_date"]: e.target.value })) }} />
                          </div>
                        </label>
                      </div>
                      <hr />
                      {/* input 4 */}
                      <div className="flex ">
                        <div className="w-3/4  ">
                          <label >
                            <div className="text-[18px]"> Validate for -<em> Required </em></div>
                            <div><em>client should complete this intake from again after this period </em></div>
                          </label>
                        </div>
                        <div className="w-1/4 flex flex-col gap-[1px]">
                          <Select
                            inputId="availableEmployee"
                            isClearable
                            onChange={(e) => {
                              setChanges(true);
                              setIntakeFormData((prev) => ({ ...prev, ["valid_for"]: e?.value }))
                            }}
                            options={valiadte}
                            value={valiadte.find(option => option.value === intakeFormData.valid_for)}
                            required
                          />
                          <div className="text-red-400 text-sm">
                            {intakeFormError?.valid_for}
                          </div>
                        </div>
                      </div>
                      <hr />
                      {/* input 5 */}
                      <div className="flex ">
                        <div className="w-3/4 text-[18px]">
                          <label>
                            Introduction
                          </label>
                        </div>
                        <div className="w-1/4 ">
                          <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300 h-full" >
                            <textarea value={intakeFormData.introduction} onChange={(e) => { setChanges(true); setIntakeFormData((prev) => ({ ...prev, ["introduction"]: e.target.value })) }} className="w-full focus:outline-none h-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <div>Introduction preview:</div>
                      <div className="flex flex-col gap-[10px]">
                        <div className="h-[60px] flex items-center text-gray-500 border-[2px] px-3">{intakeFormData?.introduction}</div>
                        <div className="h-[60px] flex items-center bg-slate-200 px-3 text-[18px] text-[#49c1c7]">View Formatting Instructions</div>
                      </div>
                      <div className=" flex items-center justify-end py-1">
                        <button className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" onClick={() => { setSelectedTab(2); }}>
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>}

              {/* Profile fields Tab */}
                {/* {selectedTab === 1 && <div className="h-full">
                  <div className="h-[50px] flex items-center">
                    <div>
                      <h3 className="m-0">Appoinment Type</h3>
                    </div>
                  </div>
                  <div className=" h-[calc(100%-50px)] overflow-y-auto flex flex-col gap-2 ">
                    <div> Select the appointment type for which this intake form is require</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-3">
                        <input type="radio" name="appoinment" value={"All Appoinments"} onChange={(e) => { setIntakeFormData({ ...intakeFormData, appointment_type: e.target.value }) }} />
                        <label>All Appoinments</label>
                      </div>
                      <div className="flex gap-3">
                        <input type="radio" name="appoinment" value={"A Specific staff Member"} onChange={(e) => { setIntakeFormData({ ...intakeFormData, appointment_type: e.target.value }) }} />
                        <label>A Specific staff Member</label>
                      </div>
                      <div className="flex gap-3">
                        <input type="radio" name="appoinment" value={"Specific treatments"} onChange={(e) => { setIntakeFormData({ ...intakeFormData, appointment_type: e.target.value }) }} />
                        <label>Specific treatments</label>
                      </div>
                    </div>
                    <div>
                      {intakeFormData.appointment_type === "A Specific staff Member" && <div>
                        <DropDown options={specific_staff_member} onChange={(e) => console.log(e)} />
                      </div>}
                      {intakeFormData.appointment_type === "Specific treatments" && <div>
                        {Specific_treatments.map((option, index) => (
                          <div className="flex gap-3" key={index}>
                            <input type="checkbox" />
                            <label>{option}</label>
                          </div>
                        ))}
                      </div>}
                    </div>
                    <div className="flex justify-end py-1">
                      <button className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" onClick={() => { setSelectedTab(2) }}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>} */}

              {/* Profile fields Tab */}
                {selectedTab === 2 && <div className="h-full">
                  <div className="h-[50px] flex items-center ">
                    <div>
                      <h3 className="m-0">Profile Fields</h3>
                    </div>
                  </div>
                  <div className="  py-2 ">
                    <div className="h-full  pr-2">
                      <div className="h-[70px] sticky top-0 bg-white z-20 grid grid-rows-[auto,1fr]">
                        <h6 className="">Select the fields you would like the Client to fill out in this intake form: </h6>
                        <div className="h-full w-full pt-2">
                          <div className="grid grid-cols-[75%,25%] text-[18px] text-black font-medium items-center">
                            <div>Field</div>
                            <div className="grid grid-cols-[60%,40%] text-center">
                              <div className="">Include In Intake</div>
                              <div className="">Required</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col h-full   ">
                        {(Array.isArray(intakeFormData?.form_data?.profile_fields) && intakeFormData?.form_data?.profile_fields).map((field, index) => (
                          <div key={index} className={`grid grid-cols-[75%,25%] py-[10px] border-b`}>
                            <div>
                              <div>{field.input_name}</div>
                              <div dangerouslySetInnerHTML={{ __html: field?.discription }}></div>
                            </div>
                            <div className="inline-grid grid-cols-[60%,40%] justify-center">
                              <div className="flex items-center justify-center">
                                <input
                                  className={`${(field.input_name === "First Name" || field.input_name === "Last Name" || field.input_name === "Email") ? "required-checkbox" : "non-required-checkbox"}`}
                                  type="checkbox"
                                  readOnly={field.input_name === "First Name" || field.input_name === "Last Name" || field.input_name === "Email" ? true : false}
                                  checked={field.include_in_intake}
                                  onChange={(e) => { if (!(field.input_name === "First Name" || field.input_name === "Last Name" || field.input_name === "Email")) { handleOnChange("include_in_intake", index, e.target.checked) } }}
                                />
                              </div>
                              <div className="flex items-center justify-center">
                                <input
                                  className={`${(field.input_name === "First Name" || field.input_name === "Last Name" || field.input_name === "Email") ? "required-checkbox" : "non-required-checkbox"}`}
                                  type="checkbox"
                                  disabled={!field.include_in_intake}
                                  checked={field.required}
                                  onChange={(e) => { if (!(field.input_name === "First Name" || field.input_name === "Last Name" || field.input_name === "Email")) { handleOnChange("required", index, e.target.checked) } }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center justify-end py-1 px-10 gap-2">
                          <button type="button" onClick={() => { setSelectedTab(4) }} className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

              {/* Profile fields Tab */}
                {/* {selectedTab === 3 && <div>
                  <div className="h-[50px] flex items-center">
                    <div>
                      <h3 className="m-0">Credit cards</h3>
                    </div>
                  </div>
                  <div className=" h-[calc(100%-50px)] overflow-y-auto">
                    <div></div>
                    <div></div>
                  </div>
                </div>} */}

              {/* Questionnaires Tab */}
                {selectedTab === 4 && (
                  <div>
                    <div className="h-[50px] flex items-center">
                      <div>
                        <h3 className="m-0">Intake Questionnaires</h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p>
                        Intake questionnaires can be used to collect any information you would like about your client, such as medical hstroy. The questionnaire will be added to the client's charts when it is filled out .
                      </p>
                    </div>
                    <div>
                      <p>
                        Templates from the chart library can be added to questionnaire, but any inadmissible items(Spine, Body chart, Upload, Vitals, Chief Complaint, Sketch, Side-By-Side, And Smart Options & Narrative) will be removed before adding.
                      </p>
                    </div>
                    <div>
                      <p>
                        Building a questionnaire is just like building a chart template. <span className="text-[#22d3ee]">Learn How To Build A Template</span>
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-end">
                        <div onClick={() => {confirmToDiscard()}} className="border-[2px] cursor-pointer text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Reset Questionnaires</div>
                      </div>
                      <div className=" ">
      <div className="bg-white ">
        <div className=" py-3 flex flex-col gap-4">
          {Array.isArray(qutionaryFields) &&
            qutionaryFields.map((field, index) =>
              field?.type === "textarea" ? (
                <>
                  {/* Note */}
                  <div
                    className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1"
                    onClick={() => {
                      // setEditModel({ name: "initialNote", index: index });
                      // openModalFromParent();
                      handleItemClick('initialNote', index)
                    }}
                  >
                    <div className="flex justify-between items-center py-1">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
                    </div>
                    <div className="border rounded-md overflow-hidden border-black p-1 bg-white ">
                      <textarea
                        className="w-full focus:outline-none"
                        readOnly={field?.read_only}
                        required={field?.required}
                        value={qutionaryFields[index]?.value}
                        onChange={(e) => {
                          handleChange("value", e?.target?.value, index);
                        }}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </>
              ) : field?.type === "signature" ? (
                <>
                  {/* Signature */}
                  <div
                    className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1"
                    onClick={() => {
                      // setEditModel({ name: "initialSignature", index: index });
                      // openModalFromParent();
                      handleItemClick('initialSignature', index)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between py-1">
                        <div className="flex gap-3">
                          <div className="flex gap-2">
                            <input
                              type="radio"
                              name="sign"
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
                              name="sign"
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
                    onClick={() => {
                      // setEditModel({ name: "initialHeading", index: index });
                      // openModalFromParent();
                      handleItemClick('initialHeading', index)
                    }}
                  >
                    <div className="flex justify-between items-center ">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
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
                    onClick={() => {
                      // setEditModel({ name: "initialCheckBox", index: index });
                      // openModalFromParent();
                      handleItemClick('initialCheckBox', index)
                    }}
                  >
                    <div className="flex flex-col ">
                      <div className="flex justify-between items-center py-1">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                        <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div>
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
                                id={checkbox?.label}
                                readOnly={field?.read_only}
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
                    onClick={() => {
                      // setEditModel({ name: "initialDropdown", index: index });
                      // openModalFromParent();
                      handleItemClick('initialDropdown', index)
                    }}
                  >
                    <div className="flex justify-between items-center ">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
                    </div>
                    <div className="py-3">
                      <div className="w-[300px]">
                        <Select
                          inputId="availableEmployee"
                          isClearable
                          options={field?.value}
                          onChange={(e) => {
                            handleChange("drop_down_value", e?.value, index);
                          }}
                          readOnly={field?.read_only}
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
                    onClick={() => {
                      // setEditModel({ name: "initialRange", index: index });
                      // openModalFromParent();
                      handleItemClick('initialRange', index)
                    }}
                  >
                    <div className="flex justify-between items-center ">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={field.value.length}
                        className="w-full"
                        onChange={(e) => {
                          handleChange(
                            "range_value",
                            field.value[e.target.value],
                            index
                          );
                        }}
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
                    onClick={() => {
                      setEditModel({
                        name: "initialInstruction",
                        index: index,
                      });
                      openModalFromParent();
                    }}
                  >
                    <div className="flex justify-between items-center  py-1">
                      <div className="font-semibold text-[17px]">
                        {field?.label}
                      </div>
                      <div className="text-[20px] cursor-pointer">
                        <BsThreeDotsVertical />
                      </div>
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
            <div className="flex flex-col justify-end items-center h-[40vh]">
              <div className="flex justify-center flex-col text-center">
                <p>This intake form questionnaire is currently empty!</p>
                <p>Build it out by adding items</p>
              </div>
              <div className="flex justify-between gap-4">
                <button type="button" className="bg-[#e5e7eb] border-[1px] border-[#cccccc] px-4 py-2 rounded-md flex gap-2 items-center">
                  <FaBook className="text-black" />
                  Template Library
                </button>
                <div className="relative">
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
                    className="flex gap-2 justify-end items-center pl-3 pr-2 py-[8.5px] rounded-md"
                    onClick={() => {
                      openModalFromParent();
                      setEditModel({ name: "gridModel", index: null });
                    }}
                  >
                    <PiGridNineLight />
                  </button>
                  <button
                    type="button"
                    className="whitespace-nowrap flex gap-2 justify-center items-center pl-2 pr-6 py-[8.5px] rounded-md"
                    onClick={() => {
                      setOptionModel(!optionModel);
                    }}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
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
                  className="w-full focus:outline-none max-h-[70px]"
                  value={qutionaryFields[editModel?.index]?.value}
                  onChange={(e) => {
                    handleChange("value", e?.target?.value, editModel?.index);
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
                    <label htmlFor="horizontal">Horizondal</label>
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
                  {Array.isArray(qutionaryFields) &&
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
              <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
                <div className="grid grid-cols-[1fr,25%] items-center py-1 bg-gray-200">
                  <div className="pl-4">Options</div>
                  <div className="flex justify-center">Action</div>
                </div>
                <div className="top-model-table">
                  {Array.isArray(qutionaryFields) &&
                    qutionaryFields[editModel?.index].value.map((option, i) => (
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
                            templateData(template?.id);
                            setEditModel({
                              name: template?.field,
                              index: null,
                            });
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
                    </div>
                    <div className="flex justify-end py-1">
                      <button
                        type="button"
                        className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md"
                        onClick={() => {
                          setSelectedTab(5);
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              {/* Consent Tab */}
                {selectedTab === 5 && (
                  <div className="h-full overflow-y-auto">
                    <div className="p-3 w-full">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="pb-1">Consents</h3>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-[18px] m-0 pb-1">
                              Require Signature
                            </p>
                            <p className="text-gray-400 text-[16px] m-0">
                              Requires your clients to sign this intake form by
                              drawing or typing with a script font of their choice
                            </p>
                          </div>
                          <div>
                            <input type="checkbox" checked={intakeFormData?.form_data?.consents?.signature} onChange={(e)=>{ setChanges(true); setIntakeFormData((prev)=>({...prev,form_data:{...prev.form_data, consents:{...prev.form_data.consents,signature:e?.target?.checked}}}))}}/>
                            <label className="ml-2">Require Signature</label>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <p className="text-black text-[16px] mb-0">
                        Require the client to agree to any number of consents
                        or waivers:
                      </p>
                      {Array.isArray(intakeFormData?.form_data?.consents?.consentForms) && intakeFormData?.form_data?.consents?.consentForms.map((consent, index) => (
                        <div key={index} className="mt-4">
                          <div className="flex justify-between">
                            <div className="w-[5%]">
                              <div className="step">
                                <span className="text-[20px]">{index + 1}</span>
                              </div>
                            </div>
                            <div className="w-[95%]">
                              <div className="flex">
                                <div className="w-3/4">
                                  <label className="text-[18px] text-gray-500 pb-2">
                                    Name -<em> Required</em>
                                  </label>
                                  <p className="m-0">
                                    <em>
                                      Title or Name of this consent. Ex.
                                      Cancellation Policy
                                    </em>
                                  </p>
                                </div>
                                <div className="w-1/4">
                                  <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300">
                                    <input
                                      className="focus:outline-none w-full"
                                      type="text"
                                      value={consent.name}
                                      onChange={(e) =>{
                                        setChanges(true);
                                        handleConsentChange(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      }
                                    />
                                  </div>
                                  {intakeFormError?.form_data?.consents?.consentForms[index]?.name && <div className="text-red-400 text-sm">{intakeFormError?.form_data?.consents?.consentForms[index]?.name}</div>}
                                </div>
                              </div>
                              <hr />
                              <div className="flex">
                                <div className="w-3/4 text-[18px] text-gray-400">
                                  <label>Text</label>
                                  <p>
                                    <em>The policy the client is agreeing to.</em>
                                  </p>
                                </div>
                                <div className="w-1/4">
                                  <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300 h-full">
                                    <textarea
                                      onChange={(e) =>{
                                        setChanges(true);
                                        handleConsentChange(
                                          index,
                                          "text",
                                          e.target.value
                                        )                                         
                                      }
                                      }
                                      className="w-full focus:outline-none h-full"
                                      rows="3"
                                      value={consent.text}
                                    />
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="flex">
                                <div className="w-3/4">
                                  <label className="text-[18px] text-gray-500 pb-2">
                                    Type -<em> Required</em>
                                  </label>
                                  <p className="m-0">
                                    <em>
                                      The type of acknowledgment the client will make
                                    </em>
                                  </p>
                                </div>
                                <div className="w-1/4">
                                  <Select
                                    inputId="type"
                                    value={consentType.find(option => option.value === consent.type)}
                                    isClearable
                                    onChange={(e) =>{
                                      setChanges(true);
                                      handleConsentChange(
                                        index,
                                        "type",
                                        e?.value
                                      )}
                                    }
                                    options={consentType}
                                    defaultValue={"Automatic"}
                                    required
                                  />
                                  {intakeFormError?.form_data?.consents?.consentForms[index]?.type &&<div className="text-red-400 text-sm">{intakeFormError?.form_data?.consents?.consentForms[index]?.type}</div>}
                                </div>
                              </div>
                              <hr />
                              <div className={`flex ${consent.type === "agree or disagree" || consent.type === "must agree"  ? "" : "hidden"}`}>
                                <div className="w-3/4 text-[18px] text-gray-400">
                                  <label>
                                    Declaration - <em>Required</em>
                                  </label>
                                  <p>
                                    <em>
                                      The text for the checkbox the client is
                                      checking. Ex. I Agree. Or, I am aware of the
                                      cancellation policy.
                                    </em>
                                  </p>
                                </div>
                                <div className="w-1/4 py-1">
                                  <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300 h-full">
                                    <textarea
                                      onChange={(e) =>{
                                        setChanges(true);
                                        handleConsentChange(
                                          index,
                                          "declaration",
                                          e.target.value
                                        )}
                                      }
                                      className="w-full focus:outline-none h-full"
                                      value={consent.declaration}
                                    />
                                  </div>
                                  {intakeFormError?.form_data?.consents?.consentForms[index]?.declaration &&<div className="text-red-400 text-sm ">{intakeFormError?.form_data?.consents?.consentForms[index]?.declaration}</div>}
                                </div>
                              </div>
                              <hr className={`${consent.type === "agree or disagree" || consent.type === "must agree"  ? "" : "hidden"}`}/>
                              <div className={`flex ${consent.type === "agree or disagree" ? "" : "hidden"}`}>
                                <div className="w-3/4 text-[18px] text-gray-400">
                                  <label>
                                    Disagree Option (Leave Blank to require client
                                    to agree)
                                  </label>
                                  <p>
                                    <em>
                                      If you would like to give the option to
                                      disagree with this consent, enter text for
                                      them to choose an opt-out option. Ex. I
                                      Disagree. Or, I am not interested.
                                    </em>
                                  </p>
                                </div>
                                <div className="w-1/4">
                                  <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300 h-full">
                                    <textarea
                                      onChange={(e) =>{
                                        setChanges(true);
                                        handleConsentChange(
                                          index,
                                          "disagreeOption",
                                          e.target.value
                                        )}
                                      }
                                      className="w-full focus:outline-none h-full"
                                      value={consent.disagreeOption}
                                    />
                                  </div>
                                  {intakeFormError?.form_data?.consents?.consentForms[index]?.disagreeOption &&<div className="text-red-400 text-sm">{intakeFormError?.form_data?.consents?.consentForms[index]?.disagreeOption}</div>}
                                </div>
                              </div>
                              <hr className={`${consent.type === "agree or disagree" ? "" : "hidden"}`}/>
                              <div className="flex justify-between">
                                {index >= 0 && (
                                  <div
                                    className="bg-red-500 text-white px-3 h-[35px] flex items-center rounded-md cursor-pointer"
                                    onClick={() =>{setChanges(true); removeConsent(index)}}
                                  >
                                    Remove Consent
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <hr className="mb-0" />
                        </div>
                      ))}
                    </div>
                  
                    <div className="flex justify-between py-1 mr-4">
                    <div className="pl-[73px]">
                      <div
                            className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md flex items-center cursor-pointer"
                            onClick={addConsent}
                          >
                            Add Consent
                          </div>
                    </div>
                      <button type="submit" className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" onClick={() => { if (duplicateId) duplicate_employee_intake_form(); }}>
                      {editedId ? "Update" : "Submit"}
                      </button>
                    </div>
                  </div>
                )}

                {/* {selectedTab === 6 && <div className="h-full">
                  <div className="h-[60px] flex items-center ">
                    <div className="w-full">
                      <h3 className="m-0 text-center">Form Preview</h3>
                    </div>
                  </div>
                  <div className=" h-[calc(100%-60px)] overflow-y-auto w-full flex justify-center  ">
                  <form className="w-[700px]" onSubmit={()=>{alert("form submited sucessfully")}}>
                    <div className=" flex flex-col gap-y-3"  >
                      {profileFields.map((field, index) => (
                        <div key={index} className={` grid grid-cols-[300px,1fr] gap-3 ${field.include_in_intake ? "block" : "hidden"}`}>
                          <div>
                            <label>{field.input_name}</label>
                          </div>
                          <div className="border-[1px] self-start px-2 py-[6px] rounded-sm border-gray-300" >
                            <input className="focus:outline-none w-full" name={field.name} required={field.required} type={field.input_type} />
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-end py-1 ">
                          <button type="submit" className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md">
                            Submit
                          </button>
                      </div>
                    </div>
                    </form>
                  </div>
                </div>} */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewIntakeForm;
