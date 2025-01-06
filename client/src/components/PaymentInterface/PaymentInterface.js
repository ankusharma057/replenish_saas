import React, { useEffect, useRef, useState } from 'react'
import CardEntryIllustration from "../../Assets/cardEntryIllustration.mp4"
import { Button, Col, Form, Row } from 'react-bootstrap';
const PaymentInterface = () => {
    const videoRef = useRef(null);
    const [paymentDetails, setPaymentDetails] = useState({
        cardHolderName: "",
        cardHolderEmail: "",
        cardNumber: "",
        cvv: "",
        expiry: ""
    });
    const [paymentDetailsError, setPaymentDetailsError] = useState({
        cardHolderName: "",
        cardHolderEmail: "",
        cardNumber: "",
        cvv: "",
        expiry: ""
    });
    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
        }
    };
    useEffect(() => {
        handlePlay()
    }, [])
    const handleOnchange = (event) => {
        const { name, value } = event.target;
        let namePattern = /^[A-Za-z\s]+$/;
        let emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        let cardNumberPattern = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|35[2-8][0-9]{12}|6011[0-9]{12})$/;
        let expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
        let cvvPattern = /^\d{3,4}$/;
        console.log("@@@@@@@@",name,value);
        
        if(name==="cardHolderName"){
            if(namePattern.test(value)){
                setPaymentDetails((prev)=>({
                    ...prev,
                    [name]:value
                }))
                setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:""
                }));
            }else{
                return setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:"Please enter valid name"
                })); 
            }
        }
        if(name==="cardHolderEmail"){
            if(emailPattern.test(value)){
                setPaymentDetails((prev)=>({
                    ...prev,
                    [name]:value
                }))
                setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:""
                }));
            }else{
                return setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:"Please enter valid name"
                })); 
            }
        }
        if(name==="cardNumber"){
            if(cardNumberPattern.test(value)){
                setPaymentDetails((prev)=>({
                    ...prev,
                    [name]:value
                }))
                setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:""
                }));
            }else{
                return setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:"Please enter valid name"
                })); 
            }
        }
        if(name==="cvv"){
            if(cvvPattern.test(value)){
                setPaymentDetails((prev)=>({
                    ...prev,
                    [name]:value
                }))
                setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:""
                }));
            }else{
                return setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:"Please enter valid name"
                })); 
            }
        }
        if(name==="expiry"){
            if(expiryPattern.test(value)){
                setPaymentDetails((prev)=>({
                    ...prev,
                    [name]:value
                }))
                setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:""
                }));
            }else{
                return setPaymentDetailsError((prev)=>({
                    ...prev,
                    [name]:"Please enter valid name"
                })); 
            }
        }
    };
    return (
        <div className='h-[90vh] d-flex justify-content-center align-items-center'>
            <div className='w-[90%] border rounded'>
                <Row>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <div className='h-100 d-flex justify-content-center align-items-center'>
                            <video autoPlay loop muted preload="auto" ref={videoRef} style={{height:"400px",width:"100%"}}>
                                <source src={CardEntryIllustration} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </Col>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <div className='d-flex justify-content-center align-items-center h-100 p-4'>
                            <Form className='w-[100%] p-1'>
                                <Row>
                                    <Col xs={12} sm={12} md={12} lg={12}>
                                        <Form.Group className="mb-3" controlId="formBasicEmail">
                                            <Form.Label className='fw-bold'>Cardholder Name</Form.Label>
                                            <Form.Control type="text" placeholder="Cardholder Name" name={"cardHolderName"} required value={paymentDetails.cardHolderName} onChange={handleOnchange}/>
                                            <Form.Text className='text-danger'>{paymentDetailsError.cardHolderName}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12}>
                                        <Form.Group className="mb-3" controlId="formBasicPassword">
                                            <Form.Label className='fw-bold'>Cardholder Email</Form.Label>
                                            <Form.Control type="email" placeholder="Cardholder Email" name={"cardHolderEmail"} required value={paymentDetails.cardHolderEmail} onChange={handleOnchange}/>
                                            <Form.Text className='text-danger'>{paymentDetailsError.cardHolderEmail}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12}>
                                        <Form.Group className="mb-3" controlId="formBasicPassword">
                                            <Form.Label className='fw-bold'>Card Information</Form.Label>
                                            <Form.Control type="text" placeholder="XXXX XXXX XXXX XXXX" max={16} min={16} name={"cardNumber"} required value={paymentDetails.cardNumber} onChange={handleOnchange}/>
                                            <Form.Text className='text-danger'>{paymentDetailsError.cardNumber}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} sm={6} md={6} lg={6}>
                                        <Form.Group className="mb-3" controlId="formBasicPassword">
                                            <Form.Control type="text" placeholder="MM/YYYY" name={"expiry"} required value={paymentDetails.expiry} onChange={handleOnchange}/>
                                            <Form.Text className='text-danger'>{paymentDetailsError.expiry}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} sm={6} md={6} lg={6}>
                                        <Form.Group className="mb-3" controlId="formBasicPassword">
                                            <Form.Control type="text" placeholder="CVV" name={"cvv"} min={3} maxLength={3} required value={paymentDetails.cvv} onChange={handleOnchange}/>
                                            <Form.Text>{paymentDetailsError.cvv}</Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12}>
                                        <Button className='w-100' style={{ backgroundColor: "#22d3ee",border:"1px solid #22d3ee",color:"#fff" }}>Make Payment</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default PaymentInterface