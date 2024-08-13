

import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthUserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getClientResponseIntakeForms, getSubmittedResponseIntakeForms } from "../Server";

const SubmitedClientIntakeForm = (clientId) => {
  
  const { authUserState } = useAuthContext();
  const navigate = useNavigate();
  const [clientResponseIntakeForms,setClientResponseIntakeForms] = useState([])   
  const  fetchClientResponseIntakeForms = async () => {
    try {
      const {data} = (!authUserState?.user?.is_admin) ? await getSubmittedResponseIntakeForms(clientId?.clientId, authUserState?.user?.id) : (clientId?.clientId) ? await getSubmittedResponseIntakeForms(clientId?.clientId, " ") : await getClientResponseIntakeForms();
      if (data) {
        setClientResponseIntakeForms(data)
      }
    } catch (error) {
      console.log("err", error?.response?.data?.error);
    }
  
  };

  useEffect(()=>{
    fetchClientResponseIntakeForms()
  },[])

return (
    <div className={`bg-gray-200 min-h-[calc(100%-56px)]  p-3 px-4`}>
    <div className="w-[82rem] mx-auto h-full bg-white  rounded-md px-16 py-1 pb-4">
        <div className="flex justify-between items-center w-full h-[100px] text-gray-500">
        <h2><span>{Array.isArray(clientResponseIntakeForms) && clientResponseIntakeForms[0]?.client?.name}</span> Intake Forms</h2> 

        </div>
        <div className="h-full border rounded-lg p-4">
        <div className="flex justify-between px-4 font-semibold py-2">
            <div>Forms</div>
            <div>Action</div>
          </div>
        <div className="h-full flex flex-col gap-3">
        
            {Array.isArray(clientResponseIntakeForms) && clientResponseIntakeForms.map((form,index)=>(
                <div key={index} className="flex flex-col gap-2 border rounded-lg overflow-hidden">
                
                    <div className=" p-1 flex justify-between items-center py-2 px-3  bg-slate-50 hover:bg-blue-50 duration-300 ">
                      <div>{form?.intake_form?.name}</div>
                      <Link  target="_blank" className="text-black no-underline" to={authUserState?.user ? `/submitted-intake-form-preview/?intake_form_id=${form?.id}` :`/clients/submitted-intake-form-preview/?intake_form_id=${form?.id}`}><button className="bg-white border border-gray-900 px-2 py-1  rounded-md">Preview</button></Link>
                      </div>
                      <div className="px-3 ">
                        {form?.intake_form?.introduction}
                      </div>

                </div>
            ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitedClientIntakeForm;

