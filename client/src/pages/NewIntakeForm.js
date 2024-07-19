import React, { useEffect, useState } from "react";
import { useAuthContext } from "../context/AuthUserContext";
import { Link } from "react-router-dom";
import { createIntakeForm, getIntakeForm, updateIntakeForm } from "../Server";
import { toast } from "react-toastify";
import Select from "react-select";


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
  // {
  //   tab_name: "Questionnaires",
  //   value: 4
  // },
  // {
  //   tab_name: "Consents",
  //   value: 5
  // },
  // {
  //   tab_name: "Form Preview",
  //   value: 6
  // }
]

const specific_staff_member = ["specific_staff_member 1", "specific_staff_member 2", "specific_staff_member 3"]
const Specific_treatments = ["Specific_treatments1", "Specific_treatments2", "Specific_treatments3"]

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
    input_type: "number",
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
    input_type: "number",
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
]

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
]


const NewIntakeForm = () => {
  const { authUserState } = useAuthContext();
  const [selectedTab, setSelectedTab] = useState(0);
  const [intakeFormData, setIntakeFormData] = useState({
    form_data: { step1: profile_fields },
    employee_id: authUserState?.user?.id,
    prompt_type: "automatic",
    valid_for: "forever"
  })
  const [intakeFormDatas, setIntakeFormDatas] = useState()
  const [intakeFormError, setIntakeFormError] = useState()
  const [editedId, setEditedId] = useState()

  console.log("intakeFormDatassss", intakeFormData);

  const [profileFields, setProfileFields] = useState(profile_fields);

  // console.log("intakeFormData",intakeFormData);

  const handleOnChange = (fieldName, index, value) => {
    const copyProfileFields = [...intakeFormData?.form_data?.step1];
    copyProfileFields[index][fieldName] = value;
    setIntakeFormData((prev) => ({ ...prev, ...["form_data"]["step1"] = copyProfileFields }));
  };

  const [consents, setConsents] = useState([
    { name: "", text: "", declaration: "", disagreeOption: "" },
  ]);

  const addConsent = () => {
    setConsents([
      ...consents,
      { name: "", text: "", declaration: "", disagreeOption: "" },
    ]);
  };

  const removeConsent = (index) => {
    if (index > 0) {
      const newConsents = consents.filter((_, i) => i !== index);
      setConsents(newConsents);
    }
  };

  const handleConsentChange = (index, field, value) => {
    const newConsents = [...consents];
    newConsents[index][field] = value;
    setConsents(newConsents);
  };

  const generateConsentData = () => {
    const consentData = consents.reduce((acc, consent, index) => {
      acc[`consent-${index + 1}`] = {
        "consent-name": consent.name,
        "consent-text": consent.text,
        "consent-declaration": consent.declaration,
        "consent-disagreeOption": consent.disagreeOption,
      };
      return acc;
    }, {});

    return { Consents: consentData };
  };

  const handleSubmit = () => {
    const consentData = generateConsentData();
    console.log(JSON.stringify(consentData, null, 2));
  };



  const submitData = async (e) => {
    e.preventDefault()
    try {
      const response = await createIntakeForm(intakeFormData);
      if (response.status === 201) {
        toast.success("Intake form successfully created");
        setTimeout(() => { window.location.replace("/intake-forms"); }, 1500);
      }
    } catch (error) {
      toast.error("Something Went Wrong ");
      setIntakeFormError(error?.response?.data?.error)
    }
  };

  const upadteData = async (e) => {
    e.preventDefault()
    try {
      const response = await updateIntakeForm(intakeFormData.id, intakeFormData);
      if (response.status === 200) {
        toast.success("Intake form successfully updated");
        setTimeout(() => { window.location.replace("/intake-forms"); }, 1500);
        console.log("response", response);
        setIntakeFormData(response?.data)
      }
    } catch (error) {
      toast.error("Something Went Wrong ");
      setIntakeFormError(error?.response?.data?.error)
    }
  };



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setEditedId(urlParams.get('intake-form-id'))
  }, [])

  const editData = async () => {
    try {
      const response = await getIntakeForm(editedId);
      if (response.status === 200) {
        setIntakeFormData(response.data);
      } else {
        // Handle other response statuses if needed
      }
    } catch (err) {
      // Handle errors if the request fails
    }
  };

  useEffect(() => {
    if (editedId) {
      console.log("bkohgbkiodfkihbi");
      editData();
    }
  }, [editedId]);





  return (
    <div className={`bg-gray-200   p-3 px-4 ${selectedTab === 2 ? "h-[90rem]" : ""}`}>
      <div className="w-[82rem] mx-auto h-full bg-white  rounded-md px-16 py-1">
        <div className="flex justify-between items-center w-full h-[100px] text-gray-500">
          {editedId ? <h2>Update Intake Form</h2> : <h2>New Intake Form</h2>}
          <Link className="no-underline" to={"/intake-forms"}><div className="border-[2px]  text-gray-500 border-gray-300 px-2 py-1 bg-white rounded-md">Return to Intake Form</div></Link>
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
                {selectedTab === 0 && <div className="">
                  <div className="h-[50px] flex items-center">
                    <div>
                      <h3 className="m-0">General</h3>
                    </div>
                  </div>
                  <div className="  ">
                    <div className="h-[65%] flex flex-col justify-between">
                      {/* input 1 */}
                      <div className="flex ">
                        <div className="w-3/4">
                          <label className="text-[18px] ">
                            Name -<em> Required</em>
                          </label>
                        </div>
                        <div className="w-1/4 flex flex-col gap-[1px] ">
                          <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300" >
                            <input className="focus:outline-none w-full" type="text" value={intakeFormData.name} required onChange={(e) => { setIntakeFormData((prev) => ({ ...prev, ["name"]: e.target.value })) }} />
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
                          {/* <DropDown options={automaticOrManual} onChange={(value) => {setIntakeFormData((prev)=>({...prev,["prompt_type"]:value}))}} default_value={"automatic"} /> */}
                          <Select
                            inputId="availableEmployee"
                            value={automaticOrManual.find(option => option.value === intakeFormData.prompt_type)}
                            isClearable
                            onChange={(e) => {
                              setIntakeFormData((prev) => ({ ...prev, ["prompt_type"]: e?.value }))
                            }}

                            options={automaticOrManual}
                            // placeholder={"Automatic"}
                            defaultValue={"Automatic"}
                            // value={"Automatic"}
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
                            <input className="focus:outline-none w-full" value={intakeFormData.effective_date} id="date" type="date" onChange={(e) => { setIntakeFormData((prev) => ({ ...prev, ["effective_date"]: e.target.value })) }} />
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
                          {/* <DropDown options={valiadte} onChange={(value) => {setIntakeFormData((prev)=>({...prev,["valid_for"]:value}))}} default_value={"forever"} /> */}
                          <Select
                            inputId="availableEmployee"
                            isClearable
                            onChange={(e) => {
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
                            <textarea value={intakeFormData.introduction} onChange={(e) => { setIntakeFormData((prev) => ({ ...prev, ["introduction"]: e.target.value })) }} className="w-full focus:outline-none h-full" />
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
                        <button className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" onClick={() => { setSelectedTab(2) }}>
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>}
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
                      <div className="flex flex-col gap-3    ">
                        {(Array.isArray(intakeFormData?.form_data?.step1) && intakeFormData?.form_data?.step1).map((field, index) => (
                          <div key={index} className={`grid grid-cols-[75%,25%] `}>
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
                          <button type="submit" className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md" >
                            {editedId ? "Update" : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}
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
                {/* {selectedTab === 4 && (
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
                    <div className="h-[calc(100%-50px)] overflow-y-auto">
                      <div className="flex flex-col justify-end items-center h-[40vh]">
                        <div className="flex justify-center flex-col text-center">
                          <p>This intake form questionnaire is currently empty!</p>
                          <p>Build it out by adding items</p>
                        </div>
                        <div className="flex justify-center gap-4">
                          <button className="bg-[#e5e7eb] border-[1px] border-[#cccccc] px-4 py-2 rounded-md flex gap-2 items-center">
                            <FaBook className="text-black" />
                            Template Library
                          </button>
                          <button className="bg-[#0dcaf0] text-white px-4 py-2 rounded-md flex gap-2 items-center">
                            <PiGridNineLight />
                            Add Item
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end py-1">
                      <button
                        className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md"
                        onClick={() => {
                          setSelectedTab(5);
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )} */}
                {/* {selectedTab === 5 && (
                  <div className="h-full overflow-y-auto">
                    <div className="p-3 w-full">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="pb-1">Consents</h3>
                          <button
                            className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md"
                            onClick={addConsent}
                          >
                            Add Consent
                          </button>
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
                            <input type="checkbox" />
                            <label className="ml-2">Require Signature</label>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <p className="text-black text-[16px] mb-0">
                        Require the client to agree to any number of consents
                        or waivers:
                      </p>

                      {consents.map((consent, index) => (
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
                                      onChange={(e) =>
                                        handleConsentChange(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
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
                                      onChange={(e) =>
                                        handleConsentChange(
                                          index,
                                          "text",
                                          e.target.value
                                        )
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
                                <div className="w-1/4">
                                  <div className="border-[1px] px-2 py-[6px] rounded-sm border-gray-300 h-full">
                                    <textarea
                                      onChange={(e) =>
                                        handleConsentChange(
                                          index,
                                          "declaration",
                                          e.target.value
                                        )
                                      }
                                      className="w-full focus:outline-none h-full"
                                      value={consent.declaration}
                                    />
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="flex">
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
                                      onChange={(e) =>
                                        handleConsentChange(
                                          index,
                                          "disagreeOption",
                                          e.target.value
                                        )
                                      }
                                      className="w-full focus:outline-none h-full"
                                      value={consent.disagreeOption}
                                    />
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="flex justify-between">
                                {index > 0 && (
                                  <button
                                    className="bg-red-500 text-white px-3 h-[35px] rounded-md"
                                    onClick={() => removeConsent(index)}
                                  >
                                    Remove Consent
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <hr className="mb-0" />
                        </div>
                      ))}
                    </div>
                  
                    <div className="flex justify-end py-1 mr-4">
                      <button
                        className="bg-[#22d3ee] text-white px-3 h-[35px] rounded-md"
                        onClick={handleSubmit}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )} */}
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
