import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../context/AuthUserContext';
import { Button, Spinner } from 'react-bootstrap';
import { getEmployeeBankDetails, onboardEmployeeToStripe } from '../Server';
import { toast } from 'react-toastify';

const BankDetails = ({ employee }) => {
    const { authUserState } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [bankDetails, setBankDetails] = useState({});
    useEffect(()=>{
        getSelectedEmployeeBankDetails();
    },[])
    const getSelectedEmployeeBankDetails=async()=>{
        try {
            let response = await getEmployeeBankDetails({employee_id:employee.id});
            setBankDetails(response.data)
        } catch (error) {
            toast.error(error.response.data.error)
        }
    }
    const handleOnboard=async()=>{
        setLoading(true)
        let payload={
            employee_id:authUserState?.user?.id
        }
        try {
        let response = await onboardEmployeeToStripe(payload);
        const link = document.createElement('a');
        link.href = response.data.redirect_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoading(false)
    } catch (error) {
        toast.error(error.response.data.error)
        setLoading(false)
    }

    }   
    return (
        <div className='p-3 w-100 rounded h-[80vh]'>
           <p className='fs-4 fw-semibold'>Bank Details</p> 
           {(!authUserState.user?.is_admin && authUserState?.user?.is_mentor && !authUserState.user.stripe_account_id) &&<div className='d-flex justify-content-center flex-column'>
                <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
                Kindly Onboard Yourself to <span className="text-cyan-500"> Stripe</span> to Proceed
                </h1>
            <Button n className='w-[300px] m-auto' size= 'md' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} onClick={handleOnboard} disabled={loading}>Add Your Bank Details{loading &&<Spinner animation="border" variant="white" style={{width:"15px",height:"15px"}}/>}</Button>
           </div>}
        </div>
    )
}

export default BankDetails