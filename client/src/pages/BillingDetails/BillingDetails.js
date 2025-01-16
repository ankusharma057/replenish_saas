import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { BadgeDollarSign, Trash } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {  getSingleInvoice, finalizePayment } from '../../Server';
import moment from 'moment';
import { Document, Page } from 'react-pdf';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../context/AuthUserContext';
const BillingDetails = () => {
    const { authUserState } = useAuthContext();
    const navigate = useNavigate();
    const { invoice_id } = useParams();
    const [invoiceData, setInvoiceData] = useState();
    const [screenLoading, setScreenLoading] = useState(false)
    const [loading, setLoading] = useState(false)    
    const [showConfirmationModal,setShowConfirmationModal]=useState(false)
    const [note, setNote] = useState("");
    useEffect(() => {
        getSingleInvoiceItem()
    }, [invoice_id])
    const getSingleInvoiceItem = async () => {
        setScreenLoading(true)
        let response = await getSingleInvoice(invoice_id);
        response.data = {
            ...response.data,
            created_at: moment(response.data.created_at).format("YYYY-MM-DD")
        }
        setInvoiceData(response.data);
        setScreenLoading(false);
    };
    const handleInvoice = async(event) => {
        event.preventDefault();
        handleClosesConfirmationModal();
    }
    
    const submitStep3 = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            let payload={
                employee_id:authUserState.user.id,
                invoice_id:invoiceData.id,
                note:note
            }
            let response = await finalizePayment(payload);
            if(response.data.payout_id){
                toast.success(response.data.message);
                setLoading(false)
                navigate("/clients/payment/success");
                handleClosesConfirmationModal();
            } else if (response.data.redirect_url) {
                const link = document.createElement('a');
                link.href = response.data.redirect_url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            toast.error(error.response.data.error)
        }
    };
    const handleClosesConfirmationModal=()=>{
        setShowConfirmationModal(!showConfirmationModal);
        setLoading(false)
    }
    const ScreenLoading = () => {
        return <div style={{ width: "100%", height: "87vh", position: "absolute", zIndex: 9, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
            <Spinner animation="border" variant="info" />
        </div>
    }
    return (
        <div className='p-2'>
            {screenLoading && <ScreenLoading />}
            <div>
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
                                                <Form.Control placeholder="Vendor Name" value={invoiceData?.vendor_name} disabled />
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3 '>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Bill Amount*</Form.Label>
                                                <InputGroup>
                                                    <Form.Control placeholder="Bill Amount" value={"$" + invoiceData?.charge} disabled />
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
                                                <Form.Control type="text" value={invoiceData?.invoice?.instant_pay ===true  ? "One Day payment":"Default"} disabled />
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
                                                <Form.Control as="textarea" rows={3} onChange={(event) => { setNote(event.target.value ) }} />
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
                                        {invoiceData?.products_hash.products.map((product,index) => {
                                            return <Row>
                                                <Col xs={1} sm={1} md={1} lg={1}>
                                                    <div className='mb-3 d-flex justify-content-center'>
                                                        <Form.Label column sm="3" className='text-black fs-6'>{index+1}</Form.Label>
                                                    </div>
                                                </Col>
                                                <Col xs={5} sm={5} md={5} lg={5}>
                                                    <div className='mb-3'>
                                                        <Form.Control type="text" placeholder='e.g office expence' value={product[0]} disabled/>
                                                    </div>
                                                </Col>
                                                <Col xs={5} sm={5} md={5} lg={5}>
                                                    <div className='mb-3'>
                                                        <Form.Control type="text" placeholder='e.g office expence' value={"$"+product[2]} disabled/>
                                                    </div>
                                                </Col>
                                                <Col xs={1} sm={1} md={1} lg={1}>
                                                </Col>
                                            </Row>
                                        })}
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
            <div>    
                <Modal show={showConfirmationModal} onHide={handleClosesConfirmationModal} centered>
                    <Modal.Body className="text-center p-4">
                        <h2 className="fw-bold mb-1">Please Confirm your payment</h2>
                        <p className="text-muted">Proceed to Complete Your Payment</p>
                        <div className="my-4">
                            <BadgeDollarSign style={{ marginRight: '8px', margin: "auto" }} size={40} />
                        </div>
                        <h5 className="fw-bold mt-3">Thanks a lot for putting up this order</h5>
                        <p className="text-muted">
                            Your payment order for invoice id{" "}<strong>{invoiceData?.id}</strong> has been
                            ready to proceed. You’ll find all the details about your order below, and
                            we’ll send you a payment confirmation email as soon as your payment
                            done.
                        </p>
                        <div className="border p-3 rounded mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Order Review</span>
                                <span>${invoiceData?.charge}</span>
                            </div>
                            <small className="text-muted">{invoiceData?.products_hash?.products.length} products in this invoice</small>
                        </div>
                        <div className="d-flex justify-content-between">
                            <Button variant="light" onClick={handleClosesConfirmationModal}>
                                Cancel
                            </Button>
                            <Button variant="dark" onClick={submitStep3} disabled={loading}>
                                Confirm Payment {loading &&<Spinner animation="border" variant="white" style={{width:"15px",height:"15px"}}/>}
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </div>
    )
}

export default BillingDetails