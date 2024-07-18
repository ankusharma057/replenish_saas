import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getIntakeForm } from '../Server';

export const IntakeFormPreview = () => {
  const [intakeForm, setIntakeForm] = useState()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        const response = await getIntakeForm(id);
        console.log(response);
        if (response.status == 200) {
          setIntakeForm(response?.data)
        }
      } catch (error) {
        console.error('Error fetching intake forms:', error);
      }
    };
    fetchData();
  }, []);

  <Link className="no-underline" to={"/intake-forms"}><div className="border-[2px]  text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Return to Intake Form</div></Link>


  return (
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
            <form className="w-full " onSubmit={() => { alert("form submited sucessfully") }}>
              <div className="grid grid-cols-2 gap-x-4 gap-y-5 w-full bg-white p-4 px-4   rounded-lg" >
                {Array.isArray(intakeForm?.form_data?.step1) && intakeForm?.form_data?.step1.map((field, index) => (
                  <div key={index} className={` flex flex-wrap   ${field.include_in_intake ? "block" : "hidden"}`}>
                    <div>
                      <label>{field.input_name} {field.required && <span className={`text-[13px]`}>(Required)</span>}</label>
                      {/* <div dangerouslySetInnerHTML={{__html: field?.discription}}></div> */}
                    </div>
                    <div className="border-[1px] w-full self-start px-2 py-[6px] rounded-md border-gray-300 bg-slate-50" >
                      <input className="focus:outline-none w-full bg-slate-50" name={field.name} required={field.required} type={field.input_type} />
                    </div>
                  </div>
                ))}
              </div>
              {/* <div className="flex items-center justify-center py-3 ">
                <button type="submit" className="bg-[#22d3ee] text-white px-5 h-[35px] rounded-md">
                  Submit
                </button>
              </div> */}
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
  )
}

