import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../context/AuthUserContext";
import { FaBook, FaUndo } from "react-icons/fa";
import { PiGridNineLight } from "react-icons/pi";
import { useLocation } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import SignatureCanvas from "react-signature-canvas";
import Select from "react-select";
import { DropDown } from "../components/DropDown/DropDown";
import { Range } from "react-range";
import { TopModel } from "../components/TopModel";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { PiColumnsFill } from "react-icons/pi";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { TbSignature } from "react-icons/tb";
import { FaHeading } from "react-icons/fa6";
import { TbCheckbox } from "react-icons/tb";
import { RxDropdownMenu } from "react-icons/rx";
import { BsSliders2 } from "react-icons/bs";
import { PiWarningCircleBold } from "react-icons/pi";
import Switch from "@mui/material/Switch";
import { confirmAlert } from "react-confirm-alert";
import { drop, template } from "lodash";
import { toast } from "react-toastify";
import {
  createQuestionnaire,
  getQuestionnaire,
  updateQuestionnaire,
  getQuestionnaires,
} from "../Server";
import { IoDocumentText } from "react-icons/io5";

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
    range_value: 5,
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

const Questionnaires = ({
  selectedEmployee,
  questionnaireId,
  duplicateQuestionnaireId,
  setTemplateTabs,
  title,
  FormChanges,
  setQuestionnaireWithIntake
}) => {
  const { authUserState } = useAuthContext();
  const [templateTabsPopup, setTemplateTabsPopup] = useState(0);
  const [questionnaireForms, setQuestionnaireForms] = useState();
  const location = useLocation();
  const topModelRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [inputHover, setInputHover] = useState(null);
  const [changes, setChanges] = useState(false);
  const [optionModel, setOptionModel] = useState(false);
  const [qutionaryFields, setQutionaryFields] = useState([]);
  const [drawSignarure, setDrawSignarure] = useState();
  const [values, setValues] = useState(
    qutionaryInputs?.initialRange?.value.map((v) => v.value)
  );
  const [editModel, setEditModel] = useState({ name: "", index: "" });
  const [selectedvalue, setSelectedvalue] = useState(null);

  const [editedId, setEditedId] = useState();
  const [duplicateId, setDuplicateId] = useState();
  const [page,setPage] = useState()

  useEffect(()=>{
    const path = location.pathname 
    if(path === "/new-intake-forms"){
      setPage("Intake Form Page")
    }
    else{
      setPage("Employee Page")
    }
  },[])

  const createQutionaryFields = (intialFieldName) => {
    setQutionaryFields((prev) => [
      ...prev,
      { ...qutionaryInputs[intialFieldName], id: qutionaryFields.length + 1 },
    ]);
    handleChange(null, null, qutionaryFields.length);
  };

  console.log("qutionaryFields", qutionaryFields);
  useEffect(()=>{
    if(page === "Intake Form Page"){
      setQuestionnaireWithIntake(qutionaryFields)
    }
    
  },[qutionaryFields])
  
  // useEffect(()=>{
  //   setQutionaryFields([])

  // },[formChanged])



  const [questionnaireFormData, setQuestionnaireFormData] = useState({
    template: {
      qutionaryFields: [...qutionaryFields],
    },
    employee_id: selectedEmployee?.id,
    name: "",
  });

  useEffect(() => {
    setQuestionnaireFormData((prev) => ({ ...prev, ["name"]: title }));
  }, [title]);

  useEffect(() => {
    setQuestionnaireFormData((prev) => ({
      ...prev,
      template: { ...prev.template, ["qutionaryFields"]: qutionaryFields },
    }));
  }, [qutionaryFields]);

  const duplicate_employee_questionaires = () => {
    setQuestionnaireFormData((prev) => {
      const { employee_id, ...rest } = prev;
      return {
        ...rest,
        employee_id: authUserState?.user?.id,
      };
    });
  };

  // ----------------------------------------------------
  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const base64Signature = sigCanvasRef.current.toDataURL();
      setDrawSignarure(base64Signature);
    }
  };

  const handleSave = () => {
    console.log("Save button clicked");
  };
  // ---------------------------------------------------
  // qutionaryFields onchange

  const openModalFromParent = () => {
    if (topModelRef.current && typeof topModelRef.current.openModal === 'function') {
      topModelRef.current.openModal();
    } else {
      console.error('openModal is not a function or topModelRef.current is not set');
    }
    setChanges(false);
  };
  
  const closeModel = () => {
    if (topModelRef.current && typeof topModelRef.current.closeModal === 'function') {
      topModelRef.current.closeModal();
    } else {
      console.error('closeModal is not a function or topModelRef.current is not set');
    }
  };
  
  // const handleChange = (key, value, index) => {
  //   setQutionaryFields((prev) => [
  //     ...prev,
  //     prev[index],
  //     { ...prev[index], [key]: value },
  //   ]);
  // };

  const submitData = async (e) => {
    e.preventDefault();
    try {
      const response = await createQuestionnaire(questionnaireFormData);
      if (response.status === 201) {
        toast.success("Questionnaire Template successfully created");
        setTimeout(() => {
          setTemplateTabs();
        }, 1500);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.log("err", error?.response?.data?.error);
      // setIntakeFormError((prev)=>({...prev,...error?.response?.data?.error}))
    }
  };

  const upadteData = async (e) => {
    e.preventDefault();
    // if(formValidation()){
    try {
      const response = await updateQuestionnaire(
        questionnaireId,
        questionnaireFormData
      );
      if (response?.status === 200) {
        setQutionaryFields(response?.data?.template?.qutionaryFields);
        toast.success("Intake form successfully updated");
        setTimeout(() => {
          setTemplateTabs();
        }, 1500);
      }
    } catch (error) {
      toast.error("Something Went Wrong ");
      console.log("err", error?.response?.data?.error);
      // setIntakeFormError((prev)=>({...prev,...error?.response?.data?.error}))
    }
    // }
  };


  useEffect(() => {
    // const urlParams = new URLSearchParams(window?.location?.search);
    // setEditedId(urlParams.get('intake-form-id'))
    setEditedId(questionnaireId);
  }, []);

  useEffect(() => {
    // const urlParams = new URLSearchParams(window?.location?.search);
    // setDuplicateId(urlParams.get('duplicate-intake-form-id'))
    setDuplicateId(duplicateQuestionnaireId);
  }, []);

  const editData = async (templateId) => {
    try {
      const response = await getQuestionnaire(editedId || templateId, true);    
      // if (authUserState?.user?.is_admin ||(authUserState?.user?.id === response?.data?.employee?.id)) {
      if (response.status === 200) {
        // setQutionaryFields(response?.data?.template?.qutionaryFields);
        setQutionaryFields((prev) => {
          const updatedData = [
            ...prev,
            ...response?.data?.template?.qutionaryFields,
          ];
          return updatedData;
        });
        // setEditedId(null);
      } else {
      }
      // }else{
      //   navigate('/intake-forms')
      //   toast.error("You don't have permission to edit this intake form");
      // }
    } catch (err) {}
  };

  const duplicateIntakeForm = async () => {
    try {
      const response = await getQuestionnaire(duplicateId, true);
      if (response.status === 200) {
        setQutionaryFields(response?.data?.template?.qutionaryFields);
      } else {
      }
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
  const handleChange = (key, value, index, isEditMode = false) => {
    setQutionaryFields((prev) => {
      const updatedFields = [...prev];
      updatedFields[index] = { ...updatedFields[index], [key]: value };
      return updatedFields;
    });
    setChanges(true);
    if (!isEditMode) {
      FormChanges();
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
    FormChanges();
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
        { page === "Intake Form Page" && (
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
        )}
        { page === "Employee Page" &&(
        <div className="flex">
          <form
            onSubmit={(e) => {
              editedId ? upadteData(e) : submitData(e);
            }}
            className=" py-2 m-0 w-full"
          >
            <div className="relative w-full">
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
                <div className="flex  w-[135px] bg-[#0dcaf0] text-white rounded-md">
                  <button
                    type="button"
                    className="flex gap-2 justify-end pr-1 items-center py-[6px] w-[26%]"
                    onClick={() => {
                      // openModalFromParent();
                      // setEditModel({ name: "gridModel", index: null });
                      handleItemClick('gridModel', null)
                    }}
                  >
                    <PiGridNineLight />
                  </button>
                  <button
                    type="button"
                    className="whitespace-nowrap flex gap-2 justify-center items-center py-[6px] w-[74%]"
                    onClick={() => {
                      setOptionModel(!optionModel);
                    }}
                  >
                    Add Item
                  </button>
                </div>
                <div className="bg-[#0dcaf0] text-white px-6 py-2 rounded-md">
                  <button
                    type="submit"
                    className="whitespace-nowrap flex justify-center items-center rounded-md"
                    onClick={() => {
                      if (duplicateId) duplicate_employee_questionaires();
                    }}
                  >
                    {editedId ? "Update" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        )}
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
                            editData(template?.id);
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
  );
};

export default Questionnaires;
