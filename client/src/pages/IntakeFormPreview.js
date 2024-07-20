import React, { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { createResponseIntakeForm, getIntakeForm, getResponseIntakeForm } from '../Server';
import { useAuthContext } from '../context/AuthUserContext';
import { toast } from 'react-toastify';
import { act } from 'react';
import ModalWraper from '../components/Modals/ModalWraper';
import Loadingbutton from '../components/Buttons/Loadingbutton';

const IntakeFormPreview = () => {
  const { authUserState } = useAuthContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const intake_formId = searchParams.get("intake_form_id");
  console.log(intake_formId);
  const client_id = searchParams.get("client_id");
  const [intakeFormFields, setIntakeFormFields] = useState()
  const [model, setModel] = useState(true)
  const [intakeFormData, setIntakeFormData] = useState({
    response_intake_form: {
      intake_form_id: intake_formId,
      client_id: client_id,
      response_form_data: {
        step1: {},
        step2: {},
        step3: {}
      }
    }
  })

  const handleChange = (e, fieldName) => {
    setIntakeFormData((prev) => ({
      ...prev,
      response_intake_form: {
        ...prev.response_intake_form,
        response_form_data: {
          ...prev.response_intake_form.response_form_data,
          step1: { ...prev.response_intake_form.response_form_data.step1, [fieldName]: e.target.value }
        }
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await createResponseIntakeForm(intakeFormData)
      if (response.status === 201) {
        toast.success("form submited sucessfully")
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
      const { data, status } = await getIntakeForm(intake_formId);
      if (status === 200) {
        setIntakeFormFields(data)
        if(data?.submitted){
          // toast.success("Form Already Submitted")
          // setTimeout(() => { window.location.replace("/clients") }, 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching intake forms:', error);
    }
  };

  useEffect(() => {
    fetchIntakeForm();
    // if(intakeFormFields?.submitted){
    //   toast.success("Form Already Submitted")
    //   setTimeout(() => { window.location.replace("/clients") }, 1000);
    // }
  }, [intake_formId]);

  return (
    <>
    <div className={`bg-gray-100 min-h-screen`}>
      <div className='w-[75rem] mx-auto h-full'>
        <div className='text-center text-[34px] font-semibold '>ReplenishMD</div>
        <div className='flex  justify-end  w-full h-16 items-end'><Link className="no-underline" to={"/intake-forms"}><div className='text-[17px] py-2'>Return to Intake Form </div></Link></div>
        <div className='flex flex-col gap-6 font-light'>
          <div className='w-[50rem] p-3 mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] py-2'>Profile Information - <span className='text-blue-300'>Step 1 of 3</span> </div>
            <div className='flex flex-col items-center text-[14px] gap-1 py-3'>
              <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has </div>
              <div>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
            </div>
            <form className="w-full " onSubmit={(e) => { handleSubmit(e) }}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 w-full bg-white p-4 px-4   rounded-lg" >
                {Array.isArray(intakeFormFields?.form_data?.step1) && intakeFormFields?.form_data?.step1.map((field, index) => (
                  <div key={index} className={` flex flex-wrap   ${field?.include_in_intake ? "block" : "hidden"}`}>
                    <div>
                      <label>{field?.input_name} {field?.required && <span className={`text-[13px]`}>(Required)</span>}</label>
                      {/* <div dangerouslySetInnerHTML={{__html: field?.discription}}></div> */}
                    </div>
                    <div className="border-[1px] w-full self-start px-2 py-[6px] rounded-md border-gray-300 bg-slate-50" >
                      <input className="focus:outline-none w-full bg-slate-50" name={field?.name} required={field?.required} type={field?.input_type} onChange={(e) => { handleChange(e, field?.name) }} />
                    </div>
                  </div>
                ))}
              </div>
              {location.pathname.includes("clients") && <div className="flex items-center justify-center py-3 ">
                <button type="submit" className="bg-[#22d3ee] text-white px-5 h-[35px] rounded-md">
                  Submit
                </button>
              </div>}
            </form>
          </div>
          <div className='w-[50rem] mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px] py-2'>Profile Information - <span className='text-blue-300'>Step 2 of 3</span> </div>
          </div>
          <div className='w-[50rem] mx-auto bg-white gap-2 rounded-xl'>
            <div className='text-center text-[28px]'>Profile Information - <span className='text-blue-300'>Step 3 of 3</span> </div>
          </div>
        </div>
      </div>
    </div>

    <ModalWraper
        show={model}
        // onHide={() => setAddLocationModal(initialAddLocationModal)}
        customClose={false}
        title={"You Already Submit This Form"}
        footer={
          <Loadingbutton
            type="submit"
            title="redirect"
            isLoading={true}
            loadingText="redirecting..."
            form="addLocation"
          />
        }
      >
        <form
          id="addLocation"
          // onSubmit={addLocation}
          className="text-lg flex flex-col gap-y-2"
        >

        </form>
      </ModalWraper>
  </>
  )
}

export default IntakeFormPreview;