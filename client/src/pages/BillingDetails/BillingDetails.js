import React, { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner } from 'react-bootstrap';
import { BadgeDollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {  getSingleInvoice, finalizePayment, invoicePDFShow, updateInvoice } from '../../Server';
import moment from 'moment';
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
    const [invoicePdfBlob, setInvoicePdfBlob] = useState("");
    const [paymentFrequency,setPaymentFrequency]=useState(false)
    const [updateInvoiceDataPayload,setUpdateInvoiceDataPayload]=useState({
        charge:0,
        instant_pay:false,
        showUpdateBtn:false
    })
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
        setPaymentFrequency(response?.data?.instant_pay);
        if(response.status===200){
            try {
                let response1 = await invoicePDFShow(response.data.id)
            const blob = new Blob([response1.data], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            setInvoicePdfBlob(blobUrl);
            setScreenLoading(false);
            setUpdateInvoiceDataPayload((prev) => ({
                ...prev,
                instant_pay: response.data.instant_pay,
                charge: response.data.charge,
            }));
            } catch (error) {
                toast.error(error.response.data.error)
                setScreenLoading(false);
            }
            
        }
    };
    const handleInvoice = async(event) => {
        event.preventDefault();
        handleClosesConfirmationModal();
    }
    
    const makeInvoicePayment = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            let payload={
                employee_id:invoiceData?.employee_id,
                invoice_id:invoiceData?.id,
                note:note
            }
            let response = await finalizePayment(payload);
            if(response.data.payout_id){
                toast.success(response.data.message);
                navigate("/clients/payment/success");
            } else if (response.data.redirect_url && authUserState.user.is_admin===false) {
                const link = document.createElement('a');
                link.href = response.data.redirect_url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }else if(response.data.message && response.data.transfer_id){
                toast.success(response.data.message);
                navigate("/clients/payment/success");
            }else if(response.data.message){
                toast.success(response.data.message);
                navigate("/invoices-to-pay");
            }else {
                toast.error(response.data.error)
            }
            setLoading(false);
            handleClosesConfirmationModal();
        } catch (error) {
            setLoading(false)
            toast.error(error.response.data.error);
            handleClosesConfirmationModal();
        }
    };
    const handleClosesConfirmationModal=()=>{
        setShowConfirmationModal(!showConfirmationModal);
        setLoading(false)
    }
    const handlePaymentFrequency=(event)=>{
        if(event.target.value === "Instant Pay"){
            setPaymentFrequency(true)
            setUpdateInvoiceDataPayload((prev)=>({
                ...prev,
                instant_pay:true,
                showUpdateBtn:true
            }))
        }else if(event.target.value==="Default"){
            setPaymentFrequency(false)
            setUpdateInvoiceDataPayload((prev)=>({
                ...prev,
                instant_pay:false,
                showUpdateBtn:true
            }))
        }
    };
    const handleChargeChange = (event) => {
        let { value } = event.target
        setUpdateInvoiceDataPayload((prev) => ({
            ...prev,
            charge: value,
            showUpdateBtn:invoiceData?.charge == updateInvoiceDataPayload?.charge?false:true
        }));
    };
    const updateInvoiceData=async()=>{
        try {
            let response = await updateInvoice(); 
             if(response.status===200){
                await getSingleInvoiceItem();
             }
        } catch (error) {
            toast.error(error.response.data)
        }
    };
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
                            {invoicePdfBlob ? <iframe src={invoicePdfBlob} width="100%" height="100%" title="PDF Viewer"></iframe> : (
                                <>Invoice pdf not found</>
                            )}
                        </Card>
                    </Col>
                    <Col xs={12} sm={12} md={8} lg={8}>
                        <Card className='p-3 h-[50vh] overflow-scroll' style={{ height: "87vh", scrollbarWidth: "none", }}>
                            <p className='text-black text-start fs-5 fw-bold' >Bill Details</p>
                            <div>
                                <Form onSubmit={handleInvoice}>
                                    <Row>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="4" className='text-black-50 fs-6'>Vendor Business Name</Form.Label>
                                                <Form.Control placeholder="Vendor Name" value={invoiceData?.employee.vendor_name} disabled />
                                            </div>
                                        </Col>
                                        <Col xs={6} sm={6} md={6} lg={6}>
                                            <div className='mb-3 '>
                                                <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Bill Amount*</Form.Label>
                                                <InputGroup size='sm'>
                                                    <InputGroup.Text id="basic-addon1">$</InputGroup.Text>
                                                    <Form.Control type='number' placeholder="Bill Amount" value={updateInvoiceDataPayload?.charge} onChange={handleChargeChange} disabled={true}name={"charge"}/>
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
                                            </div>
                                        </Col>
                                        <p className='text-black text-start fw-bold' style={{ fontSize: "18px" }}>Additional Details</p>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div className='mb-3'>
                                                <Form.Label column sm="4" className='text-black-50' style={{ fontSize: "14px" }}>Payment Frequency</Form.Label>
                                                <Form.Select value={paymentFrequency === true ? "One Day Payment" : "Default"} onChange={handlePaymentFrequency} name='instant_pay' disabled={true}>
                                                    <option value={"Instant Pay"}>Instant Pay</option>
                                                    <option value="Default">Default</option>
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
                                                <Form.Control type="date" value={moment(invoiceData?.due_date, "YYYY-MM-DD").format("YYYY-MM-DD")} disabled />
                                            </div>
                                        </Col>
                                        {authUserState.user.is_admin &&
                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <div className='mb-3'>
                                                    <Form.Label column sm="3" className='text-black-50' style={{ fontSize: "14px" }}>Note to self</Form.Label>
                                                    <Form.Control as="textarea" rows={3} onChange={(event) => { setNote(event.target.value) }} />
                                                </div>
                                            </Col>
                                        }
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
                                            return <Row key={index}>
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
                                                    <Button size='sm' variant='outline-secondary' onClick={() => navigate("/invoices-to-pay")}>Cancel</Button>
                                                    {(authUserState.user?.is_admin && !invoiceData?.is_paid && (invoiceData?.payment_status === "pending" || invoiceData?.payment_status === null)) && <Button size='sm' type='submit' style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }}>Save & Pay</Button>}
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
                        <p className="text-muted">
                        The payment order for your invoice ID 48 is ready to be processed. The product's details are provided here, and you will receive an email confirming payment completion as soon as it is completed.
                        </p>
                        <div className="border p-3 rounded mb-3">
                            <div className="d-flex justify-content-between">
                                <span>Order Review</span>
                                <span>${invoiceData?.charge}</span>
                            </div>
                            <small className="text-muted">{invoiceData?.products_hash?.products.length} product(s) in this invoice</small>
                        </div>
                        <div className="d-flex justify-content-between">
                            <Button variant="light" onClick={handleClosesConfirmationModal}>
                                Cancel
                            </Button>
                            <Button variant="dark" onClick={makeInvoicePayment} disabled={loading}>
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