import React, { useEffect, useRef } from 'react'
import { useState } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'



export const DropDown = ({ options, onChange, default_value, small=false, readonly=true}) => {
    const [select, setSelect] = useState(false)
    const [value, setValue] = useState(default_value)
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSelect(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef}>
            <div className={`border-[2px] bg-white ${small ? "px-1 py-[1px] " : "px-2 py-[6px]"} rounded-md relative`}onClick={() => { setSelect(!select) }} >
                <input type="text" onChange={(e)=>{onChange(e.target.value || default_value)}} className={`focus:outline-none bg-white ${small ? "max-w-[78px] text-[14px]" : "text-[18px]"}`} value={ value || default_value}/>
                <RiArrowDownSLine className={`absolute top-[50%] translate-y-[-50%]  right-2 duration-300 ${small ? "right-[3px] text-[15px]" : "right-2 text-[20px]"} ${select&& readonly ? "rotate-180" : "rotate-0"}`} />
            </div>
            <div className='relative w-full'>
                <div className={`bg-gray-100 w-full rounded-sm absolute z-10 top-0 ${select && readonly ? "block" : "hidden"}`}>
                    {
                        options.map((option, index) => (<div key={index} className={` ${small ? "px-1 py-[1px] text-[15px]" : "px-2 py-[6px]"} hover:bg-[#49c1c7] hover:text-white flex items-center`} onClick={() => {setValue(option); setSelect(false); onChange(option) }}>{option}</div>))
                    }
                </div>
            </div>
        </div>
    )
}

