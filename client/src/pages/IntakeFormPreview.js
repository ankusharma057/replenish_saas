import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { createResponseIntakeForm, getIntakeForm, getClientIntakeForm, getClientResponseIntakeForm, getSubmittedResponseIntakeForm } from '../Server';
import { toast } from 'react-toastify';
import ModalWraper from '../components/Modals/ModalWraper';
import SignatureCanvas from 'react-signature-canvas'
import { FaUndo } from "react-icons/fa";
import { DropDown } from '../components/DropDown/DropDown';
import { useAuthContext } from '../context/AuthUserContext';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Select from "react-select";
import { MdSurroundSound } from 'react-icons/md';

// customers
const IntakeFormPreview = () => {
  const { authUserState } = useAuthContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const intake_formId = searchParams.get("intake_form_id");
  const isClientPage = location.pathname.includes("clients") ? true : false
  const isClientFormPreviewPage = location.pathname.includes("submitted-intake-form-preview") ? true : false
  const client_id = searchParams.get("client_id");
  const [intakeFormFields, setIntakeFormFields] = useState()
  const [model, setModel] = useState({show: false, title: ""})
  const [intakeFormData, setIntakeFormData] = useState({
    response_intake_form: {
      intake_form_id: intake_formId,
      client_id: client_id,
      response_form_data: {
        profile_fields: {},
        questionnaires: [],
        consents: {
          signature:{
            sign_type:"draw"
          },
          consentForms: []
        }
      }
    }
  })
  const canvasRefs = useRef([]);
  const typeCanvas = useRef([]);
  const[questionnairesSignature,setQuestionnairesSignature] = useState({})
  const [checkBox,setCheckBox] = useState({}) 
  const [error,setError]=useState(false)

  const [strokeHistory, setStrokeHistory] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [selectOption, setSelectOption] = useState()

  const [text, setText] = useState('');
  const fonts = [
    { label: "text1", class: "pinyon-script-regular" },
    { label: "text2", class: "great-vibes-regular" },
    { label: "text3", class: "herr-von-muellerhoff-regular" },
  ];

  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChangeText = (event) => {
    setText(event.target.value);
  };

  const handleConvertToBase64Image = (selectedOption) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tempElement = document.createElement('div');
    tempElement.className = selectedOption?.class;
    document.body.appendChild(tempElement);
    const style = window.getComputedStyle(tempElement).font;
    document.body.removeChild(tempElement);
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = style;
    ctx.fillText(text, 10, 50);
  
    const base64Image = canvas.toDataURL();    
    setIntakeFormData((prev)=>({...prev,response_intake_form:{...prev.response_intake_form,response_form_data:{...prev.response_intake_form.response_form_data,consents:{
      ...prev.response_intake_form.response_form_data.consents,signature:{...prev.response_intake_form.response_form_data.consents.signature,["sign"]:base64Image}
    }}}}))
  };

  const handleFontChange = (selectedOption) => {
    setSelectOption(selectedOption)
    handleConvertToBase64Image(selectedOption)
  };

  const responseFormData = {...intakeFormData?.response_intake_form?.response_form_data}

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const base64Signature = sigCanvasRef.current?.toDataURL();
      setIntakeFormData((prev)=>({...prev,response_intake_form:{...prev.response_intake_form,response_form_data:{...prev.response_intake_form.response_form_data,consents:{
        ...prev.response_intake_form.response_form_data.consents,signature:{...prev.response_intake_form.response_form_data.consents.signature,["sign"]:base64Signature}
      }}}}))
    }
  };

  const handleChangeType = (value) =>{
    const {id} = value;
    setIntakeFormData((prev)=>({...prev,response_intake_form:{
      ...prev.response_intake_form,response_form_data:{
        ...prev.response_intake_form.response_form_data,consents:{
          ...prev.response_intake_form.response_form_data.consents,signature:{
            ...prev.response_intake_form.response_form_data.consents.signature,["sign_type"]:id}
      }}}}))
  }

  const handleAgreedChange = (checkboxTag, index) =>{
    setIntakeFormData((prev)=>({...prev, response_intake_form:{
      ...prev.response_intake_form,response_form_data:{
        ...prev.response_intake_form.response_form_data,consents:{
          ...prev.response_intake_form.response_form_data.consents, consentForms:{
            ...prev.response_intake_form.response_form_data.consents.consentForms,
              [index]: {
                ...prev.response_intake_form.response_form_data.consents.consentForms[index], agreed: checkboxTag.checked
              }
            }
      }}}}))
  }
  
  const handleInitialChange = (inputBox, index) =>{
    setIntakeFormData((prev)=>({...prev, response_intake_form:{
      ...prev.response_intake_form,response_form_data:{
        ...prev.response_intake_form.response_form_data,consents:{
          ...prev.response_intake_form.response_form_data.consents, consentForms:{
            ...prev.response_intake_form.response_form_data.consents.consentForms,
              [index]: {
                ...prev.response_intake_form.response_form_data.consents.consentForms[index], initialValue: inputBox.value
              }
            }
      }}}}))
  }
  

  const handleAgreeOrDisagreeChange = (radioTag, index) =>{
    setIntakeFormData((prev)=>({...prev, response_intake_form:{
      ...prev.response_intake_form,response_form_data:{
        ...prev.response_intake_form.response_form_data,consents:{
          ...prev.response_intake_form.response_form_data.consents, consentForms:{
            ...prev.response_intake_form.response_form_data.consents.consentForms,
              [index]: {
                ...prev.response_intake_form.response_form_data.consents.consentForms[index], ...{ agreed: radioTag.value === "agreed", disAgreed: radioTag.value !== "agreed" }
              }
            }
      }}}}))
  }

  const handleChange = (formCategory,e, fieldName) => {
    setIntakeFormData((prev) => ({
      ...prev,
      response_intake_form: {
        ...prev.response_intake_form,
        response_form_data: {
          ...prev.response_intake_form.response_form_data,
          [formCategory]: { ...prev.response_intake_form.response_form_data.profile_fields, [fieldName]: e.target.value }
        }
      }
    }))
  }

  const closeCurrentTab = () => {
    setModel({show: false, title: ""});
    window.close();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (error) {
        toast.error("At least choose one Check Box");
      } else {
        const response = await createResponseIntakeForm(intakeFormData);
        if (response.status === 201) {
          toast.success("Form submitted successfully");
          setModel({ show: true, title: "Form submitted successfully. You can close this tab." });
        } else {
          toast.error("Something went wrong");
        }
      }
    } catch (error) {
      toast.error("An error occurred while submitting the form");
    }
  };

  const fetchIntakeForm = async () => {
    try {
      const { data, status } = isClientPage ? await getClientIntakeForm(intake_formId) : await getIntakeForm(intake_formId, true);
      if (status === 200) {
        setIntakeFormFields(data)
        setIntakeFormData((prev)=>({...prev, response_intake_form:{...prev?.response_intake_form, response_form_data:{...prev.response_intake_form.response_form_data, ["questionnaires"]:data?.form_data?.questionnaires}}}))

        if(data?.submitted){
          setModel({show: true, title: "You already submitted this intake form. You can close this tab."})
          // toast.success("Form Already Submitted")
        }
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error);
    }
  };

  const fetchSubmittedIntakeForm = async () => {
    try {
      const { data, status } = isClientPage ? await getClientResponseIntakeForm(intake_formId) : await getSubmittedResponseIntakeForm(intake_formId);
      
      if (status === 200) {
        setIntakeFormData({response_intake_form:data})
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error);
    }
  };
  

  useEffect(() => {
    if(isClientFormPreviewPage){
      fetchSubmittedIntakeForm()
    }
    else{
      fetchIntakeForm();
    }

  }, []);


  const responseConsents = Object.values(intakeFormData?.response_intake_form?.response_form_data?.consents?.consentForms)


    const saveStrokeToHistory = () => {
      const newStroke = sigCanvasRef.current.toDataURL();
      setStrokeHistory(prevHistory => [...prevHistory, newStroke]);
      setCanUndo(true);
    };

    const undoLastStroke = () => {
      if (strokeHistory.length > 0) {
        const updatedHistory = [...strokeHistory];
        updatedHistory.pop(); // Remove the last stroke
        setStrokeHistory(updatedHistory);
        redrawSignature(updatedHistory);
        setCanUndo(updatedHistory.length > 0);
      }
    };

    const redrawSignature = (history) => {
      sigCanvasRef.current?.clear();
      history.forEach(stroke => {
        const img = new Image();
        img.src = stroke;
        img.onload = () => {
          sigCanvasRef.current?.getCanvas().getContext("2d").drawImage(img, 0, 0);
        };
      });
    };

    const handleDrawEnd = () => {
      saveSignature();
      saveStrokeToHistory();
    };

  

    const handleChangeQutionnaries = (index, field, value) => {
      setIntakeFormData(prevState => {
        try {
          // Ensure the questionnaires array is properly initialized
          const currentQuestionnaires = prevState?.response_intake_form?.response_form_data?.questionnaires ?? [];
    
          // Make sure the index is valid
          if (index < 0 || index >= currentQuestionnaires.length) {
            console.error(`Index ${index} is out of bounds.`);
            return prevState; // Return previous state if index is invalid
          }
    
          // Create a copy of the questionnaires array and update the specific item
          const updatedQuestionnaires = [...currentQuestionnaires];
          updatedQuestionnaires[index] = {
            ...updatedQuestionnaires[index],
            [field]: value
          };
    
          // Return the new state object
          return {
            ...prevState,
            response_intake_form: {
              ...prevState.response_intake_form,
              response_form_data: {
                ...prevState.response_intake_form.response_form_data,
                questionnaires: updatedQuestionnaires
              }
            }
          };
        } catch (error) {
          console.error("Error updating questionnaires:", error);
          return prevState; // Return previous state in case of an error
        }
      });
    };
    

    const handleOptionValueChange = (objIndex, index, key, value) => {
      const updatedQuestionnaires = [...intakeFormData?.response_intake_form?.response_form_data?.questionnaires];
      const updatedOptions = [...updatedQuestionnaires[objIndex].value];
      updatedOptions[index] = { ...updatedOptions[index], [key]: value };
      updatedQuestionnaires[objIndex].value = updatedOptions;      
      setIntakeFormData((prev) => ({
          ...prev,
          response_intake_form: {
              ...prev.response_intake_form,
              response_form_data: {
                  ...prev.response_intake_form.response_form_data,
                  questionnaires: updatedQuestionnaires
              }
          }
      }));
  };

  const handleConvertToBase64 = (index) => {
    const canvas = canvasRefs.current[index];
    if (canvas) {
      const base64Signature = canvas.toDataURL();
  
      setQuestionnairesSignature((prevSignatures) => {
        const updatedSignatures = { ...prevSignatures };
        if (!updatedSignatures[`signature${index}`]) {
          updatedSignatures[`signature${index}`] = [];
        }
  
        // Avoid adding the same signature multiple times
        if (!updatedSignatures[`signature${index}`].includes(base64Signature)) {
          updatedSignatures[`signature${index}`].push(base64Signature);
        }
  
        const finalSignature = updatedSignatures[`signature${index}`][updatedSignatures[`signature${index}`].length - 1];
        handleChangeQutionnaries(index, "sign", finalSignature);
  
        return updatedSignatures;
      });
    } else {
      console.error(`Canvas at index ${index} is not available`);
    }
  };
  

  const applyBase64Signature = (index, base64Signature) => {
    const canvas = canvasRefs.current[index];
    if (canvas) {
      // Get original dimensions
      const width = 400; // Original width
      const height = 70; // Original height
  
      // Reset canvas size explicitly
      const canvasElement = canvas.getCanvas();
      canvasElement.width = width;
      canvasElement.height = height;
  
      // Clear the canvas
      canvas.clear();
  
      if (base64Signature) {
        // Apply the base64 data URL after clearing
        setTimeout(() => {
          canvas.fromDataURL(base64Signature);
        }, 0);
      }
    } else {
      console.error(`Canvas at index ${index} is not available`);
    }
  };

  const undoSignature = (index) => {
    setQuestionnairesSignature((prev) => {
      const updatedValue = { ...prev };
      if (updatedValue[`signature${index}`]) {
        updatedValue[`signature${index}`].pop();
        const lastSignature = updatedValue[`signature${index}`].slice(-1)[0] || '';
        applyBase64Signature(index, lastSignature);
      }
      return updatedValue;
    });
  };

  
  const clearSignature = (index) => {
    setQuestionnairesSignature((prev) => {
      const updatedValue = { ...prev };
      if (updatedValue[`signature${index}`]) {
        updatedValue[`signature${index}`] = [];
        applyBase64Signature(index, ''); // Apply empty base64 to clear
      }
      return updatedValue;
    });
  };


  const handleTypeBase64Image = (index) => {
    setIntakeFormData(prevState => {
      try {
        // Ensure the questionnaires array is properly initialized
        const currentQuestionnaires = prevState?.response_intake_form?.response_form_data?.questionnaires ?? [];
  
        // Make sure the index is valid
        if (index < 0 || index >= currentQuestionnaires.length) {
          console.error(`Index ${index} is out of bounds.`);
          return prevState; // Return previous state if index is invalid
        }
        const canvas = typeCanvas?.current[index];
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const selectedOption = prevState?.response_intake_form?.response_form_data?.questionnaires[index]?.class;
          const text = prevState?.response_intake_form?.response_form_data?.questionnaires[index]?.text;
      
          console.log("asdasd",selectedOption);
    
          // Create a temporary element to get the computed style
          const tempElement = document.createElement('div');
          tempElement.className = selectedOption;
          document.body.appendChild(tempElement);
          const style = window.getComputedStyle(tempElement).font;
          document.body.removeChild(tempElement);
      
          // Clear the canvas and draw the text with the computed style
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = style;
          ctx.fillText(text, 10, 50);
      
          // Convert canvas content to base64 image
          const base64Image = canvas.toDataURL();
          const updatedQuestionnaires = [...currentQuestionnaires];
          updatedQuestionnaires[index] = {
            ...updatedQuestionnaires[index],
            ["sign"]: base64Image
          };
    
          // Return the new state object
          return {
            ...prevState,
            response_intake_form: {
              ...prevState.response_intake_form,
              response_form_data: {
                ...prevState.response_intake_form.response_form_data,
                questionnaires: updatedQuestionnaires
              }
            }
          };
        }
      } catch (error) {
        console.error("Error updating questionnaires:", error);
        return prevState; // Return previous state in case of an error
      }
    });
  };
  

  console.log("ss",intakeFormData?.response_intake_form?.response_form_data?.questionnaires[2]?.class);
console.log(intakeFormData);

const handleCombinedInputChange = (e, index) => {
  handleTypeBase64Image(index);
  handleChangeQutionnaries(index, "text", e.target.value);
};

const handleCombinedDropdownChange = async (value, index) =>  {
  setTimeout(async () => {
    handleChangeQutionnaries(index, "class", value.class);  
    }, 1000);
    setTimeout(async () => {
      handleTypeBase64Image(index);
      }, 2000);

};

const checkBoxRequired = (checked, i) => {
  setCheckBox((prev) => {
    const newCheckBoxState = {...prev, [`checkbox${i}`]: checked};
    const ErrorState = Object.values(newCheckBoxState);
    setError(!ErrorState.includes(true));
    return newCheckBoxState;
  });
};


  return (
    <>
    <div className={`bg-gray-100 min-h-screen pb-20`}>
      <div className='w-[75rem] mx-auto h-full'>
        <div className='text-center text-[34px] font-semibold '>{isClientFormPreviewPage? "Client Intake Form Preview" :"ReplenishMD"}</div>
        <div className='flex  justify-end  w-full h-16 items-end'>
          {/* <Link className="no-underline" to={"/intake-forms"}><div className='text-[17px] py-2'>Return to Intake Form </div></Link> */}
          </div>
          <form className="w-full " onSubmit={(e) => { handleSubmit(e) }}>
        <div className='flex flex-col gap-6 font-light'>
          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] py-2 font-medium'>Profile Information - <span className='text-blue-300'>Step 1 of 3</span> </div>
            <div className='flex flex-col items-center text-[14px] gap-1 py-3 text-center'>
              <div>Please take a moment to fill out our online intake form before your visit. All information is kept completely confidential.</div>
            </div>
            {isClientFormPreviewPage ?
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 w-full bg-white p-4 px-4   rounded-lg" >
            {(Object.keys(intakeFormData?.response_intake_form?.response_form_data?.profile_fields)).map((field, index) => (
              <div key={index} className={` flex flex-wrap `}>
                <div>
                  <label>{field} {field?.required && <span className={`text-[13px]`}>(Required)</span>}</label>
                </div>
                <div className="border-[1px] w-full self-start px-2 py-[6px] rounded-md border-gray-300 bg-slate-50" >
                  <input className="focus:outline-none w-full bg-slate-50" name={field[0]} readOnly  type={text} value={intakeFormData?.response_intake_form?.response_form_data?.profile_fields[field]}  />
                </div>
              </div>
            ))}
          </div>
            : 
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 w-full bg-white p-4 px-4   rounded-lg" >
              {Array.isArray(intakeFormFields?.form_data?.profile_fields) && intakeFormFields?.form_data?.profile_fields.map((field, index) => (
                <div key={index} className={` flex flex-wrap   ${field?.include_in_intake ? "block" : "hidden"}`}>
                  <div>
                    <label>{field?.input_name} {field?.required && <span className={`text-[13px]`}>(Required)</span>}</label>
                  </div>
                  <div className="border-[1px] w-full self-start px-2 py-[6px] rounded-md border-gray-300 bg-slate-50" >
                    <input className="focus:outline-none w-full bg-slate-50" name={field?.name} required={field?.required} type={field?.input_type} onChange={(e) => { handleChange("profile_fields",e, field?.name,) }} />
                  </div>
                </div>
              ))}
            </div>}
          </div>

          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] font-medium'>Questionnaires - <span className='text-blue-300'>Step 2 of 3</span> </div>
            <div className=" py-3 px-4 flex flex-col gap-4">
              {isClientFormPreviewPage ? 
              (Array.isArray(intakeFormData?.response_intake_form?.response_form_data?.questionnaires) &&
              intakeFormData?.response_intake_form?.response_form_data?.questionnaires.map((field, index) =>
                    field?.type === "textarea" ? (
                  <>
                    {/* Note */}
                    <div
                      className=" rounded-md  p-[6px] flex flex-col gap-1"
                      >
                      <div className="flex justify-between items-center py-1">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div className="border rounded-md overflow-hidden border-black p-1 bg-white ">
                        <textarea
                          className="w-full focus:outline-none"
                          readOnly={true}
                          required={field?.required}
                          value={field?.value}
                          onChange={(e) => {
                            handleChangeQutionnaries(index,"value",e?.target?.value)
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
                      className=" rounded-md  p-[6px] flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between py-1">
                          {/* <div className="flex gap-3">
                            <div className="flex gap-2">
                              <input
                                type="radio"
                                name="sign"
                                checked={field?.sign_type === "draw"}
                                id="draw"
                                readOnly={true}
                                onChange={(e) => {
                                    handleChangeQutionnaries(index,"sign_type","draw")
                                }}
                              />
                              <label htmlFor="draw" className="flex items-center">
                                Draw
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <input
                              className={`${selectOption?.class}`}
                                type="radio"
                                name="sign"
                                checked={field?.sign_type === "type"}
                                readOnly={true}
                                id="type"
                                onChange={(e) => {
                                  handleChangeQutionnaries(index,"sign_type","type")
                                }}
                              />
                              <label htmlFor="type" className="flex items-center">
                                Type
                              </label>
                            </div>
                          </div> */}
                          {/* {field?.sign_type === "type" && (
                            <div className="w-[300px]">
                              <DropDown
                                placeholder={"Select Font Style"}
                                options={fonts}
                                readonly={true}
                                onChange={(value)=>{handleTypeFontChange(value,index);}}
                              />
                            </div>
                          )} */}
                        </div>
                        <div className="">
                          <div className="flex gap-3 ">
                              <div className="border-b-[2px]">
                              <img className='h-[80px]' src={field?.sign} alt="" />
                                {/* <SignatureCanvas
                                  penColor="black"
                                  throttle={10}
                                  readOnly={}
                                  maxWidth={2.2}
                                  onEnd={() => {
                                    saveQutionnariesSignature(index)
                                    handleQutionnariesDrawEnd()
                                  
                                    
                                  }}
                                  ref={sigCanvasRef}
                                  canvasProps={{
                                    width: 400,
                                    height: 70,
                                    className: "sigCanvas",
                                  }}
                                /> */}
                              </div>
                              {/* <div className="flex items-end">
                                <div className="flex gap-2 items-center text-[14px] text-[#0dcaf0]">
                                  <div
                                    className="cursor-pointer"
                                    onClick={()=>{undoLastStroke(); saveSignature();}}
                                    disabled={false}
                                  >
                                    <FaUndo />
                                  </div>
                                  <div className="text-gray-400">|</div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={()=>{sigCanvasRef.current?.clear(); saveSignature();}}
                                  >
                                    Clear
                                  </div>
                                </div>
                              </div> */}
                            </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : field?.type === "heading" ? (
                  <>
                    {/* Heading */}
                    <div
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center ">
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
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                    >
                      <div className="flex flex-col ">
                        <div className="flex justify-between items-center py-1">
                          <div className="font-semibold text-[17px]">
                            {field?.label}
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
                              <div key={i} className="flex gap-2 items-center">
                                <input
                                  id={checkbox?.label}
                                  readOnly={true}
                                  // required={i === 0 && field?.required ? true : false}
                                  checked={checkbox?.value}
                                  onChange={(e) => {
                                    handleOptionValueChange(index, i, "value", e.target.checked);
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
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center ">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div className="py-3">
                        <div className="w-[300px]">
                        <Select
                          inputId="availableEmployee"
                          isClearable
                          options={field?.value } // Ensure options is always an array
                          isDisabled={false} // Use isDisabled for read-only behavior
                          value={field?.value?.find(option => option?.label === field?.values?.value)}
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
                      className=" rounded-md p-[6px] pb-6 flex flex-col gap-1 "
                    >
                      <div className="flex justify-between items-center ">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={0}
                          max={field.value.length}
                          value={field?.values?.index}
                          className="w-full"
                          readOnly={true}
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
                      className="   rounded-md p-[6px] flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center  py-1">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div className="text-[18px] bg-white  rounded-lg pl-3 font-medium py-3">
                        <em>{field?.value}</em>
                      </div>
                    </div>
                  </>
                ) : null
              ))
              :
              (Array.isArray(intakeFormData?.response_intake_form?.response_form_data?.questionnaires) &&
              intakeFormData?.response_intake_form?.response_form_data?.questionnaires.map((field, index) =>
                    field?.type === "textarea" ? (
                  <>
                    {/* Note */}
                    <div
                      className=" rounded-md  p-[6px] flex flex-col gap-1"
                      onClick={() => {
                        // setEditModel({ name: "initialNote", index: index });
                        // openModalFromParent();
                        // handleItemClick('initialNote', index)
                      }}>
                      <div className="flex justify-between items-center py-1">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                        {/* <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div> */}
                      </div>
                      <div className="border rounded-md overflow-hidden border-black p-1 bg-white ">
                        <textarea
                          className="w-full focus:outline-none"
                          readOnly={field?.read_only}
                          required={field?.required}
                          value={field?.drop_down_value}
                          onChange={(e) => {
                            // handleChange("value", e?.target?.value, index);
                            handleChangeQutionnaries(index,"value",e?.target?.value)
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
                      className=" rounded-md  p-[6px] flex flex-col gap-1"
                      onClick={() => {
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between py-1">
                          <div className="flex gap-3">
                            <div className="flex gap-2">
                            <input
                              type="radio"
                              name={`sign_${index}`}
                              checked={intakeFormData?.response_intake_form?.response_form_data?.questionnaires[index]?.sign_type === "draw" ? true : false}
                              id="draw"
                              onChange={(e) => {
                                handleChangeQutionnaries(index, "sign_type", "draw");
                              }}
                            />
                              <label htmlFor="draw" className="flex items-center">
                                Draw
                              </label>
                            </div>
                            <div className="flex gap-2">
                            <input
                              className={selectOption?.class || ""}
                              type="radio"
                              name={`sign_${index}`}
                              checked={intakeFormData?.response_intake_form?.response_form_data?.questionnaires[index]?.sign_type === "type"? true : false}
                              id="type"
                              onChange={(e) => {
                                handleChangeQutionnaries(index, "sign_type", "type");
                              }}
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
                                onChange={(value) => {
                                  handleCombinedDropdownChange(value, index);
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="">
                          {field?.sign_type === "draw" ? (
                            <div className="flex gap-3 ">
                              <div className="border-b-[2px]">
                              <SignatureCanvas
                                ref={(ref) => (canvasRefs.current[index] = ref)}
                                penColor="black"
                                throttle={10}
                                maxWidth={2.2}
                                onEnd={() => handleConvertToBase64(index)}
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
                                    onClick={() => undoSignature(index)}
                                    disabled={false}
                                  >
                                    <FaUndo />
                                  </div>
                                  <div className="text-gray-400">|</div>
                                  <div
                                    className="cursor-pointer"
                                    onClick={() => clearSignature(index)}
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
                                      ref={typeCanvas[index]}
                                      placeholder="Enter your Signature"
                                      className={`${field?.class} p-2 focus:outline-none w-full  px-2 h-[50px]`}
                                      onChange={(e) => {
                                        handleCombinedInputChange(e, index);
                                      }}
                                    />
                                  </div>
                                </div>
                                <canvas
                                  key={index}
                                  ref={(el) => (typeCanvas.current[index] = el)}
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
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                      onClick={() => {
                        // setEditModel({ name: "initialHeading", index: index });
                        // openModalFromParent();
                        // handleItemClick('initialHeading', index)
                      }}
                    >
                      <div className="flex justify-between items-center ">
                        {/* <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div> */}
                        {/* <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div> */}
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
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                      onClick={() => {
                        // setEditModel({ name: "initialCheckBox", index: index });
                        // openModalFromParent();
                        // handleItemClick('initialCheckBox', index)
                      }}
                    >
                      <div className="flex flex-col ">
                        <div className="flex justify-between items-center py-1">
                          <div className="font-semibold text-[17px]">
                            {field?.label}
                          </div>
                          {/* <div className="text-[20px] cursor-pointer">
                            <BsThreeDotsVertical />
                          </div> */}
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
                                  // required={i === 0 && field?.required ? true : false}
                                  checked={checkbox?.value}
                                  onChange={(e) => {
                                    checkBoxRequired(e.target.checked, index);
                                    handleOptionValueChange(index, i, "value", e.target.checked);
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
                      className=" rounded-md p-[6px] flex flex-col gap-1"
                      onClick={() => {
                        // setEditModel({ name: "initialDropdown", index: index });
                        // openModalFromParent();
                        // handleItemClick('initialDropdown', index)
                      }}
                    >
                      <div className="flex justify-between items-center ">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                        {/* <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div> */}
                      </div>
                      <div className="py-3">
                        <div className="w-[300px]">
                          <Select
                            inputId="availableEmployee"
                            isClearable
                            options={fonts}
                            onChange={(e) => {
                              handleChangeQutionnaries(index,"values",{value:e?.value})
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
                      className=" rounded-md p-[6px] pb-6 flex flex-col gap-1 "
                      onClick={() => {
                        // setEditModel({ name: "initialRange", index: index });
                        // openModalFromParent();
                        // handleItemClick('initialRange', index)
                      }}
                    >
                      <div className="flex justify-between items-center ">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                        {/* <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div> */}
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min={0}
                          max={field?.value?.length}
                          value={field?.values?.value}
                          className="w-full"
                          onChange={(e) => {
                            const newValueIndex = Number(e.target.value);
                            const selectedLabel = field?.value[(Number(e.target.value))-1]?.label;
                            handleChangeQutionnaries(index, "values", {value:selectedLabel,index:newValueIndex});
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
                      className="   rounded-md p-[6px] flex flex-col gap-1"
                      onClick={() => {
                        // setEditModel({
                        //   name: "initialInstruction",
                        //   index: index,
                        // });
                        // openModalFromParent();
                      }}
                    >
                      <div className="flex justify-between items-center  py-1">
                        <div className="font-semibold text-[17px]">
                          {field?.label}
                        </div>
                        {/* <div className="text-[20px] cursor-pointer">
                          <BsThreeDotsVertical />
                        </div> */}
                      </div>
                      <div className="text-[18px] bg-white  rounded-lg pl-3 font-medium py-3">
                        <em>{field?.value}</em>
                      </div>
                    </div>
                  </>
                ) : null
              ))}
          </div>
          </div>
          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] font-medium'>Consents - <span className='text-blue-300'>Step 3 of 3</span> </div>
            <div className='p-4 pt-0'>
              <div className='text-[25px] font-normal py-2'><span >{intakeFormFields?.name}</span> - Consents </div>
              <div className='flex flex-col gap-3'>
              {isClientFormPreviewPage ? (
                (Array.isArray(intakeFormData?.response_intake_form?.intake_form?.form_data?.consents?.consentForms) && intakeFormData?.response_intake_form?.intake_form?.form_data?.consents?.consentForms.map((consent,index)=>(
                  <div className={`${intakeFormFields?.form_data?.consents?.consentForms.length === index+1 && !intakeFormFields?.form_data?.consents?.signature ? "border-none" : "border-b"} p-2`} key={index}>
                  <div className='text-[20px] font-normal'>{consent?.name}</div>
                  <div className='py-3'>{consent?.text}</div>
                  <div className='flex flex-col gap-1'>
                  {(consent?.type === "must agree")   && <div className='flex items-center gap-2'>
                      <input type="checkbox" name="agreed" checked={responseConsents[index]["agreed"]} required readOnly={true} />
                      <div className='flex gap-2'><span> {consent?.declaration}</span><span><em> Require</em></span></div>
                    </div>}
                    { consent?.type === "agree or disagree"  && <div className='flex items-center gap-2'>
                      <input type="radio" readOnly={true} required  checked={responseConsents[index]["agreed"]} />
                      <div className='flex gap-2'><span> {consent?.declaration}</span><span><em> Require</em></span></div>
                      <input type="radio" readOnly={true} required  checked={responseConsents[index]["disAgreed"]} />
                      <div className='flex gap-2'><span> {consent?.disagreeOption}</span><span><em> Require</em></span></div>
                    </div>}
                    {(consent?.type === "acnowledge with initials")   && <div className='flex items-center gap-2'>
                      <input type="input" readOnly={true} value={responseConsents[index]?.initialValue} required name="initial" className='border-b'  />
                    </div>}
                  </div>
                </div>
              )))
              ) 
              :
            (Array.isArray(intakeFormFields?.form_data?.consents?.consentForms) && intakeFormFields?.form_data?.consents?.consentForms.map((consent,index)=>(
                <div className={`${intakeFormFields?.form_data?.consents?.consentForms.length === index+1 && !intakeFormFields?.form_data?.consents?.signature ? "border-none" : "border-b"} p-2`} key={index}>
                <div className='text-[20px] font-normal'>{consent?.name}</div>
                <div className='py-3'>{consent?.text}</div>
                <div className='flex flex-col gap-1'>
                {(consent?.type === "must agree")   && <div className='flex items-center gap-2'>
                    <input type="checkbox" name="agreed" required onChange={(e)=>{handleAgreedChange(e.target, index)}} />
                    <div className='flex gap-2'><span> {consent?.declaration}</span><span><em> Require</em></span></div>
                  </div>}
                  { consent?.type === "agree or disagree"  && <div className='flex items-center gap-2'>
                    <input type="radio" required name={`isAgreed${index}`} value="agreed" onChange={(e)=>{handleAgreeOrDisagreeChange(e.target, index)}}/>
                    <div className='flex gap-2'><span> {consent?.declaration}</span><span><em> Require</em></span></div>
                    <input type="radio" required name={`isAgreed${index}`} value="disAgreed" onChange={(e)=>{handleAgreeOrDisagreeChange(e.target, index)}}/>
                    <div className='flex gap-2'><span> {consent?.disagreeOption}</span><span><em> Require</em></span></div>
                  </div>}
                  {(consent?.type === "acnowledge with initials")   && <div className='flex items-center gap-2'>
                    <input type="input" required name="initial" className='border-b' onChange={(e)=>{handleInitialChange(e.target, index)}} />
                  </div>}
                </div>
              </div>
            )))}
            {isClientFormPreviewPage && responseFormData?.consents?.signature?.sign ? <div>
              <div className='text-[20px] font-normal'>Sign</div>
              <img className='h-[80px]' src={intakeFormData?.response_intake_form?.response_form_data?.consents?.signature?.sign} alt="" />
            </div>
            :
            intakeFormFields?.form_data?.consents?.signature &&<>
            <div className='text-[20px] font-normal'>Sign</div>
            <div className='flex justify-between'>
              <div className='flex gap-3'>
              <div className='flex gap-2'>
                <input type="radio" name='sign' checked={responseFormData?.consents?.signature?.sign_type === "draw" } id='draw' onChange={(e)=>{handleChangeType(e.target)}}/>
                <label htmlFor="draw" className='flex items-center'>Draw</label>
              </div>
              <div className='flex gap-2'>
                <input type="radio" name='sign' checked={responseFormData?.consents?.signature?.sign_type === "type"} id='type' onChange={(e)=>{handleChangeType(e.target)}}/>
                <label htmlFor="type" className='flex items-center'>Type</label>
              </div>
              </div>
              {responseFormData?.consents?.signature?.sign_type === "type" &&
                  <div className='w-[300px]'>
                    <DropDown placeholder={"Select Font Style"} options={fonts} onChange={value =>handleFontChange(value) } />
                  </div>
                  }
            </div>
            {responseFormData?.consents?.signature?.sign_type === "draw" &&
              <div className='flex gap-3'>
              <div className='border-b-[2px]'>
                <SignatureCanvas penColor='black' throttle={10} maxWidth={2.2} onEnd={()=>{saveSignature(); handleDrawEnd();}} ref={sigCanvasRef} canvasProps={{width: 400, height: 100, className: 'sigCanvas' }} />
              </div>
              <div className='flex items-end'>
                <div className='flex gap-2 items-center text-[14px] text-[#0dcaf0]'>
                <div className='cursor-pointer' onClick={()=>{undoLastStroke(); saveSignature();}} disabled={!canUndo}><FaUndo /></div>
                  <div className='text-gray-400'>|</div>
                  <div className='cursor-pointer' onClick={()=>{sigCanvasRef.current?.clear(); saveSignature();}}>Clear</div>
                </div>
              </div>
            </div>}
            
            {responseFormData?.consents?.signature?.sign_type === "type" &&
            <>
              <div className='flex  gap-4'>
                  <div className=' h-[100px]'>
                    <div className="border-b-[2px] w-[300px]">
                      <input type="text" placeholder='Enter your Signature' className={` ${selectOption?.class} p-2 focus:outline-none w-full  px-2 h-[50px]`} onChange={(e)=>{handleChangeText(e);}} />
                    </div>
                  </div>
                  <div className='w-[300px]'>
                    {/* <Select
                      inputId="availableEmployee"
                      isClearable
                      options={fonts}
                      value={fonts.find(option => option.value === fontStyle)}
                      onChange={(e)=>{handleFontChange(e?.value);}}
                      required
                    /> */}
                  </div>
                
                    <canvas ref={canvasRef} width="500" height="100" style={{ display: 'none' }}></canvas>
            </div>
            </>
            }

            </>}
              </div>
              {!isClientFormPreviewPage ? 
                isClientPage ? <div className="flex items-center justify-end py-3 ">
                <button type="submit" className="bg-[#22d3ee] text-white px-5 h-[35px] rounded-md">
                  Submit
                </button>
                </div>
                :
                null
              :null}
            </div>
          </div>
        </div>
        </form>
      </div>
    </div>

    <ModalWraper
        show={model.show}
        onHide={() => closeCurrentTab()}
        customClose={false}
        title={""}
      >
        {model.title}
      </ModalWraper>
  </>
  )
}

export default IntakeFormPreview;
