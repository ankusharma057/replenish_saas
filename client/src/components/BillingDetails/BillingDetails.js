import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import { Trash } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { getSingleInvoice, invoiceACHConfirmMicroDeposit, invoiceACHCreateSetupIntent, invoiceACHVerification } from '../../Server';
import moment from 'moment';
import { Document, Page } from 'react-pdf';
const BillingDetails = () => {
    const { invoice_id } = useParams();
    const [invoiceData, setInvoiceData] = useState();
    const [openPaymentModal, setOpenPaymentModal] = useState(false)
    const [paymentSteps, setPaymentSteps] = useState(2)
    const [setupIntentId,setSetupIntentId]=useState("")
    const [paymentStep1Data, setPaymentStep1Data] = useState({
        account_number: "",
        routing_number: "",
        account_holder_type: "",
        name: "",
    });
    const [paymentStep2Data, setPaymentStep2Data] = useState({
        "setup_intent_id": setupIntentId,
        "deposit_amounts": [0, 0],
        "client_id": invoiceData?.client_id
    });
    const [paymentStep1Error, setPaymentStep1Error] = useState({
        account_number: "",
        routing_number: "",
        account_holder_type: "",
        name: "",
    });
    useEffect(() => {
        getSingleInvoiceItem() 
    }, [invoice_id])
    const getSingleInvoiceItem = async () => {
        let response = await getSingleInvoice(invoice_id);
        response.data = {
            ...response.data,
            created_at: moment(response.data.created_at).format("YYYY-MM-DD")
        }
        console.log("@@@@@@response",response.data);
        
        setInvoiceData(response.data);
    };
    const handleInvoice = (event) => {
        event.preventDefault()
        handlePaymentSteps(1)
        handlePaymentModal();
    }
    const handlePaymentSteps = (step) => {
        setPaymentSteps(step);
    }
    const validateInput = (name, value) => {
        let error = "";
        switch (name) {
            case "account_number":
                if (!/^\d{10,12}$/.test(value)) {
                    error = "Account Number must be 10-12 digits.";
                }
                break;
            case "routing_number":
                if (!/^\d{9}$/.test(value)) {
                    error = "Routing Number must be exactly 9 digits.";
                }
                break;
            case "account_holder_type":
                if (!value) {
                    error = "Account Type is required.";
                }
                break;
            case "name":
                if (!/^[a-zA-Z\s]+$/.test(value)) {
                    error = "Name can only contain letters.";
                }
                break;
            default:
                break;
        }
        setPaymentStep1Error((prev) => ({ ...prev, [name]: error }));
    };
    const handlePaymentModal = () => {
        setOpenPaymentModal(!openPaymentModal)
    }
    const handleStep1Change = (event) => {
        setOpenPaymentModal(true)
        const { name, value } = event.target;
        setPaymentStep1Data((prev) => ({
            ...prev,
            [name]: value
        }))
    };
    const submitStep1 = async(event) => {
        event.preventDefault()
        let payload = {
            "payment_method_data": {
                "us_bank_account": {
                    "account_number": paymentStep1Data.account_number,
                    "routing_number": paymentStep1Data.routing_number,
                    "account_holder_type": paymentStep1Data.account_holder_type
                },
                "billing_details": {
                    "name": paymentStep1Data.name
                }
            }

        }
        let response=await invoiceACHVerification(payload);
        let payload1 = {
            "payment_method_id": response.paymentMethodId
          }
        let response1 = await invoiceACHCreateSetupIntent(payload1)
    };
    const submitStep2 = async(event) => {
        event.preventDefault()
        let response = await invoiceACHConfirmMicroDeposit(paymentStep2Data)
    };
    const submitStep3 = async(event) => {
        event.preventDefault()
        let payload = {
            "payment_method_id": setupIntentId
          }
          let response = await invoiceACHCreateSetupIntent(payload)
    };
    const ACHPaymentStep1 = () => {
        return <Form onSubmit={submitStep1}>
            <Row>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Account Number</Form.Label>
                        <Form.Control type="number" name='account_number' required onChange={handleStep1Change} value={paymentStep1Data.account_number} isValid={!!paymentStep1Error.account_number} />
                        <Form.Control.Feedback type="invalid">{paymentStep1Error.account_number}</Form.Control.Feedback>
                    </div>
                </Col>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Routing Number</Form.Label>
                        <Form.Control type="number" name='routing_number' required onChange={handleStep1Change} value={paymentStep1Data.routing_number} isValid={!!paymentStep1Error.routing_number} />
                        <Form.Control.Feedback type="invalid">{paymentStep1Error.routing_number}</Form.Control.Feedback>
                    </div>
                </Col>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="4" className='text-black-50' style={{ fontSize: "14px" }}>Account Holder Type</Form.Label>
                        <Form.Select aria-label="Default select example" name='account_holder_type' required onChange={handleStep1Change} value={paymentStep1Data.account_holder_type} isValid={!!paymentStep1Error.account_holder_type}>
                            <option>Select Account Type</option>
                            <option value="business">Business</option>
                            <option value="individual">Individual</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">{paymentStep1Error.account_holder_type}</Form.Control.Feedback>
                    </div>
                </Col>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="5" className='text-black-50' style={{ fontSize: "14px" }}>Account Holder Name</Form.Label>
                        <Form.Control type="text" required name='name' onChange={handleStep1Change} value={paymentStep1Data.payment_method_data?.name} isValid={!!paymentStep1Error.name} />
                        <Form.Control.Feedback type="invalid">{paymentStep1Error.name}</Form.Control.Feedback>
                    </div>
                </Col>
                <Col xs={12}>
                    <div className='mt-3'>
                        <Button type='submit' size='sm' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} className='w-100'>Submit Bank Account Details</Button>
                    </div>
                </Col>
            </Row>
        </Form>
    }
    const ACHPaymentStep2 = () => {
        return <Form onSubmit={submitStep2}>
            <Form.Label>Enter the two micro deposit amounts to verify your bank account</Form.Label>
            <Row>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="5" className='text-black-50' style={{ fontSize: "14px" }}>Account 1 (in cents)</Form.Label>
                        <Form.Control type="number" required value={paymentStep2Data[0]} onChange={(event) => { setPaymentStep2Data((prev) => ({ ...prev, deposit_amounts: [event.target.value, paymentStep2Data.deposit_amounts[1]] })) }} />
                    </div>
                </Col>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="5" className='text-black-50' style={{ fontSize: "14px" }}>Account 2 (in cents) </Form.Label>
                        <Form.Control type="number" required value={paymentStep2Data[1]} onChange={(event) => { setPaymentStep2Data((prev) => ({ ...prev, deposit_amounts: [paymentStep2Data.deposit_amounts[0], event.target.value] })) }} />
                    </div>
                </Col>
                <Col xs={12}>
                    <div className='mt-3'>
                        <Button size='sm' type='submit' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} className='w-100'>Verify Amount</Button>
                    </div>
                </Col>
            </Row>
        </Form>
    }
    const ACHPaymentStep3 = () => {
        return <Form onSubmit={submitStep3}>
            <Form.Label>Enter the two micro deposit amounts to verify your bank account</Form.Label>
            <Row>
                <Col xs={12}>
                    <div>
                        <Form.Label column sm="5" className='text-black-50' style={{ fontSize: "14px" }}>Payment Amount*($)</Form.Label>
                        <Form.Control type="number" required />
                    </div>
                </Col>
                <Col xs={12}>
                    <div className='mt-3'>
                        <Button size='sm' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} className='w-100'>Process Payment</Button>
                    </div>
                </Col>
            </Row>
        </Form>
    }
    const ACHPaymentsModal = () => {
        return <div>
            <Modal show={openPaymentModal} onHide={handlePaymentModal}>
                <Modal.Header closeButton>
                    <div>
                        <Modal.Title>ACH Account Verification</Modal.Title>
                        <Form.Text>Complete the steps to verify your bank account & make a payment</Form.Text>
                    </div>
                </Modal.Header>
                <Modal.Body>
                    <ACHPaymentStep2 />
                    {/* {paymentSteps === 1 && <ACHPaymentStep1 />} */}
                    {/* {paymentSteps === 2 && <ACHPaymentStep2 />} */}
                    {/* {paymentSteps === 3 && <ACHPaymentStep3 />} */}
                </Modal.Body>

            </Modal>
        </div>
    }
    return (
        <div className='p-2'>
            <ACHPaymentsModal />
            <div >
                <Row>
                    <Col xs={12} sm={12} md={4} lg={4}>
                        <Card className='p-3 overflow-scroll' style={{ height: "87vh", scrollbarWidth: "none", }}>
                            {/* <Document file={invoiceData?.pdf_url}>
                                <Page pageNumber={1} />
                            </Document> */}
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={8}>
                        <Card className='p-3 h-[50vh] overflow-scroll' style={{ height: "87vh", scrollbarWidth: "none", }}>
                            <p className='text-black text-start fs-5 fw-bold' >Bill details</p>
                            <div>
                                <Form onSubmit={handleInvoice}>
                                    <Row>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="4" className='text-black-50 fs-6'>Vendor Business Name</Form.Label>
                                                <Form.Select aria-label="Default select example">
                                                    <option>Open this select menu</option>
                                                    <option value="1">One</option>
                                                    <option value="2">Two</option>
                                                    <option value="3">Three</option>
                                                </Form.Select>
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3 '>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Bill Amount*</Form.Label>
                                                <InputGroup>
                                                    <Form.Control placeholder="Recipient's username" value={"$" + invoiceData?.charge} disabled />
                                                    <InputGroup.Text id="basic-addon2">
                                                        <Button disabled variant="Secondary" size='sm' className='d-flex align-items-center gap-[5px] border-0'><img src={"https://cdn-icons-png.flaticon.com/512/197/197484.png"} className='w-[10px] h-[10px]' alt='country_flag' />USD</Button>
                                                    </InputGroup.Text>
                                                </InputGroup>
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Invoice#</Form.Label>
                                                <Form.Control type="number" value={invoiceData?.id} disabled />
                                                <Form.Text>Add an invoice number to help your vendor reconcile payments</Form.Text>
                                            </div>
                                        </Col>
                                        <p className='text-black text-start fw-bold' style={{ fontSize: "18px" }}>Additional details</p>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="4" className='text-black-50' style={{ fontSize: "14px" }}>Payment Frequency</Form.Label>
                                                <Form.Select aria-label="Default select example">
                                                    <option>Open this select menu</option>
                                                    <option value="1">One</option>
                                                    <option value="2">Two</option>
                                                    <option value="3">Three</option>
                                                </Form.Select>
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Invoice Date</Form.Label>
                                                <Form.Control type="date" value={moment(invoiceData?.created_at).format("YYYY-MM-DD")} disabled />
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Due Date</Form.Label>
                                                <Form.Control type="date" value={moment(invoiceData?.date_of_service, "YYYY-MM-DD").format("YYYY-MM-DD")} disabled />
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Note to sell</Form.Label>
                                                <Form.Control as="textarea" rows={3} onChange={(event) => { setInvoiceData((prev) => ({ ...prev, note: event.target.value })) }} />
                                            </div>
                                        </Col>
                                        <p className='text-black text-start fw-bold' style={{ fontSize: "18px" }}>Line Items</p>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Alert variant={"light"} className='p-2'>
                                                    <Row>
                                                        <Col xs={1} sm={1} md={1} lg={1}>
                                                            <div className='mb-3'>
                                                            </div>
                                                        </Col>
                                                        <Col xs={5} sm={5} md={5} lg={5}>
                                                            <div>
                                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Description</Form.Label>
                                                            </div>
                                                        </Col>
                                                        <Col xs={5} sm={5} md={5} lg={5}>
                                                            <div>
                                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Amount</Form.Label>
                                                            </div>
                                                        </Col>
                                                        <Col xs={1} sm={1} md={1} lg={1}>
                                                            <div className='mb-3'>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Alert>
                                            </div>
                                        </Col>
                                        <Col xs={1} sm={1} md={1} lg={1}>
                                            <div className='mb-3 d-flex justify-content-center'>
                                                <Form.Label column sm="3" className='text-black fs-6'>1</Form.Label>
                                            </div>
                                        </Col>
                                        <Col xs={5} sm={5} md={5} lg={5}>
                                            <div className='mb-3'>
                                                <Form.Control type="text" placeholder='e.g office expence' />
                                            </div>
                                        </Col>
                                        <Col xs={5} sm={5} md={5} lg={5}>
                                            <div className='mb-3'>
                                                <Form.Control type="text" placeholder='e.g office expence' />
                                            </div>
                                        </Col>
                                        <Col xs={1} sm={1} md={1} lg={1}>
                                            <div className='mb-3'>
                                                <Trash color='red' className='mt-2' />
                                            </div>
                                        </Col>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='d-flex justify-content-end gap-[20px]'>
                                                <Button size='sm' variant='outline-secondary'>Cancel</Button>
                                                <Button size='sm' type='submit' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }}>Save & Pay</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    )
}

export default BillingDetails