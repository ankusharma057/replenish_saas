import React, { useEffect, useState, useRef } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { createResponseIntakeForm, getIntakeForm, getClientIntakeForm, getClientResponseIntakeForm, getSubmittedResponseIntakeForm } from '../Server';
import { toast } from 'react-toastify';
import ModalWraper from '../components/Modals/ModalWraper';
import SignatureCanvas from 'react-signature-canvas'
import { FaUndo } from "react-icons/fa";
import { DropDown } from '../components/DropDown/DropDown';
import { useAuthContext } from '../context/AuthUserContext';
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
        step2: {},
        consents: {
          signature:{
            sign_type:"draw"
          },
          consentForms: []
        }
      }
    }
  })
  

  const [strokeHistory, setStrokeHistory] = useState([]);
  const [canUndo, setCanUndo] = useState(false);
  const [selectOption, setSelectOption] = useState()

  const [text, setText] = useState('');
  const fonts = [
    { label: text, class: "pinyon-script-regular" },
    { label: text, class: "great-vibes-regular" },
    { label: text, class: "herr-von-muellerhoff-regular" },
  ];

  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);

  console.log("ssss",intakeFormData );

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
      const base64Signature = sigCanvasRef.current.toDataURL();
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
    e.preventDefault()
    try {
      const response = await createResponseIntakeForm(intakeFormData)
      if (response.status === 201) {
        toast.success("Form submitted successfully")
        setModel({show: true, title: "Form submitted successfully. You can close this tab."})
      }
      else {
        toast.error("Something went wrong")
      }
    }
    catch {
    }
  }

  const fetchIntakeForm = async () => {
    try {
      const { data, status } = isClientPage ? await getClientIntakeForm(intake_formId) : await getIntakeForm(intake_formId);
      if (status === 200) {
        setIntakeFormFields(data)

        if(data?.submitted){
          setModel({show: true, title: "You already submitted this intake form. You can close this tab."})
          // toast.success("Form Already Submitted")
        }
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error);
    }
  };

  console.log("ddddd",intakeFormFields);


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

  console.log("dd",intakeFormFields?.form_data?.profile_fields );

     const responseConsents = Object.values(intakeFormData?.response_intake_form?.response_form_data?.consents?.consentForms)

  console.log("sdskkk",intakeFormData?.response_intake_form?.intake_form?.name);
  console.log("xxx",isClientFormPreviewPage)

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
      sigCanvasRef.current.clear();
      history.forEach(stroke => {
        const img = new Image();
        img.src = stroke;
        img.onload = () => {
          sigCanvasRef.current.getCanvas().getContext("2d").drawImage(img, 0, 0);
        };
      });
    };
   
    const handleDrawEnd = () => {
      saveSignature();
      saveStrokeToHistory();
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
            <div className='text-center text-[28px] py-2 font-medium'>Profile Information - <span className='text-blue-300'>Step 1 of 4</span> </div>
            <div className='flex flex-col items-center text-[14px] gap-1 py-3 text-center'>
              <div>Online intake forms allow you to collect contact information, family and medical history, and consent from your client. The client response will become part of their profile and chart.</div>
              <div>{intakeFormFields?.employee?.name} will automatically prompt clients to fill out an intake form in any email sent prior to their first visit. After their first visit, you can send them a link to fill out the intake form from their client profile.</div>
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
            <div className='text-center text-[28px] py-2 font-medium'>Profile Information - <span className='text-blue-300'>Step 2 of 4</span> </div>
          </div>
          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] font-medium'>Profile Information - <span className='text-blue-300'>Step 3 of 4</span> </div>
          </div>
          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] font-medium'>Consents - <span className='text-blue-300'>Step 4 of 4</span> </div>
            <div className='p-4 pt-0'>
              <div className='text-[25px] font-normal py-2'><span >{intakeFormData?.response_intake_form?.intake_form?.name}</span> - Consents </div>
              
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
                    <input type="radio" required name="isAgreed" value="agreed" onChange={(e)=>{handleAgreeOrDisagreeChange(e.target, index)}}/>
                    <div className='flex gap-2'><span> {consent?.declaration}</span><span><em> Require</em></span></div>
                    <input type="radio" required name="isAgreed" value="disAgreed" onChange={(e)=>{handleAgreeOrDisagreeChange(e.target, index)}}/>
                    <div className='flex gap-2'><span> {consent?.disagreeOption}</span><span><em> Require</em></span></div>
                  </div>}

                  {(consent?.type === "acnowledge with initials")   && <div className='flex items-center gap-2'>
                    <input type="input" required name="initial" className='border-b' onChange={(e)=>{handleInitialChange(e.target, index)}} />
                  </div>}

                </div>
              </div>
            )))}

            {isClientFormPreviewPage ? <div>
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
                  <div className='cursor-pointer' onClick={()=>{sigCanvasRef.current.clear(); saveSignature();}}>Clear</div>
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
