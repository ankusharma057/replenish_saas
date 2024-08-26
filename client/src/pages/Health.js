import React from 'react'
import { useEffect } from 'react'
import { getHealth } from '../Server'
import { useState } from 'react'

const Health = () => {
  const [data,setData] = useState()
const health = async() =>{
  try{
      const response = await getHealth()
      if(response?.status === 200){
        setData(response?.data)
      }
    }
  catch(error){
      console.error(error)
  }
}

  useEffect(()=>{
    health()
  },[])
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default Health