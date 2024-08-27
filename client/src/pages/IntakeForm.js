import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthUserContext";
import { Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { getIntakeForms } from "../Server";



const IntakeForm = () => {
  const { authUserState } = useAuthContext();
  const[intakeForms,setIntakeForms]=useState()
  const[editIntakeForm,setEditIntakeForm]=useState()
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getIntakeForms();
        if (response.status === 200) {
          setIntakeForms(response.data)
        }
      } catch (error) {
        console.error('Error fetching intake forms:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-200 py-3">
      <div className={`  h-full w-[82rem] mx-auto p-[2rem] rounded-md bg-white`}>
        <div className="h-[100px] flex items-center w-full border-[1px] rounded-lg px-3">
          <div className="flex justify-between w-full">
            <h3 className="m-0 p-0">{authUserState.user?.name}</h3>
            <Link to="/new-intake-form">
              <Button variant="info" type="button" className="text-white">New IntakeForm</Button>
            </Link>
          </div>
        </div>
        <div className=" h-[calc(100%-100px)] overflow-y-auto  ">
          <div className="  h-full ">
            <div className=" ">
            <div className='flex flex-col items-center justify-center text-center w-[90%] mx-auto text-[14px] gap-1 py-3'>
              <div>Online intake forms allow you to collect contact information, family and medical history, and consent from your client. The client response will become part of their profile and chart.</div>
              <div>Employee will automatically prompt clients to fill out an intake form in any email sent prior to their first visit. After their first visit, you can send them a link to fill out the intake form from their client profile.</div>
            </div>
            </div>
            <div className="h-[calc(100%-90px)] flex flex-col gap-2 border p-3 rounded-lg">
              {Array.isArray(intakeForms) && intakeForms.map((form, i) => (
                <div key={i} className="grid grid-cols-[auto,1fr,230px] gap-4  p-[10px] border-b  ">
                  <div className="self-start pt-1">
                    <div className="rounded-[50%] bg-slate-200 h-[45px] w-[45px] flex justify-center items-center">
                      {i+1}
                    </div>
                  </div>
                  <div>
                    <div>
                      <div className="text-[21px]">{form.name}</div>
                      <div className="text-[15px]">{form.introduction}</div>
                    </div>
                  </div>
                  <div className="self-start grid grid-cols-[1fr,1fr,50px] gap-1 pt-1 text-[15px]">
                    <button className="bg-white border border-gray-900 px-2 py-1  rounded-md" onClick={()=>{navigate(`/new-intake-form/?duplicate-intake-form-id=${form.id}`)}}>Duplicate</button>
                    <Link  target="_blank" className="text-black" to={`/intake-form-preview/?intake_form_id=${form?.id}`}><button className="bg-white border border-gray-900 px-2 py-1  rounded-md">Preview</button></Link>
                    {((authUserState?.user?.is_admin) === true || (authUserState?.user?.id === form?.employee?.id)) && (
                      <button className="bg-[#22d3ee] px-2 py-1 text-white  rounded-md" onClick={()=>{navigate(`/new-intake-form/?intake-form-id=${form.id}`)}}>Edit</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;
