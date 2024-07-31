import { useEffect, useRef, useState } from "react";
import { FaBook, FaUndo } from "react-icons/fa";
import { PiGridNineLight } from "react-icons/pi";
import { useLocation } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import SignatureCanvas from 'react-signature-canvas'
import Select from "react-select";
import { DropDown } from "../components/DropDown/DropDown";
import { Range } from 'react-range';
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
import Switch from '@mui/material/Switch';
import { confirmAlert } from "react-confirm-alert";


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
    layout:"horizontal",
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

const Questionnaires = ({title}) => {
  const location = useLocation();
  const topModelRef = useRef(null);
  const sigCanvasRef = useRef(null);
  const canvasRef = useRef(null);
  const [optionModel, setOptionModel] = useState(false)
  const [qutionaryFields, setQutionaryFields] = useState([])
  const [values, setValues] = useState(qutionaryInputs?.initialRange?.value.map(v => v.value));
  const [editModel, setEditModel] = useState({name:"",index:""})
  const [selectedvalue,setSelectedvalue]= useState(null)
  const [inputHover,setInputHover]= useState(null)
  const [changes,setChanges] = useState(false)

// ----------------------------------------------------
const saveSignature = () => {
  if (sigCanvasRef.current) {
    const base64Signature = sigCanvasRef.current.toDataURL();
    console.log(base64Signature);
  }
};

console.log("titletitle",title);

const handleSave = () => {
  console.log('Save button clicked');
};
// ---------------------------------------------------
// qutionaryFields onchange

const openModalFromParent = () => {
  console.log(topModelRef?.current);
  if (topModelRef?.current) {
    topModelRef?.current?.openModal();
  }
  setChanges(false)
};

const closeModel = () =>{
  if (topModelRef?.current) {
    topModelRef?.current?.closeModal();
  }
}

const closeModalFromParent = () => {
  if(changes){
    confirmAlert({
      title: "Discard Changes",
      message: `Are you sure Delete ?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            closeModel()
          },
        },
        {
          label: "No",
          onClick: () => {
        
          }
        },
      ],
    });
  }
  else{
    closeModel()
  }
 
};

const createQutionaryFields = (intialFieldName) => {
  setQutionaryFields((prev) => ([...prev, { ...qutionaryInputs[intialFieldName], id: qutionaryFields.length + 1 }]))
}

const handleDeleteField = (index) => {

  if(changes){
    confirmAlert({
      title: "Discard Changes",
      message: `Are you sure Delete ?`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            setQutionaryFields((prev)=>{
              const updatedFields = [...qutionaryFields]
              updatedFields.splice(index,1)
              return updatedFields
              })
              closeModel()
          },
        },
        {
          label: "No",
          onClick: () => {
        
          }
        },
      ],
    });
  }
  else{
    setQutionaryFields((prev)=>{
      const updatedFields = [...qutionaryFields]
      updatedFields.splice(index,1)
      return updatedFields
      })
    closeModel()
  }
} 

const handleChange = (key, value, index) => {
  setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    return updatedFields;
  });
  setChanges(true)
};

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

const handleOptionsChange = (objIndex,optionIndex,key,value) => {
    setQutionaryFields((prev)=>{
      console.log(objIndex,optionIndex,key, value);
      const updatedFields = [...prev]
        const copyObj = [...updatedFields[objIndex]?.value]
         copyObj[optionIndex] = {...copyObj[optionIndex],[key]:value}
         updatedFields[objIndex] = {...updatedFields[objIndex],value:copyObj}
         return updatedFields
    })
    setChanges(true)
}

const deleteOption = (objIndex, optionIndex) => {
  console.log(objIndex, optionIndex);
  setQutionaryFields((prev) => {
    const updatedFields = [...prev];
    const copyValue = [...updatedFields[objIndex].value];
    copyValue.splice(optionIndex, 1);
    updatedFields[objIndex] = { ...updatedFields[objIndex], value: copyValue }; 
    return updatedFields; 
  });
};

  return (
    <div className=" ">
      <div className="bg-white ">
        <div className=" py-3 flex flex-col gap-4">
          {Array.isArray(qutionaryFields) && qutionaryFields.map((field, index) => (
            field?.type === "textarea" ? (
              <>
                {/* Note */}
                <div className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"textarea", index:index});openModalFromParent()}}>
                  <div className="flex justify-between items-center py-1">
                    <div className="font-semibold text-[17px]">{field?.label}</div>
                    <div className="text-[20px] cursor-pointer"  ><BsThreeDotsVertical /></div>
                  </div>
                  <div className="border rounded-md overflow-hidden border-black p-1 bg-white ">
                    <textarea className="w-full focus:outline-none" readOnly={field?.read_only} required={field?.required} value={field?.value} rows="3"></textarea>
                  </div>
                </div></>)
              :
              field?.type === "signature" ? (<>
                {/* Signature */}
                <div className="hover:bg-gray-100 rounded-md  p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"signature",index:index}); openModalFromParent()}}>
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-[17px]">{field?.label}</div>
                    <div className="text-[20px] cursor-pointer"  ><BsThreeDotsVertical /></div>
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
                  <div className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"heading", index:index}); openModalFromParent()}}>
                    <div className="flex justify-between items-center ">
                      <div className="font-semibold text-[17px]">{field?.label}</div>
                      <div className="text-[20px] cursor-pointer" ><BsThreeDotsVertical /></div>
                    </div>
                    <div className="text-[22px] py-2 font-medium">{field?.value}</div>
                  </div>
                </>)
                  :
                  field?.type === "checkbox" ? (<>
                    {/* Check Boxes */}
                    <div className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"checkbox", index:index}); openModalFromParent()}}>
                      <div className="flex justify-between items-center  py-1">
                        <div className="font-semibold text-[17px]">{field?.label}</div>
                        <div className="text-[20px] cursor-pointer" ><BsThreeDotsVertical /></div>
                      </div>
                      <div className={`${field?.layout === "horizontal" ? "flex gap-x-5 flex-wrap gap-y-2" :field?.layout === "vertical" ? "grid grid-cols-1":"grid grid-cols-3"}`}>
                        {Array.isArray(field.value) && field.value.map((checkbox, i) => (
                          <div key={i} className="flex gap-2  items-center">
                            <input id={checkbox?.label} readOnly={field?.read_only} required={field?.required} checked={checkbox?.value}  type="checkbox" />
                            <label htmlFor={checkbox?.label} >{checkbox?.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>)
                    :
                    field?.type === "dropdown" ? (<>
                      {/* Drop down */}
                      <div className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"dropdown", index:index}); openModalFromParent()}}>
                        <div className="flex justify-between items-center ">
                          <div className="font-semibold text-[17px]">{field?.label}</div>
                          <div className="text-[20px] cursor-pointer" ><BsThreeDotsVertical /></div>
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
                        <div className="hover:bg-gray-100 rounded-md p-[6px] flex flex-col gap-1 " onClick={() => {setEditModel({name:"range", index:index}); openModalFromParent()}}>
                          <div className="flex justify-between items-center ">
                            <div className="font-semibold text-[17px]">{field?.label}</div>
                            <div className="text-[20px] cursor-pointer" >
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
                          <div className=" hover:bg-gray-100  rounded-md p-[6px] flex flex-col gap-1" onClick={() => {setEditModel({name:"instruction", index:index}); openModalFromParent()}}>
                            <div className="flex justify-between items-center  py-1">
                              <div className="font-semibold text-[17px]">{field?.label}</div>
                              <div className="text-[20px] cursor-pointer" ><BsThreeDotsVertical /></div>
                            </div>
                            <div className="text-[18px] bg-white  rounded-lg pl-3 font-medium py-3"><em>{field?.value}</em></div>
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
                    <div key={index} onClick={() => { createQutionaryFields(option?.field); setOptionModel(false) }} className="grid grid-cols-[1fr,auto] px-2 hover:bg-white duration-300 py-[5px] cursor-pointer">
                      <div className="text-[15px] cursor-pointer">{option?.label}</div>
                      <div className="text-[18px] cursor-pointer">{option?.icon}</div>
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

     {editModel?.name === "textarea" && <TopModel onSave={handleSave} 
     ref={topModelRef}
     footer={
        <div className='flex justify-between gap-2'>
          <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}}  ><MdDelete /></button>
          <div className="flex gap-2">
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.label} onChange={(e)=>{handleChange( "label",e?.target?.value,editModel?.index)}}  />
            </div>
          </div>
          <div className="border-[2px] overflow-hidden  rounded-md px-2">
            <textarea className="w-full focus:outline-none max-h-[70px]" value={qutionaryFields[editModel?.index]?.value} onChange={(e)=>{handleChange("value", e?.target?.value,editModel?.index)}}   rows="3"></textarea>
          </div>
          <div className="flex justify-between py-1">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </TopModel>}

      {editModel?.name  === "signature" && <TopModel onSave={handleSave} ref={topModelRef}
        footer={
          <div className='flex justify-between gap-2'>
            <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}} ><MdDelete /></button>
            <div className="flex gap-2">
             <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
             <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={selectedvalue?.label} onChange={(e)=>{handleChange("label", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div className="flex justify-between py-1">
            <div>Required</div>
            {/* <div><input type="radio" onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </div>
      </TopModel>}

      {editModel?.name  === "heading" && <TopModel onSave={handleSave} ref={topModelRef}
         footer={
          <div className='flex justify-between gap-2'>
            <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white'onClick={()=>{handleDeleteField(editModel?.index)}}  ><MdDelete /></button>
            <div className="flex gap-2">
             <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
             <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.value}  onChange={(e)=>{handleChange("value", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div className="flex justify-between py-1">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} /></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </div>
      </TopModel>}

      {editModel?.name  === "checkbox" && <TopModel onSave={handleSave} ref={topModelRef}
      footer={
        <div className='flex justify-between gap-2'>
          <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}}  ><MdDelete /></button>
          <div className="flex gap-2">
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.label} onChange={(e)=>{handleChange("label", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div>
            <label>Checkbox Layout</label>
            <div className="flex gap-4">
              <div className="flex gap-1">
                <input type="radio" id="horizontal" name="Layout" checked={qutionaryFields[editModel?.index]?.layout === "horizontal"} onChange={(e)=>{handleChange("layout", "horizontal", editModel?.index)}}/>
                <label htmlFor="horizontal">Horizondal</label>
              </div>
              <div className="flex gap-1">
                <input type="radio" id="vertical" name="Layout"  checked={qutionaryFields[editModel?.index]?.layout === "vertical"} onChange={(e)=>{handleChange("layout", "vertical", editModel?.index)}}/>
                <label htmlFor="vertical">Vertical</label>
              </div>
              <div className="flex gap-1">
                <input type="radio" id="column" name="Layout"  checked={qutionaryFields[editModel?.index]?.layout === "column"} onChange={(e)=>{handleChange("layout", "column", editModel?.index)}}/>
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
            {Array.isArray(qutionaryFields) && qutionaryFields[editModel?.index]?.value.map((option, i)=>(
                <div key={i} className="grid grid-cols-[15%,1fr,20%] items-center hover:bg-gray-100 py-[2px] group">
                  <div className="">
                  <input type="checkbox" id={option?.label} checked={option?.value} onChange={(e)=>{handleOptionsChange(editModel?.index, i ,"value" ,e.target.checked)}} className="w-[20%]" />
                  </div>

                  <div onMouseEnter={()=>{setInputHover(i)}} className=" py-[2px]  flex items-center" onMouseLeave={()=>{setInputHover("")}}>
                  {inputHover === i ?
                  <div className="flex items-center "><input className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100" type="text" value={option?.label} onChange={(e)=>{handleOptionsChange(editModel?.index, i ,"label" ,e.target.value)}} /></div>
                  :
                  <div htmlFor={option?.label}>{option?.label}</div>}
                  </div>
                
                  <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex ">
                    <div className="cursor-pointer" onClick={()=>{addOption("checkbox",editModel?.index,i+1)}}><IoMdAdd /></div>
                    <div className="cursor-pointer" onClick={()=>{deleteOption(editModel?.index,i)}}><MdDelete /></div>
                    <div className="cursor-pointer" ><PiColumnsFill /></div>
                  </div>
                </div>
            ))}
          </div>
          <div className="flex justify-between">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </TopModel>}

      {editModel?.name  === "dropdown" &&<TopModel onSave={handleSave} ref={topModelRef}
      footer={
        <div className='flex justify-between gap-2'>
          <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}}  ><MdDelete /></button>
          <div className="flex gap-2">
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.label} onChange={(e)=>{handleChange("label", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
          <div className="grid grid-cols-[1fr,25%] items-center py-1 bg-gray-200">
        
            <div className="pl-4">Options</div>
            <div className="flex justify-center">Action</div>
          </div>
            {Array.isArray(qutionaryFields) && qutionaryFields[editModel?.index]?.value.map((option, i)=>(
                <div key={i} className="grid grid-cols-[1fr,25%] items-center hover:bg-gray-100 py-[2px] group" >

                  <div onMouseEnter={()=>{setInputHover(i)}} className=" py-[2px]  flex items-center" onMouseLeave={()=>{setInputHover("")}}>
                    {inputHover === i ?
                    <div className="flex items-center "><input className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100" type="text" value={option?.label} onChange={(e)=>{handleOptionsChange(editModel?.index, i ,"label" ,e.target.value)}} /></div>
                    :
                    <div htmlFor={option?.label}>{option?.label}</div>}
                  </div>

                  <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex">
                    <div className="cursor-pointer" onClick={()=>{addOption("dropdown",editModel?.index,i+1)}}><IoMdAdd /></div>
                    <div className="cursor-pointer"><MdDelete onClick={()=>{deleteOption(editModel?.index,i+1)}}/></div>
                    <div className="cursor-pointer"><PiColumnsFill /></div>
                  </div>
                </div>
            ))}
          </div>
          <div className="flex justify-between py-2">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </TopModel>}

      {editModel?.name  === "range" && <TopModel onSave={handleSave} ref={topModelRef}
      footer={
        <div className='flex justify-between gap-2'>
          <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}} ><MdDelete /></button>
          <div className="flex gap-2">
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white'  onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.label} onChange={(e)=>{handleChange("label", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div className=" overflow-hidden  rounded-md px-2 flex flex-col gap-1">
          <div className="grid grid-cols-[1fr,25%] items-center py-1 bg-gray-200">
        
            <div className="pl-4">Options</div>
            <div className="flex justify-center">Action</div>
          </div>
            {Array.isArray(qutionaryFields) && qutionaryFields[editModel?.index].value.map((option, i)=>(
                <div key={i} className="grid grid-cols-[1fr,25%] items-center hover:bg-gray-100 py-[2px] group">
                  
                  <div onMouseEnter={()=>{setInputHover(i)}} className=" py-[2px]  flex items-center" onMouseLeave={()=>{setInputHover("")}}>
                    {inputHover === i ?
                    <div className="flex items-center "><input className="w-full box-border bg-white  focus:outline-none  rounded-[2px] border-gray-100" type="text" value={option?.label} onChange={(e)=>{handleOptionsChange(editModel?.index, i ,"label" ,e.target.value)}} /></div>
                    :
                    <div htmlFor={option?.label}>{option?.label}</div>}
                  </div>
                  
                  <div className="flex text-[18px] justify-evenly hidden group-hover:inline-flex">
                    <div className="cursor-pointer" onClick={()=>{addOption("range",editModel?.index,i+1)}}><IoMdAdd /></div>
                    <div className="cursor-pointer"><MdDelete onClick={()=>{deleteOption(editModel?.index,i+1)}}/></div>
                    <div className="cursor-pointer"><PiColumnsFill /></div>
                  </div>
                </div>
            ))}
          </div>
          <div className="flex justify-between py-2">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </TopModel>}

      {editModel?.name  === "instruction" && <TopModel onSave={handleSave} ref={topModelRef}
       footer={
        <div className='flex justify-between gap-2'>
          <button type='button' className='bg-red-500 px-2 py-[3px] text-[18px] rounded-md text-white' onClick={()=>{handleDeleteField(editModel?.index)}} ><MdDelete /></button>
          <div className="flex gap-2">
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={closeModalFromParent} >Close</button>
           <button type='button' className='bg-[#0dcaf0] px-2 py-[3px] text-[16px] rounded-md text-white' onClick={()=>{closeModel()}}>Save</button>
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
              <input type="text" className="w-full focus:outline-none" value={qutionaryFields[editModel?.index]?.value} onChange={(e)=>{handleChange("value", e?.target?.value, editModel?.index)}} />
            </div>
          </div>
          <div className="flex justify-between">
            <div>Required</div>
            {/* <div><input type="radio" checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}}/></div> */}
            <Switch checked={qutionaryFields[editModel?.index]?.required} onChange={(e)=>{handleChange("required", e?.target?.checked, editModel?.index)}} defaultChecked />
          </div>
          </div>
        </div>
      </div>
      </TopModel>}
    </div>
  )
}

export default Questionnaires;
