import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../context/AuthUserContext';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { getEmployeeBankDetails, onboardEmployeeToStripe } from '../Server';
import { toast } from 'react-toastify';

const BankDetails = ({ employee }) => {
    const { authUserState } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [bankDetails, setBankDetails] = useState();
  const [screenLoading, setScreenLoading] = useState(false)

    useEffect(()=>{
        getSelectedEmployeeBankDetails();
    },[])
    const getSelectedEmployeeBankDetails=async()=>{
        try {
            setScreenLoading(true)
            let response = await getEmployeeBankDetails({employee_id:employee.id});
            setBankDetails(response.data.bank_accounts[0])
            setScreenLoading(false)
        } catch (error) {
            setScreenLoading(false)
        }
    }
    const handleOnboard=async()=>{
        setScreenLoading(true)
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
            setScreenLoading(false)
        } catch (error) {
            toast.error(error.response.data.error)
            setLoading(false)
            setScreenLoading(false)
        }
        setScreenLoading(false)
    }
    const ScreenLoading = () => {
        return <div style={{ width: "100%", height: "87vh", position: "absolute", zIndex: 9, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
            <Spinner animation="border" variant="info" />
        </div>
    }
    return (
        <div className='p-3 w-100 rounded h-[80vh] position-relative' style={{position:"relative"}}>
             {screenLoading && <ScreenLoading />}
            { authUserState.user.stripe_account_id &&<p className='fs-4 fw-semibold'>Bank Details</p>}
            {authUserState.user.stripe_account_id===null ? <div className='d-flex justify-content-center flex-column'>
                <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
                    Kindly Onboard Yourself To <span className="text-cyan-500"> Stripe</span> To Proceed
                </h1>
                <Button n className='w-[300px] m-auto' size='md' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} onClick={handleOnboard} disabled={loading}>Add Your Bank Details{loading && <Spinner animation="border" variant="white" style={{ width: "15px", height: "15px" }} />}</Button>
            </div>:
            <Form>
                <Row>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Bank Name</Form.Label>
                            <Form.Control type="text" disabled value={bankDetails?.bank_name}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Bank Account ID</Form.Label>
                            <Form.Control type="text" disabled value={bankDetails?.bank_name}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Routing Number</Form.Label>
                            <Form.Control type="text" disabled value={bankDetails?.routing_number}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Status</Form.Label>
                            <Form.Control type="text" disabled value={bankDetails?.status}/>
                        </Form.Group>
                    </Col>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Account Number</Form.Label>
                            <Form.Control type="text" disabled value={"*******"+bankDetails?.last4}/>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>}
        </div>
    )
}

export default BankDetails