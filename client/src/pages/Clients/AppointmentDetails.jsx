import React, { useEffect, useReducer, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Container, Dropdown, Form, InputGroup, ListGroup, Offcanvas, Row } from 'react-bootstrap';
import { ChevronDown, MoreHorizontal, Pencil, Check, Smartphone, Trash2, Star, CreditCard, ChevronUp, Plus, XCircle, PlusCircle, Search, UserRound, ChevronRight, ChevronsRight, Mail, Phone, CalendarRange } from "lucide-react";
import moment from 'moment';
import { Collapse, Select } from '@mui/material';
import { AddNoteToAppointment, DeleteAppointmentNote, getEmployeesList, UpdateAppointment, UpdateAppointmentNote, GetAppointmentDetails, deleteAppointmentEmployee } from "../../Server/index"
import { toast } from 'react-toastify';
import { FaStar } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AppointmentDetails = ({ appointmentDetails, showAppointmentSidebar, handleShowAppointmentSidebar }) => {
    const [bookingInfo, setBookingInfo] = useState(true);
    const [notesInfo, setNotesInfo] = useState(false);
    const [appointmentDone, setAppointmentDone] = useState(false);
    const [showNotesMenu, setShowNotesMenu] = useState(false);
    const [showNotesMenuId, setShowNotesMenuId] = useState(null);
    const [billingInfo, setBillingInfo] = useState(false);
    const [addItem, setAddItem] = useState(false);
    const [addAdjustment, setAddAdjustment] = useState(false);
    const [returnVisitReminder, setReturnVisitReminder] = useState(false);
    const [historyAndStatus, setHistoryAndStatus] = useState(false);
    const [editAppointment, setEditAppointment] = useState(false);
    const [noteValue, setNoteValue] = useState("");
    const [noteValueButtons, setNoteValueButtons] = useState(false);
    const [dueDate, setDueDate] = useState("");
    const [noteSwitch, setNoteSwitch] = useState(false);
    const [employeeList, setEmployeeList] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [enableEdit, setEnableEdit] = useState(false);
    const [noteList, setNoteList] = useState();
    const [appointmentDetailsResponse, setAppointmentDetailsResponse] = useState();
    const [showEditNoteForm, setShowEditNoteForm] = useState(false);
    const [apiResponseStatus, setApiResponseStatus] = useState(false);
    const [appointmentResponse, setAppointmentResponse] = useState(false);

    useEffect(() => {
        getEmployeeList();
        if (appointmentDetails?.id) {
            getAppointmentDetails(appointmentDetails?.id);
        }
    }, [appointmentDetails.id,apiResponseStatus])
    const getAppointmentDetails = async (appointmentDetailsId) => {
        let response = await GetAppointmentDetails(`${appointmentDetailsId}`, true);
        if (response?.data?.notes !== noteList || response?.data !== appointmentDetailsResponse) {
            setNoteList(response?.data?.notes);
            setAppointmentDetailsResponse(response?.data);            
        }
    };
    const getEmployeeList = async () => {
        let employees = await getEmployeesList();
        setEmployeeList(employees.data);
    };
    const handleBookingInfo = () => {
        setBookingInfo((prev) => !prev);
    };
    const handleNotesInfo = () => {
        setNotesInfo((prev) => !prev);
    };
    const handleAppointmentDone = () => {
        setAppointmentDone((prev) => !prev);
    };
    const handleNotesMenu = (noteId) => {
        setShowNotesMenu((prev) => !prev);
        setShowNotesMenuId(noteId);
    };
    const handleBillingInfo = () => {
        setBillingInfo((prev) => !prev);
    };
    const handleAddItem = () => {
        setAddItem((prev) => !prev);
    };
    const handleAddAdjustment = () => {
        setAddAdjustment((prev) => !prev);
    };
    const handleReturnVisitReminder = () => {
        setReturnVisitReminder((prev) => !prev);
    };
    const handleHistoryAndStatus = () => {
        setHistoryAndStatus((prev) => !prev);
    };
    const handleEditAppointment = () => {
        setEditAppointment((prev) => !prev);
    };
    const handleFavorite = () => {
        setFavorite(!favorite)
    };
    const handleNoteChange = (event) => {
        setNoteValue(event.target.value)
    };
    const handleDueDate = (date) => {
        const selectedDate = date
        setDueDate(selectedDate);
    };
    const handleEmployeeChange = async (event) => {
        let employee = await employeeList.find((item) => item.name === event.target.value);
        if (employee) {
            setEmployeeName(employee?.name)
            setEmployeeId(employee?.id);
        }
    };
    const addNoteToAppointment = async (type) => {
        let payload = {
            "employee_id": employeeId,
            "due_date": dueDate,
            "content": noteValue,
            "schedule_id": appointmentDetails?.schedule?.id,
            "favorite": favorite,
            "appointmentId": appointmentDetails?.id,
        }
        let apiResponse
        if (type === "appointmentUpdate") {
            let response = await UpdateAppointment(payload);
            apiResponse = response;
        } else {
            let response = await AddNoteToAppointment(payload);
            apiResponse = response;
        }
        if (apiResponse.status === 201 || apiResponse.status === 200) {
            setDueDate("");
            setNoteValue("");
            setFavorite(false);
            setEmployeeId("");
            setEditAppointment(false);
            setNoteSwitch(false);
            setApiResponseStatus(true);
            if ((apiResponse.status === 201 || apiResponse.status === 200) && appointmentDetails?.id) {
                getAppointmentDetails(appointmentDetails?.id);
            }
            toast.success("Note added successfully")
        } else {
            toast.error("Something gone wrong")
        }
    };
    const handleUpdateNote = async (newEmployeeId, newDueDate, newNoteValue, newFavorite, newNoteId) => {
        let payload = {
            "employee_id": newEmployeeId,
            "due_date": newDueDate,
            "content": newNoteValue,
            "schedule_id": appointmentDetails.schedule.id,
            "favorite": newFavorite,
            "appointmentId": appointmentDetails?.id,
            "note_id": newNoteId
        }
        let apiResponse
        let response = await UpdateAppointmentNote(payload);
        apiResponse = response;
        console.log("apiResponse", apiResponse);
        if (apiResponse.status === 200) {
            setShowNotesMenuId(null);
            setShowEditNoteForm(false);
            if (appointmentDetails?.id) {
                await getAppointmentDetails(appointmentDetails?.id);
                toast.success(response.data.message);
            }
            toast.success(apiResponse.data.message)
        } else {
            toast.error(apiResponse.data.message)
        }
    };
    const handleEditNoteForm = () => {
        setShowEditNoteForm(true)
    };
    const handleCloseEditNoteForm = () => {
        setShowEditNoteForm(false);
        setShowNotesMenuId(null);
    };
    const handleNoteOperations = async (type, newFavorite, note_id) => {
        let payload = {
            "favorite": newFavorite,
            "schedule_id": appointmentDetails?.schedule.id,
            "note_id": note_id
        }
            let response;
            if (type === "favorite") {
                response = await UpdateAppointmentNote(payload);
            } else if (type === "delete") {
                response = await DeleteAppointmentNote(payload)
            } else if (type === "done" || type === "Nill") {
                console.log("@@@@@@type",type);
                
                payload = {
                    ...payload,
                    updated_at: type === "done" ? new Date() : type === "Nill" && "nill"
                }
                response = await UpdateAppointmentNote(payload);
            }
            if (response.status === 200 || response.status === 201) {
                setShowNotesMenu(false)
                setShowNotesMenuId(null)
                setApiResponseStatus(true);
                if (appointmentDetails?.id) {
                    await getAppointmentDetails(appointmentDetails?.id);
                    toast.success(response.data.message);
                }
            } else {
                toast.error(response.data.message)
            }
    };
    const formatDateTime=(dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        return new Intl.DateTimeFormat('en-US', options).format(date).replace(',', ' -');
    };
    const renderProductNames = (products) => {
        return products.map((product, index) => (
            <span key={product.id}>
                {product.name}{index < products.length - 1 ? ', ' : ''}
            </span>
        ));
    };
    const handleCancelAppointment=async()=>{
        let response = await deleteAppointmentEmployee(appointmentDetails.id);
        if(response.status===200 || response.status===201){
            toast.success(response.data.message);
            handleShowAppointmentSidebar();
        }else{
            toast.error(response.data.message);
        }
    };
    return (
        <div>
            <Offcanvas show={showAppointmentSidebar} onHide={handleShowAppointmentSidebar} className="bg-gray-100" placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Appointment</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {
                        editAppointment ?
                            <EditAppointment appointmentDetails={appointmentDetails} handleEditAppointment={handleEditAppointment} noteValue={noteValue} handleNoteChange={handleNoteChange} addNoteToAppointment={addNoteToAppointment} /> : <>
                                <div className="bg-light d-flex justify-content-between">
                                    <div className="btn-group border" role="group">
                                        <button type="button" className="btn border">Arrive</button>
                                        <button type="button" className="btn border">No Show</button>
                                    </div>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="secondary">Pay</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                                            <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="mt-4">
                                    <Button variant="outline-secondary" className="w-100">View In Schedule</Button>
                                </div>
                                <div className="mt-2">
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center' onClick={handleBookingInfo}>
                                            <p className='fs-6 mb-0' style={{ color: '#22d3ee' }}>Booking Info</p>
                                            <p className='mb-0'>
                                                {bookingInfo
                                                    ?
                                                    <ChevronUp color="#22d3ee" size={25} /> :
                                                    <ChevronDown color="#22d3ee" size={25} />
                                                }
                                            </p>
                                        </div>
                                        <Collapse in={bookingInfo}>
                                            <div className='  p-3' in={bookingInfo}>
                                                <div>
                                                    <div className="text-dark" style={{ fontSize: "13px", fontWeight: 700 }}>{appointmentDetailsResponse?.client?.name}{" "}{appointmentDetailsResponse?.client?.last_name}</div>
                                                    <div className="text-dark d-flex align-items-center" style={{ fontSize: "13px" }}>
                                                        <Smartphone size={14} />{appointmentDetailsResponse?.client?.phone_number}
                                                    </div>
                                                    <div className='' style={{ color: '#22d3ee', fontSize: "13px" }}>{appointmentDetailsResponse?.client?.email}</div>
                                                    <div className='d-flex align-items-center'>
                                                        <div><CreditCard size={14} /></div>
                                                        <div className='text-dark' style={{ fontSize: "13px" }}>Booking Info</div>
                                                    </div>
                                                    <div>
                                                        <Container>
                                                            <Row>
                                                                <Col xs={12} sm={6} md={6} lg={6} className="p-0">
                                                                    <div className="" style={{ fontSize: "13px" }}>Account Owing</div>
                                                                </Col>
                                                                <Col xs={12} sm={6} md={6} lg={6} className="p-0  d-flex justify-content-end">
                                                                    <div className="" style={{ fontSize: "13px" }}>${appointmentDetailsResponse?.remaining_amount}</div>
                                                                </Col>
                                                                <Col xs={12} sm={6} md={6} lg={6} className="p-0">
                                                                    <div className="" style={{ fontSize: "13px" }}>Account Credit</div>
                                                                </Col>
                                                                <Col xs={12} sm={6} md={6} lg={6} className="p-0 d-flex justify-content-end">
                                                                    <div className="" style={{ fontSize: "13px" }}>${appointmentDetailsResponse?.paid_amount}</div>
                                                                </Col>
                                                            </Row>
                                                        </Container>
                                                    </div>
                                                </div>
                                                <hr className='my-1' />
                                                <div>
                                                    <div className="text-dark" style={{ fontSize: "13px" }}>{moment(appointmentDetails?.date).format('MMMM DD, YYYY')}</div>
                                                    <div className="text-dark" style={{ fontSize: "13px" }}>{moment(appointmentDetails?.start_time).format("hh:mma")} - {moment(appointmentDetails?.end_time).format("hh:mma")}</div>
                                                    <div className="text-dark" style={{ fontSize: "13px" }}>{appointmentDetails?.employee?.name}</div>
                                                </div>
                                                <hr className='my-1' />
                                                <div className='d-flex justify-content-between align-center'>
                                                    <div>
                                                        <div className="text-dark" style={{ fontSize: "13px" }}>{renderProductNames}{" "}${appointmentDetailsResponse?.products?.reduce((sum, product) => sum + product.cost_price, 0)}</div>

                                                        <div className="text-dark" style={{ fontSize: "13px" }}>{appointmentDetails?.employee?.name}</div>
                                                    </div>
                                                    <div>
                                                        <div className='d-flex justify-content-center align-items-center w-[35px] h-[35px] rounded-circle' style={{ backgroundColor: "#ededed" }} onClick={handleEditAppointment}>
                                                            <Pencil size={16} />
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className='d-flex justify-content-between align-center mt-2'>
                                                    <div>
                                                        <ButtonGroup size='sm' aria-label="Basic example">
                                                            <Button variant="outline-secondary">Copy</Button>
                                                            <Button variant="outline-secondary">Move</Button>
                                                            <Button variant="outline-secondary"><ChevronsRight /></Button>
                                                        </ButtonGroup>
                                                    </div>
                                                    <div>
                                                        <Dropdown>
                                                            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic" size='sm'>
                                                                Cancel/Delete
                                                            </Dropdown.Toggle>
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item href="#/action-1" onClick={handleCancelAppointment}>
                                                                    <p className='mb-1' style={{ color: "#A9A9A9", fontSize: "12px" }}>Cancel with Notifications</p>
                                                                    <p className='mb-0' style={{ fontSize: "14px" }}>Cancel Appointment</p>
                                                                </Dropdown.Item>
                                                                <Dropdown.Divider />
                                                                <Dropdown.Item href="#/action-2">
                                                                    <p className='cursor-pointer mb-1' style={{ color: "#A9A9A9", fontSize: "12px" }}>Without Notifications</p>
                                                                    <p className='cursor-pointer mb-0 text-danger d-flex align-items-center justify-content-start' style={{ fontSize: "14px" }}><Trash2 size={15} />Delete Appointment</p>
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown>
                                                    </div>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center' onClick={handleNotesInfo}>
                                            <p className='fs-6 mb-0' style={{ color: '#22d3ee' }}>Notes</p>
                                            <p className='mb-0'>
                                                {notesInfo
                                                    ?
                                                    <ChevronUp color="#22d3ee" size={25} /> :
                                                    <ChevronDown color="#22d3ee" size={25} />
                                                }
                                            </p>
                                        </div>
                                        <Collapse in={notesInfo}>
                                            <div in={notesInfo}>
                                                {noteValueButtons &&
                                                    <div className='d-flex justify-content-end align-items-center mb-3 gap-[10px]'>
                                                        {
                                                            favorite ? <FaStar onClick={handleFavorite} color='gold' /> :
                                                                <FaRegStar onClick={handleFavorite} />
                                                        }
                                                        <Form.Check
                                                            type="switch"
                                                            id="custom-switch"
                                                            onChange={(e) => {
                                                                setNoteSwitch((prev) => !prev)
                                                            }}
                                                        />
                                                    </div>
                                                }
                                                <div>
                                                    {noteSwitch ? <div className='mb-3'>
                                                        <Form>
                                                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                                <Form.Control onFocus={() => setNoteValueButtons(true)} as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={noteValue} />
                                                            </Form.Group>
                                                        </Form>
                                                        <InputGroup className="mb-3" fullWidth>
                                                            <InputGroup.Text>
                                                                <CalendarRange style={{ color: '#888' }} />
                                                            </InputGroup.Text>
                                                            <DatePicker
                                                            className='w-[86%]'
                                                                selected={dueDate}
                                                                onChange={handleDueDate}
                                                                dateFormat="yyyy/mm/dd"
                                                                customInput={
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Select date"
                                                                        value={
                                                                            dueDate
                                                                                ? `${dueDate.getDate().toString().padStart(2, "0")}/${(
                                                                                    dueDate.getMonth() + 1
                                                                                )
                                                                                    .toString()
                                                                                    .padStart(2, "0")}/${dueDate.getFullYear()}`
                                                                                : ""
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        </InputGroup>
                                                        <Form.Select aria-label="Default select example" value={employeeName} fullWidth onChange={handleEmployeeChange}>
                                                            <option>Select a employee</option>
                                                            {
                                                                employeeList.map((item) => {
                                                                    return <option value={item.name}>{item.name}</option>
                                                                })
                                                            }
                                                        </Form.Select>
                                                    </div> :
                                                        <Form>
                                                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                                <Form.Control onFocus={() => setNoteValueButtons(true)} as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={noteValue} />
                                                            </Form.Group>
                                                        </Form>
                                                    }
                                                </div>
                                                {noteValueButtons &&
                                                    <div className='d-flex justify-content-end align-items-center gap-[10px]'>
                                                        <Button variant='outline-secondary' onClick={() => { setNoteValue(""); setNoteValueButtons(false); }}>Close</Button>
                                                        <Button style={{ backgroundColor: "#22d3ee", opacity: !noteValue && 0.2 }} disabled={noteValue ? false : true} onClick={() => addNoteToAppointment("createNote")}>Add</Button>
                                                    </div>}
                                                {enableEdit ?
                                                    <div className='mb-3'>
                                                        <Form>
                                                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                                                <Form.Control onFocus={() => setNoteValueButtons(true)} as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={noteValue} />
                                                            </Form.Group>
                                                        </Form>
                                                        <InputGroup className="mb-3" fullWidth>
                                                            <InputGroup.Text>
                                                                <CalendarRange style={{ color: '#888' }} />
                                                            </InputGroup.Text>
                                                            <DatePicker
                                                            className='w-[86%]'
                                                                selected={dueDate}
                                                                onChange={handleDueDate}
                                                                dateFormat="yyyy/mm/dd"
                                                                customInput={
                                                                    <Form.Control
                                                                        type="text"
                                                                        placeholder="Select date"
                                                                        value={
                                                                            dueDate
                                                                                ? `${dueDate.getDate().toString().padStart(2, "0")}/${(
                                                                                    dueDate.getMonth() + 1
                                                                                )
                                                                                    .toString()
                                                                                    .padStart(2, "0")}/${dueDate.getFullYear()}`
                                                                                : ""
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                        </InputGroup>
                                                        <Form.Select aria-label="Default select example" value={employeeName} fullWidth onChange={handleEmployeeChange} data-testId={"employeSelect"}>
                                                            <option>Select a employee</option>
                                                            {
                                                                employeeList.map((item) => {
                                                                    return <option value={item.name}>{item.name}</option>
                                                                })
                                                            }
                                                        </Form.Select>
                                                    </div>
                                                    : <>
                                                        {Array.isArray(noteList) && noteList.map((item) => {
                                                            return <>
                                                                {showEditNoteForm && item?.id === showNotesMenuId ?
                                                                    <EditAppointmentNote noteDetails={item} editEmployeeList={employeeList} handleEditNoteSubmit={handleUpdateNote} handleCloseEditNoteForm={handleCloseEditNoteForm} /> :
                                                                    <>
                                                                        <div className='d-flex justify-content-between align-items-center'>
                                                                            <div className='d-flex gap-[20px] align-items-center'>
                                                                                <div>
                                                                                    {
                                                                                        item?.updated_at && item?.updated_at !== "nill" ?
                                                                                            <div className='d-flex justify-content-center align-items-center w-[30px] h-[30px] rounded-circle border border-secondary' onClick={()=>handleNoteOperations("Nill",item.favorite,item?.id,)}>
                                                                                                <Check color={"#22d3ee"} size={16} />
                                                                                            </div> :
                                                                                            <div className='d-flex justify-content-center align-items-center w-[30px] h-[30px] rounded-circle border border-secondary' onClick={()=>handleNoteOperations("done",item.favorite,item?.id,)}>
                                                                                                <Check size={16} />
                                                                                            </div>
                                                                                    }
                                                                                </div>
                                                                                <div style={{ fontSize: "14px", fontWeight: 500 }}>
                                                                                    {item?.content.charAt(0).toUpperCase() + item?.content.slice(1)}
                                                                                </div>
                                                                            </div>
                                                                            <div className='d-flex gap-[20px]  justify-content-center align-items-center'>
                                                                                <div>
                                                                                    {
                                                                                        item?.favorite ?
                                                                                            <div onClick={() => handleNoteOperations("favorite", !item?.favorite, item?.id)}>
                                                                                                <FaStar color={"gold"} size={16} />
                                                                                            </div> :
                                                                                            <div onClick={() => handleNoteOperations("favorite", !item?.favorite, item?.id)}>
                                                                                                <FaRegStar size={16} />
                                                                                            </div>
                                                                                    }
                                                                                </div>
                                                                                <div style={{ position: "relative" }}>
                                                                                    <div className={showNotesMenu ? "bg-light rounded w-[35px] h-[35px] d-flex justify-content-center align-items-center" : "w-[35px] h-[35px] d-flex justify-content-center align-items-center"}>
                                                                                        <MoreHorizontal size={20} onClick={() => handleNotesMenu(item.id)} />
                                                                                    </div>
                                                                                    {showNotesMenu && item.id === showNotesMenuId &&
                                                                                        <Card style={{ position: "absolute", right: "10px", width: "200px" }}>
                                                                                            <ListGroup>
                                                                                                <ListGroup.Item className='d-flex gap-[5px] align-items-center' style={{ fontSize: "13px" }} onClick={() => { handleEditNoteForm() }}><Pencil size={16} /> Edit Note</ListGroup.Item>
                                                                                                <ListGroup.Item className='d-flex gap-[5px] align-items-center text-danger' style={{ fontSize: "13px" }} onClick={() => handleNoteOperations("delete", !item?.favorite, item?.id)}><Trash2 size={16} /> Delete</ListGroup.Item>
                                                                                            </ListGroup>
                                                                                        </Card>

                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className='ml-12'>
                                                                            {
                                                                                 item?.updated_at && item?.updated_at !== "nill" ?
                                                                                    <div>
                                                                                        <p className='m-0' style={{ color: "green", fontSize: "14px", fontWeight: 700 }}>Completed on {isNaN(new Date(item.due_date)) ? "-" : new Date(item.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                                                        <p className='m-0' style={{ color: "green", fontSize: "14px", fontWeight: 700 }}>by {appointmentDetailsResponse.employee.name}</p>
                                                                                    </div> :
                                                                                    <div>
                                                                                        <p className='m-0' style={{ color: "#696977", fontSize: "14px", fontWeight: 700 }}>Due Friday {isNaN(new Date(item.due_date)) ? "-" : new Date(item.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                                                        <p className='m-0' style={{ color: "#696977", fontSize: "14px", fontWeight: 700 }}>Assigned to {appointmentDetailsResponse.employee.name}</p>
                                                                                    </div>
                                                                            }
                                                                            <div>
                                                                                <p className='mb-0' style={{ color: "green", fontSize: "12px" }}>by {appointmentDetailsResponse.employee.name} {isNaN(new Date(item.due_date)) ? "-" : new Date(item.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                                                <p className='mb-0 text-dark' style={{ lineHeight: "14px" }}>
                                                                                    <span style={{ fontSize: "12px" }}>Task for{" "}</span>
                                                                                    <span style={{ color: "#22d3ee", fontSize: "12px" }}>Appointment: {formatDateTime(appointmentDetailsResponse.start_time)} - {formatDateTime(appointmentDetailsResponse.end_time)}, {renderProductNames(appointmentDetailsResponse.products)} {(new Date(appointmentDetailsResponse.start_time) - new Date(appointmentDetailsResponse.end_time)) / (1000 * 60)} minutes</span>
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                }

                                                            </>
                                                        })}
                                                    </>
                                                }

                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center' onClick={handleBillingInfo}>
                                            <p className='fs-6 mb-0' style={{ color: '#22d3ee' }}>Billing Info</p>
                                            <p className='mb-0'>
                                                {billingInfo
                                                    ?
                                                    <ChevronUp color="#22d3ee" size={25} /> :
                                                    <ChevronDown color="#22d3ee" size={25} />
                                                }
                                            </p>
                                        </div>
                                        <Collapse in={billingInfo}>
                                            <div className=' p-3'>
                                                <div className='d-flex justify-content-between align-items-center'>
                                                    <p className='mb-0' style={{ fontWeight: 700 }}>Status Partial Invoice</p>
                                                    <div className='d-flex justify-content-center align-items-center gap-[5px]' onClick={handleAddItem}>
                                                        <p className='mb-0' style={{ fontSize: "16px", fontWeight: 700, color: "#22d3ee" }}>Add Item</p>
                                                        {
                                                            addItem ?
                                                                <XCircle size={15} style={{ color: "#22d3ee" }} strokeWidth={3} /> :
                                                                <PlusCircle size={15} style={{ color: "#22d3ee" }} strokeWidth={3} />
                                                        }
                                                    </div>

                                                </div>

                                                <div>
                                                    {
                                                        addItem &&
                                                        <>
                                                            <hr className='my-3' />
                                                            <InputGroup className="mb-3">
                                                                <InputGroup.Text id="basic-addon1"><Search size={17} color='#899499' /></InputGroup.Text>
                                                                <Form.Control
                                                                    placeholder="Add a product..."
                                                                    aria-label="Username"
                                                                    aria-describedby="basic-addon1"
                                                                />
                                                            </InputGroup>
                                                        </>
                                                    }
                                                </div>
                                                <hr className='my-3' />
                                                <div>
                                                    <BillingInfoCard addAdjustment={addAdjustment} handleAddAdjustment={handleAddAdjustment} />

                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center' onClick={handleReturnVisitReminder}>
                                            <p className='fs-6 mb-0' style={{ color: '#22d3ee' }}>Return Visit Reminder</p>
                                            <p className='mb-0'>
                                                {returnVisitReminder
                                                    ?
                                                    <ChevronUp color="#22d3ee" size={25} /> :
                                                    <ChevronDown color="#22d3ee" size={25} />
                                                }
                                            </p>
                                        </div>
                                        <Collapse in={returnVisitReminder}>
                                            <div className=' p-3'>
                                                <p className='mb-0' style={{ fontSize: "13px" }}>Test has <span style={{ color: "#22d3ee" }}>1 upcoming appointment</span></p>
                                                <p className='mb-0' style={{ fontSize: "13px" }}>Next visit: Sunday,November 17, 2024 2:00pm</p>
                                                <p className='mb-0' style={{ fontSize: "13px" }}>Neurotoxin Treatment with Ashrut Dev</p>
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                                <div className='mt-2'>
                                    <div>
                                        <div className='d-flex justify-content-between align-items-center' onClick={handleHistoryAndStatus}>
                                            <p className='fs-6 mb-0' style={{ color: '#22d3ee' }}>History & Status</p>
                                            <p className='mb-0'>
                                                {historyAndStatus
                                                    ?
                                                    <ChevronUp color="#22d3ee" size={25} /> :
                                                    <ChevronDown color="#22d3ee" size={25} />
                                                }
                                            </p>
                                        </div>
                                        <Collapse in={historyAndStatus}>
                                            <div className=' p-3'>
                                                <div>
                                                    <p className='mb-0' style={{ fontSize: "14px", fontWeight: 700 }}>Status:Booked</p>
                                                </div>
                                                <hr />
                                                <div>
                                                    <p className='mb-0' style={{ fontSize: "14px", fontWeight: 700 }}>Activity</p>
                                                    <div>
                                                        <p className='mb-0' style={{ fontSize: "13px" }}>Reserved by Ashrut Dev on Monday,</p>
                                                        <p className='mb-0' style={{ fontSize: "13px" }}>November 11 2024 4:32pm</p>
                                                    </div>
                                                    <hr style={{ opacity: 0.1 }} />
                                                </div>
                                                <hr />
                                                <div>
                                                    <p className='mb-0' style={{ fontSize: "14px", fontWeight: 700 }}>Reminders</p>
                                                    <div>
                                                        <p className='mb-0' style={{ fontSize: "13px" }}>No reminder set for this appointment</p>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div>
                                                    <p className='mb-0' style={{ fontSize: "14px", fontWeight: 700 }}>Notifications</p>
                                                    <div>
                                                        <p className='mb-0' style={{ fontSize: "13px" }}>No notifications set for this appointment</p>
                                                    </div>
                                                </div>
                                                <hr />
                                                <div>
                                                    <p className='mb-0' style={{ fontSize: "14px", fontWeight: 700 }}>Clinical Survey</p>
                                                    <div>
                                                        <p className='mb-0' style={{ fontSize: "13px" }}>No clinical survey set for this appointment</p>
                                                    </div>
                                                </div>
                                                <hr />
                                            </div>
                                        </Collapse>
                                    </div>
                                </div>
                            </>
                    }
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
};

const BillingInfoCard = ({ addAdjustment, handleAddAdjustment, index }) => {
    return <div>
        <div className='d-flex justify-content-between align-items-start'>
            <div>
                <p className='mb-0' style={{ fontWeight: 700, fontSize: "14px" }}>Neurotoxin Treatment</p>
                <p className='mb-0' style={{ fontWeight: 500, fontSize: "14px" }}>No Package/Membership</p>
            </div>
            <div className='d-flex justify-content-center align-items-center gap-[5px]'>
                <p className='mb-0' style={{ fontSize: "15px", fontWeight: 400 }}>$6.50</p>
            </div>
        </div>
        <hr />
        {
            addAdjustment &&
            <>
                <InputGroup className="mb-3">
                    <InputGroup.Text id="basic-addon1"><Search size={17} color='#899499' /></InputGroup.Text>
                    <Form.Control
                        placeholder="Add Adjustment..."
                        aria-label="Username"
                        aria-describedby="basic-addon1"
                    />
                </InputGroup>
            </>
        }
        <div>
            <Container>
                <Row>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0">
                        <div className="" style={{ fontSize: "14px" }}>Subtotal</div>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0  d-flex justify-content-end">
                        <div className="" style={{ fontSize: "14px" }}>$10.00</div>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0">
                        <div className="" style={{ fontSize: "14px" }}>Tax</div>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0 d-flex justify-content-end">
                        <div className="" style={{ fontSize: "14px" }}>$10.00</div>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0">
                        <div className="" style={{ fontSize: "14px" }}>Total</div>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6} className="p-0 d-flex justify-content-end">
                        <div className="" style={{ fontSize: "14px" }}>$20.00</div>
                    </Col>
                </Row>
            </Container>
        </div>
        <hr />
        <div className='d-flex justify-content-between align-items-start'>
            <div>
                <p className='mb-0 d-flex align-items-center' style={{ fontWeight: 700, fontSize: "15px" }}><UserRound size={15} />Nuerotoxin Treatment</p>
                <p className='mb-0' style={{ fontWeight: 500, fontSize: "14px" }}>No Package/Membership</p>
            </div>
            <div className='d-flex justify-content-center align-items-end gap-[5px] flex-column'>
                <Badge bg="secondary">Uninvoiced</Badge>
                <p className='mb-0' style={{ fontSize: "15px", fontWeight: 400 }}>$6.50</p>
            </div>
        </div>
        <div>
        </div>
        <div className='mt-1 d-flex justify-content-between align-items-center'>
            <Button variant="primary" onClick={handleAddAdjustment} className='d-flex justify-content-center align-items-center gap-[5px]'>
                Adjustment
                {
                    addAdjustment ?
                        <XCircle size={15} style={{ color: "#fff" }} strokeWidth={3} /> :
                        <PlusCircle size={15} style={{ color: "#fff" }} strokeWidth={3} />
                }
            </Button>
            <Button className='d-flex justify-content-center align-items-center gap-[5px]'>
                View
                <ChevronRight size={15} style={{ color: "#fff" }} strokeWidth={3} />
            </Button>
        </div>
        <hr />
    </div>
}

const EditAppointment = ({ handleEditAppointment, noteValue, handleNoteChange, addNoteToAppointment }) => {
    return <div className='mt-2'>
        <div className='d-flex justify-content-end align-items-center gap-[10px]'>
            <Button className='h-[38px]' variant='outline-secondary' onClick={handleEditAppointment}>Cancel</Button>
            <Button className='h-[38px]'>Update Appointment</Button>
            <hr />
        </div>
        <div>
            <p className='' style={{ fontSize: "16px", color: "#696977" }}>Treatment</p>
            <Select
                fullWidth
                inputId="treatment"
                isClearable
                options={[
                    { value: "asdfasf", label: "asdfasf" },
                    { value: "Asdfasdfasf", label: "Asdfasdfasf" },
                    { value: "ASDFasdfasf", label: "ASDFasdfasf" }
                ]}
                placeholder="Select a Treatment"
                required
                className="h-[35px]"
            />
            <hr />
        </div>
        <div>
            <div className='d-flex justify-content-between align-center'>
                <p className='' style={{ fontSize: "16px", color: "#696977" }}>Client</p>
                <Button size='sm' className='h-[27px]' style={{ fontSize: "12px" }} variant='outline-secondary'>Change Client</Button>
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Test Account User</p>
                <p className='mb-1 d-flex align-items-center justify-content-start gap-[2px]' style={{ fontSize: "12px" }} ><Mail size={15} /><span style={{ color: "#22d3ee" }}>abc@gmail.com</span></p>
                <p className='mb-1 d-flex align-items-center justify-content-start gap-[2px]' style={{ fontSize: "12px" }} ><Phone size={15} /><span>1234567890</span></p>
                <p className='mb-1 d-flex align-items-center justify-content-start gap-[2px]' style={{ fontSize: "12px" }} ><CalendarRange size={15} /><span>1 upcoming appointment</span></p>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Last Visit:{" "}<span className='fw-light'>November 10 neurotoxin</span></p>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Account Balance:{" "}<span className='fw-light'>$1050.00</span></p>
                <Badge bg='#fba919' style={{ backgroundColor: "#fba919" }}>1 no show</Badge>
                <hr />
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Packages & Membership</p>
                <p className='mb-0'>No Packages/Membership</p>
                <hr />
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Time</p>
                <Form.Select aria-label="Default select example" className='h-[35px]' fullWidth>
                    <option value="1">2:00 PM</option>
                </Form.Select>
                <p className='m-2' style={{ fontSize: "12px" }}>Sunday , Nov 17,2024 2:00 PM- 2:14 PM</p>
                <hr />
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Staff Member</p>
                <p className='m-2' style={{ fontSize: "12px" }}>Ashrut Dev</p>
                <hr />
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Resources</p>
                <p className='m-2' style={{ fontSize: "12px" }}>No Resources</p>
                <hr />
            </div>
            <div>
                <p className='mb-1 fw-bold' style={{ fontSize: "12px" }} >Notes</p>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={noteValue} />
                    </Form.Group>
                </Form>
                <hr />
            </div>
            <div className='d-flex justify-content-end align-items-center gap-[10px]'>
                <Button className='h-[38px]' variant='outline-secondary' onClick={handleEditAppointment}>Cancel</Button>
                <Button className='h-[38px]' onClick={() => addNoteToAppointment("createNote")}>Update Appointment</Button>
            </div>
        </div>
    </div>
};

const EditAppointmentNote = ({ noteDetails, editEmployeeList, handleEditNoteSubmit, handleCloseEditNoteForm }) => {
    const [editNoteValue, setEditNoteValue] = useState("");
    const [editNoteValueButtons, setEditNoteValueButtons] = useState(false);
    const [editDueDate, setEditDueDate] = useState("");
    const [editNoteSwitch, setEditNoteSwitch] = useState(true);
    const [editEmployeeName, setEditEmployeeName] = useState("");
    const [editEmployeeId, setEditEmployeeId] = useState("");
    const [editFavorite, setEditFavorite] = useState(false);
    useEffect(() => {
        setEditNoteValue(noteDetails.content);
        setEditDueDate(noteDetails.due_date);
        setEditFavorite(noteDetails.favorite)
        getEmployee();
    }, [noteDetails])
    const getEmployee = () => {
        let employee = editEmployeeList.find((item) => { return item.id === noteDetails.employee_id })
        if (employee) {
            setEditEmployeeName(employee.name)
            setEditEmployeeId(employee.id);
        }
    }
    const handleNoteChange = (event) => {
        setEditNoteValue(event.target.value)
    };
    const handleDueDate = async (date) => {
        setEditDueDate(date);
    };
    const handleEmployeeChange = async (event) => {
        let employee = await editEmployeeList.find((item) => item.name === event.target.value);
        if (employee) {
            setEditEmployeeName(employee.name)
            setEditEmployeeId(employee.id);
        }
    };
    const handleFavorite = () => {
        setEditFavorite(!editFavorite)
    };

    return <>
        <div>
            <div className='d-flex justify-content-end align-items-center mb-3 gap-[10px]'>
                {
                    editFavorite ? <FaStar onClick={handleFavorite} color='gold' /> :
                        <FaRegStar onClick={handleFavorite} />
                }
                <Form.Check
                    type="switch"
                    id="custom-switch"
                    onChange={(e) => {
                        setEditNoteSwitch((prev) => !prev)
                    }}
                    checked={editNoteSwitch}
                />
            </div>
            {editNoteSwitch ? <div className='mb-3'>
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control onFocus={() => setEditNoteValueButtons(true)} as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={editNoteValue} />
                    </Form.Group>
                </Form>
                <InputGroup className="mb-3" fullWidth>
                    <InputGroup.Text>
                        <CalendarRange style={{ color: '#888' }} />
                    </InputGroup.Text>
                    <DatePicker
                        className='w-[86%]'
                        selected={editDueDate}
                        onChange={handleDueDate}
                        dateFormat="yyyy/mm/dd"
                        customInput={
                            <Form.Control
                                type="text"
                                placeholder="Select date"
                                value={editDueDate}
                            />
                        }
                    />
                </InputGroup>
                <Form.Select aria-label="Default select example" value={editEmployeeName} fullWidth onChange={handleEmployeeChange}>
                    <option>Select a employee</option>
                    {
                        editEmployeeList.map((item) => {
                            return <option key={item.name} value={item.name}>{item.name}</option>
                        })
                    }
                </Form.Select>
            </div> :
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Control onFocus={() => setEditNoteValueButtons(true)} as="textarea" placeholder='Add Notes' rows={3} onChange={handleNoteChange} value={editNoteValue} />
                    </Form.Group>
                </Form>
            }
            <div className='d-flex justify-content-end align-items-center gap-[10px]'>
                <Button variant='outline-secondary' onClick={handleCloseEditNoteForm}>Cancel</Button>
                <Button style={{ backgroundColor: "#22d3ee", opacity: !editNoteValue && 0.2 }} disabled={editNoteValue ? false : true} onClick={() => handleEditNoteSubmit(editEmployeeId, editDueDate, editNoteValue, editFavorite, noteDetails.id)}>Save</Button>
            </div>
        </div>
    </>
};

export default AppointmentDetails;
