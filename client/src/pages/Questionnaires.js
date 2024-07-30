import { useRef, useState } from "react";
import { FaBook, FaUndo } from "react-icons/fa";
import { PiGridNineLight } from "react-icons/pi";
import { useLocation } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import SignatureCanvas from 'react-signature-canvas'
import Select from "react-select";
import { CiFileOn } from "react-icons/ci";
import { DropDown } from "../components/DropDown/DropDown";
import { Range } from 'react-range';
import { TopModel } from "../components/TopModel";


import { BsFileEarmarkTextFill } from "react-icons/bs";
import { TbSignature } from "react-icons/tb";
import { FaHeading } from "react-icons/fa6";
import { TbCheckbox } from "react-icons/tb";
import { RxDropdownMenu } from "react-icons/rx";
import { BsSliders2 } from "react-icons/bs";
import { PiWarningCircleBold } from "react-icons/pi";

const qutionaryInputOption = [
  {
    label: "Note",
    icon: <BsFileEarmarkTextFill />,
    field: "initialNote"
  },
  {
    label: "Signature",
    icon: <TbSignature />,
    field: "initialSignature"
  },
  {
    label: "Heading",
    icon: <FaHeading />,
    field: "initialHeading"
  },
  {
    label: "Check Boxes",
    icon: <TbCheckbox />,
    field: "initialCheckBox"
  },
  {
    label: "Drop Down",
    icon: <RxDropdownMenu />,
    field: "initialDropdown"
  },
  {
    label: "Range/Scale",
    icon: <BsSliders2 />,
    field: "initialRange"
  },
  {
    label: "Instruction",
    icon: <PiWarningCircleBold />,
    field: "initialInstruction"
  },
]

const qutionaryInputs = {
  initialNote: {
    id: null,
    type: "textarea",
    label: "Notes",
    value: "Notes default value",
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
    value: [
      { label: "Range 1", value: 10 },
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
  }
}

const fonts = [
  { label: "text", class: "pinyon-script-regular" },
  { label: "text", class: "great-vibes-regular" },
  { label: "text", class: "herr-von-muellerhoff-regular" },
];

const Questionnaires = () => {
  const location = useLocation();
  const topModelRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [optionModel, setOptionModel] = useState(false)
  const [qutionaryFields, setQutionaryFields] = useState([])
  const [values, setValues] = useState(qutionaryInputs?.initialRange?.value.map(v => v.value));
  const [editModel, setEditModel] = useState("")

  console.log("dddd",editModel);


  const createQutionaryFields = (intialFieldName) => {
    setQutionaryFields((prev) => ([...prev, { ...qutionaryInputs[intialFieldName], id: qutionaryFields.length + 1 }]))
  }

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const base64Signature = sigCanvasRef.current.toDataURL();
      console.log(base64Signature);
    }
  };

  const handleSave = () => {
    console.log('Save button clicked');
  };

  const openModalFromParent = () => {
    if (topModelRef?.current) {
      topModelRef?.current?.openModal();
    }
  };

  console.log(qutionaryFields);

  return (
    <div className=" p-2">
      <div className="bg-white">
        <div className=" py-3 flex flex-col gap-4">
          {Array.isArray(qutionaryFields) && qutionaryFields.map((field, index) => (
            field?.type === "textarea" ? (
              <>
                {/* Note */}
                <div className="bg-white  p-[6px] flex flex-col gap-1">
                  <div className="flex justify-between items-center py-1">
                    <div className="font-semibold text-[17px]">{field?.label}</div>
                    <div className="text-[20px]"  onClick={() => {openModalFromParent()}}><BsThreeDotsVertical /></div>
                  </div>
                  <div className="border rounded-md overflow-hidden border-black p-1 ">
                    <textarea className="w-full focus:outline-none" readOnly={field?.read_only} required={field?.required} value={field?.value} rows="3"></textarea>
                  </div>
                </div></>)
              :
              field?.type === "signature" ? (<>
                {/* Signature */}
                <div className="bg-white p-[6px] flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[17px]">{field?.label}</div>
                    <div className="text-[20px]"  onClick={() => {openModalFromParent()}}><BsThreeDotsVertical /></div>
                  </div>
                  <div>
                    <div className='flex justify-between py-1'>
                      <div className='flex gap-3'>
                        <div className='flex gap-2'>
                          <input type="radio" name='sign' checked={field?.sign_type === "draw"} id='draw' onChange={(e) => { }} />
                          <label htmlFor="draw" className='flex items-center'>Draw</label>
                        </div>
                        <div className='flex gap-2'>
                          <input type="radio" name='sign' checked={field?.sign_type === "type"} id='type' onChange={(e) => { }} />
                          <label htmlFor="type" className='flex items-center'>Type</label>
                        </div>
                      </div>
                      {field?.sign_type === "type" &&
                        <div className='w-[300px]'>
                          <DropDown placeholder={"Select Font Style"} options={fonts} onChange={(value) => { }} />
                        </div>
                      }
                    </div>
                    <div className="">
                      {
                        field?.sign_type === "draw" ?
                          <div className='flex gap-3 '>
                            <div className='border-b-[2px]'>
                              <SignatureCanvas penColor='black' throttle={10} maxWidth={2.2}
                                onEnd={() => { saveSignature(); }}
                                ref={sigCanvasRef} canvasProps={{ width: 400, height: 70, className: 'sigCanvas' }} />
                            </div>
                            <div className='flex items-end'>
                              <div className='flex gap-2 items-center text-[14px] text-[#0dcaf0]'>
                                <div className='cursor-pointer' onClick={() => { }} disabled={false}><FaUndo /></div>
                                <div className='text-gray-400'>|</div>
                                <div className='cursor-pointer' onClick={() => { sigCanvasRef.current.clear(); }}>Clear</div>
                              </div>
                            </div>
                          </div>
                          :
                          <>
                            <div className='flex h-[70px]  gap-4'>
                              <div className='flex items-end '>
                                <div className="border-b-[2px] w-[300px]">
                                  <input type="text" placeholder='Enter your Signature' className={` p-2 focus:outline-none w-full  px-2 h-[50px]`} onChange={(e) => { }} />
                                </div>
                              </div>
                              <canvas ref={canvasRef} width="500" height="100" style={{ display: 'none' }}></canvas>
                            </div>
                          </>
                      }
                    </div>
                  </div>
                </div>
              </>)
                :
                field?.type === "heading" ? (<>
                  {/* Heading */}
                  <div className="bg-white p-[6px] flex flex-col gap-1">
                    <div className="flex justify-between items-center ">
                      <div className="font-semibold text-[17px]">{field?.label}</div>
                      <div className="text-[20px]" onClick={() => {setEditModel("heading")}}><BsThreeDotsVertical /></div>
                    </div>
                    <div className="text-[22px] py-2 font-medium">{field?.value}</div>
                  </div>
                </>)
                  :
                  field?.type === "checkbox" ? (<>
                    {/* Check Boxes */}
                    <div className="bg-white p-[6px] flex flex-col gap-1">
                      <div className="flex justify-between items-center  py-1">
                        <div className="font-semibold text-[17px]">{field?.label}</div>
                        <div className="text-[20px]" onClick={() => {setEditModel("checkbox")}}><BsThreeDotsVertical /></div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {Array.isArray(field.value) && field.value.map((checkbox, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <input id={checkbox?.label} readOnly={field?.read_only} required={field?.required} checked={checkbox?.value} type="checkbox" />
                            <label htmlFor={checkbox?.label} >{checkbox?.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>)
                    :
                    field?.type === "dropdown" ? (<>
                      {/* Drop down */}
                      <div className="bg-white p-[6px] flex flex-col gap-1">
                        <div className="flex justify-between items-center ">
                          <div className="font-semibold text-[17px]">{field?.label}</div>
                          <div className="text-[20px]" onClick={() => {setEditModel("dropdown")}}><BsThreeDotsVertical /></div>
                        </div>
                        <div className="py-3">
                          <div className='w-[300px]'>
                            <Select
                              inputId="availableEmployee"
                              isClearable
                              options={fonts}
                              // value={fonts.find(option => option.value === fontStyle)}
                              onChange={(e) => { }}
                              readOnly={field?.read_only}
                              required={field?.required}
                            />
                          </div>
                        </div>
                      </div>
                    </>)
                      :
                      field?.type === "range" ? (<>
                        {/* Range */}
                        <div className="bg-white p-[6px] flex flex-col gap-1 ">
                          <div className="flex justify-between items-center ">
                            <div className="font-semibold text-[17px]">{field?.label}</div>
                            <div className="text-[20px]" onClick={() => {setEditModel("range")}}>
                              <BsThreeDotsVertical />
                            </div>
                          </div>
                          <div className="py-4 pr-3">
                            <Range
                              step={1}
                              min={0}
                              max={100}
                              values={values}
                              onChange={(newValues) => {
                                console.log('New Values:', newValues); // Debugging log
                                setValues(newValues);
                              }}
                              renderTrack={({ props, children }) => (
                                <div
                                  {...props}
                                  style={{
                                    ...props.style,
                                    height: "6px",
                                    width: "100%",
                                    backgroundColor: "#ccc",
                                  }}
                                >
                                  {children}
                                </div>
                              )}
                              renderThumb={({ props, isDragged }) => (
                                <div
                                  {...props}
                                  style={{
                                    ...props.style,
                                    height: "20px",
                                    width: "20px",
                                    backgroundColor: isDragged ? "#548BF4" : "#999",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "50%",
                                    boxShadow: "0px 2px 6px #AAA",
                                  }}
                                >
                                  <div style={{ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: "#FFF" }} />
                                </div>
                              )}
                            />
                          </div>
                        </div>
                      </>)
                        :
                        field?.type === "instruction" ? (<>
                          {/* Instructions */}
                          <div className="bg-white p-[6px] flex flex-col gap-1">
                            <div className="flex justify-between items-center  py-1">
                              <div className="font-semibold text-[17px]">{field?.label}</div>
                              <div className="text-[20px]" onClick={() => {setEditModel("instruction")}}><BsThreeDotsVertical /></div>
                            </div>
                            <div className="text-[18px] bg-slate-100  rounded-lg pl-3 font-medium py-3"><em>{field?.value}</em></div>
                          </div>
                        </>) : null
          ))}
        </div>
        {Array.isArray(qutionaryFields) && qutionaryFields.length === 0 ? <div className="flex justify-center">
          <div className={`flex flex-col gap-2 py-14`}>
            <div className="text-center">
              <div>Some text are in here</div>
              <div>Some text are in here</div>
              <div>Some text</div>
            </div>
            <div className="relative">
              {optionModel && <div className="bg-gray-50 duration-200 rounded-md absolute -top-[200px] left-[30px] w-[200px] h-[200px] overflow-y-auto">
                <div className="py-1">
                  {Array.isArray(qutionaryInputOption) && qutionaryInputOption.map((option, index) => (
                    <div key={index} onClick={() => { createQutionaryFields(option?.field); setOptionModel(false) }} className="grid grid-cols-[1fr,auto] px-2 hover:bg-white duration-300 py-[5px]">
                      <div className="text-[15px]">{option?.label}</div>
                      <div className="text-[18px]">{option?.icon}</div>
                    </div>
                  ))}
                </div>
              </div>}
              <div className="flex w-[135px] bg-[#0dcaf0] text-white   rounded-md">
                <button type="button" className="flex gap-2 justify-end pr-1 items-center py-[6px] w-[26%]">
                  <PiGridNineLight />
                </button>
                <button type="button" className=" flex gap-2 justify-center items-center py-[6px] w-[74%]" onClick={() => { setOptionModel(!optionModel) }}>
                  Add Item
                </button>
              </div>
            </div>
            <div className="text-center">
              <div  >Some text </div>
            </div>
          </div>
        </div>
          :
          <div className="flex">
            <div className="relative">
              {optionModel && <div className="bg-gray-100 duration-200 rounded-md absolute z-10 -top-[200px] left-[30px] w-[200px] h-[200px] overflow-y-auto">
                <div className="py-1">
                  {Array.isArray(qutionaryInputOption) && qutionaryInputOption.map((option, index) => (
                    <div key={index} onClick={() => { createQutionaryFields(option?.field); setOptionModel(false) }} className="grid grid-cols-[1fr,auto] px-2 hover:bg-white duration-300 py-[5px]">
                      <div className="text-[15px]">{option?.label}</div>
                      <div className="text-[18px]">{option?.icon}</div>
                    </div>
                  ))}
                </div>
              </div>}
              <div className="flex  w-[135px] bg-[#0dcaf0] text-white   rounded-md">
                <button type="button" className="flex gap-2 justify-end pr-1 items-center py-[6px] w-[26%]">
                  <PiGridNineLight />
                </button>
                <button type="button" className="whitespace-nowrap flex gap-2 justify-center items-center py-[6px] w-[74%]" onClick={() => { setOptionModel(!optionModel) }}>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "textarea" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello textarea the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "signature" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello signature the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "checkbox" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello checkbox the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "dropdown" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello dropdown the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "range" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello range the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>

      <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "instruction" ? true : false} >
        <h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello instruction the Modal!</h2>
        <p>This is some content inside the modal.</p>
      </TopModel>
    </div>
  )
}

export default Questionnaires;



{/* <TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "textarea" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello textarea the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel>

<TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "signature" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello signature the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel>

<TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "checkbox" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello checkbox the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel>

<TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "dropdown" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello dropdown the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel>

<TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "range" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello range the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel>

<TopModel onSave={handleSave} ref={topModelRef} isOpenModel={editModel === "instruction" ? true : false} >
<h2 ref={subtitle => (subtitle ? (subtitle.style.color = '#00f') : null)}>Hello instruction the Modal!</h2>
<p>This is some content inside the modal.</p>
</TopModel> */}