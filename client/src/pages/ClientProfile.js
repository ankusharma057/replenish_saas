import { Alert, Button, ButtonGroup, Card, Col, Container, Dropdown, DropdownButton, Form, ListGroup, Modal, OverlayTrigger, Placeholder, Popover, Row, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import ReactCardFlip from 'react-card-flip';
import { UserRound, AlertTriangle, Phone, Mail, DollarSign, Briefcase, CalendarDays, Bell, Megaphone, File, Users, Tag, MessageCircle, Pencil, Home, X, Check, Settings, ThumbsUp, Smartphone, MoveRight, Printer, Info, Trash2, Edit, Star, Search, PlusCircle } from 'lucide-react';
import { Ellipsis } from "react-bootstrap/esm/PageItem";
import CountUp from 'react-countup';
const ClientProfile = ({ clientProfileData, handleClientProfileFlipCard, handleSearchClients, searchQuery, searchedClients,handleNavigate }) => {
    const [flipLeftCardIndex, setflipLeftCardIndex] = useState(null)
    const [flipRightCardIndex, setflipRightCardIndex] = useState(null)
    const [showPopover, setShowPopover] = useState(null);
    const [showAddRelationModal, setShowAddRelationModal] = useState(false)
    const [showSurveySetup, setShowSurveySetup] = useState(false)
    const [surveySetup, setSurveySetup] = useState("")
    const topleftCardsData = [
        {
            id: 1,
            count: 6,
            label: "Total Booking",
            backLable: "View Appointments",
            targetTab: "Appointments"
        },
        {
            id: 2,
            count: 0,
            label: "Upcomming appointment",
            backLable: "View Appointments",
            targetTab: "Appointments"
        },
        {
            id: 3,
            count: 1,
            label: "No Shows",
            backLable: "View Appointments",
            targetTab: "Appointments"
        },
        {
            id: 4,
            count: 5,
            label: "Month since last visit",
            backLable: "View Appointments",
            targetTab: "Appointments"
        },
    ];
    const topRightCardsData = [
        {
            id: 1,
            count: 685.00,
            label: "Total Booking",
            backLable: "Recieve Payments",
            targetTab: "Appointments"
        },
        {
            id: 2,
            count: 0.00,
            label: "Upcomming appointment",
            backLable: "View Credit",
            targetTab: "Billing"
        },
        {
            id: 3,
            count: 833.000,
            label: "No Shows",
            backLable: "View Purchases",
            targetTab: "Billing"
        },
    ];
    const data = [
        {
            id: 1,
            intakeForm: 'Media/photo usage',
            status: 'submitted at Tue, Jan 9, 2024 1:50 AM',
        },
        {
            id: 2,
            intakeForm: 'Document submission',
            status: 'submitted at Mon, Jan 8, 2024 10:30 AM',
        },
        {
            id: 3,
            intakeForm: 'Survey response',
            status: 'submitted at Sun, Jan 7, 2024 5:00 PM',
        },
        // Add more data as needed
    ];
    const defaultAdjustment=[
        "$10 off",
        "$100 Aspire Credit",
        "$100 Off",
        "$100 Off 2 Filler Syringes",
        "$120 Aspire",
        "$120 alle",
        "$150 Premium IV Drip Promo (January)",
        "$170 Aspire",
        "$175 Off Filler Family Discount",
        "$175 Premium IV Drip",
        "$20 OFF Aspire",
        "$20 Off Welcome Aspire Promo"
      ]
    const handleOutsideClick = (event) => {
        if (showPopover !== null) {
            setShowPopover(null); // Close popover if clicking outside
        }
    };
    const handlePopoverClick = (rowIndex) => {
        if (showPopover === rowIndex) {
            setShowPopover(null); // Close if the same popover is clicked again
        } else {
            setShowPopover(rowIndex); // Open popover for the clicked row
        }
    };
    const handleLeftCardClick = (index) => {
        setflipLeftCardIndex(index)
    };
    const handleLeftCardOut = () => {
        setflipLeftCardIndex(null)
    };
    const handleRightCardClick = (index) => {
        setflipRightCardIndex(index)
    };
    const handleRightCardOut = () => {
        setflipRightCardIndex(null)
    };
    const handlePopover = () => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    };
    useEffect(() => {
        handlePopover()
    }, [showPopover,]);
    const formatAmount = (amount) => {
        const amountString = Number(amount).toFixed(2);
        const decimalPart = amountString.slice(-3);
        const mainAmount = amountString.slice(0, -3);
        return { mainAmount, decimalPart };
    };
    const popover = (rowIndex) => (
        <Popover id={`popover-${rowIndex}`}>
            <ListGroup>
                <ListGroup.Item className="d-flex gap-2">
                    <Printer /> Print
                </ListGroup.Item>
                <ListGroup.Item className="d-flex gap-2">
                    <Trash2 color="red" /> <p className="text-dange m-0">Delete Intake Form</p>
                </ListGroup.Item>
            </ListGroup>
        </Popover>
    );
    const popoverHeadshot = () => (
        <Popover>
            <ListGroup>
                <ListGroup.Item className="d-flex gap-2">
                    <Printer /> Print
                </ListGroup.Item>
                <ListGroup.Item className="d-flex gap-2">
                    <Trash2 color="red" /> <p className="text-dange m-0">Delete</p>
                </ListGroup.Item>
            </ListGroup>
        </Popover>
    );
    const handleNullValues = (value) => {
        return value === "" || value === null || value === undefined ? "-" : value;
    };
    const handleReminderCheck = (value) => {
        return value ? <Check size={15}/> : <X size={15}/>;
    };
    const handleAddRelationModal = () => {
        setShowAddRelationModal(!showAddRelationModal)
    };
    const handleSurveySetupModal = () => {
        setShowSurveySetup(!showSurveySetup);
    };
    const handleSurveySetupChange = (e) => {
        setSurveySetup(e.target.value);
    };
    return (
        <Container>
            <AddRelationShip showModal={showAddRelationModal} handleClose={handleAddRelationModal} handleSearchClients={handleSearchClients} searchQuery={searchQuery} searchedClients={searchedClients} handleNullValues={handleNullValues} />
            <Row xs={6} sm={6} md={6} lg={6} className="bg-white p-3 rounded">
                <Col className="w-50">
                    <div className="d-flex justify-content-between align-items-center">
                        {topleftCardsData.map((item, index) => {
                            return <div onMouseOver={() => handleLeftCardClick(index)} onMouseOut={handleLeftCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                <ReactCardFlip isFlipped={flipLeftCardIndex === index} flipDirection="horizontal">
                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                        <div className="h2 text-secondary">
                                            <CountUp end={item.count}/>
                                            </div>
                                        <div className="h6 text-center text-muted">{item.label}</div>
                                    </div>
                                    <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                        <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                    </div>
                                </ReactCardFlip>
                            </div>
                        })}
                    </div>
                </Col>
                <Col className="w-50">
                    <div className="d-flex justify-content-end align-items-center gap-[40px]">
                        {topRightCardsData.map((item, index) => {
                            const { mainAmount, decimalPart } = formatAmount(item.count);
                            return <div onMouseOver={() => handleRightCardClick(index)} onMouseOut={handleRightCardOut} key={index} className="w-[110px] h-[110px] p-1">
                                <ReactCardFlip isFlipped={flipRightCardIndex === index} flipDirection="horizontal">
                                    <div className="d-flex flex-column justify-content-between align-items-center">
                                        <div className="h2 text-secondary d-flex justify-content-start">
                                            <span className="fs-6 mt-[4px]">$</span>
                                            <span className="large"> <CountUp end={mainAmount} />{}</span>
                                            <span className="fs-6  mt-[4px]">{decimalPart}</span>
                                        </div>
                                        <div className="h6 text-center text-muted">{item.label}</div>
                                    </div>
                                    <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                                        <p className=" fs-6 mb-0 text-center text-white">{item.backLable}</p>
                                    </div>
                                </ReactCardFlip>
                            </div>
                        })}
                    </div>
                </Col>
            </Row>
            <div className="mt-[20px]">
                <Row xs={1} md={2}>
                    <Col className="w-50 d-flex flex-column gap-[20px] p-0">
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px]">
                                <div><UserRound /></div>
                                <div>
                                    <p className="text-body fw-bold fs-6">{handleNullValues(clientProfileData.name)}</p>
                                </div>
                                <div className="position-absolute top-[20px] right-[25px] w-auto"><Pencil onClick={()=>handleNavigate(clientProfileData)} size={20} color="#22D3EE" /></div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><Phone /></div>
                                <div>
                                    <p className="text-body fw-bold fs-6">{handleNullValues(clientProfileData.phone_number)}</p>
                                </div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><Mail /></div>
                                <div>
                                    <p className="mb-0" style={{ color: '#22D3EE' }}>{handleNullValues(clientProfileData.email)}</p>
                                    {!clientProfileData.is_verified && <p className="text-muted fw-light" style={{fontSize:"14px"}}>Tester has not verified that this email address belongs to them and that they are successfully receiving emails from Jane. Click here to remind Tester to confirm their email address.</p>}
                                </div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><Home /></div>
                                <div>
                                    <p className="text-body fw-bold fs-6">{handleNullValues(clientProfileData.country)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative">
                            <div className="d-flex gap-[10px]">
                                <div><Briefcase /></div>
                                <div>
                                    <p className="text-muted fw-light fs-6">No medical info</p>
                                </div>
                                <div className="position-absolute top-[20px] right-[25px] w-auto"><Pencil onClick={()=>handleNavigate(clientProfileData)} size={20} color="#22D3EE" /></div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px]">
                                <div><Bell /></div>
                                <div>
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>Reminder</p>
                                    <p className="d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>{handleReminderCheck(clientProfileData.email_reminder_2_days)}Email 2 days before appointment</p>
                                    <p className="d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>{handleReminderCheck(clientProfileData.sms_reminder_2_days)}Text Message (SMS) 2 days before appointment</p>
                                    <p className="d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>{handleReminderCheck(clientProfileData.sms_reminder_24_hours)}Text Message (SMS) 24 hours before appointment</p>
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>Email Notifications</p>
                                    <p className="d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>{handleReminderCheck(clientProfileData.email_waitlist_openings)}Email notifications of wait list openings</p>
                                    <p className="d-flex align-items-center mb-2" style={{ fontSize: '14px' }}>{handleReminderCheck(clientProfileData.sms_waitlist_openings)}SMS notifications of wait list openings</p>
                                </div>
                                <div className="position-absolute top-[20px] right-[25px] w-auto"><Pencil onClick={()=>handleNavigate(clientProfileData)} size={20} color="#22D3EE" /></div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><Megaphone /></div>
                                <div>
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>Marketing Emails</p>
                                    <p className="d-flex align-items-center">{handleReminderCheck(clientProfileData.ok_to_send_marketing_emails)}OK to Send Marketing Emails</p>
                                    <p className="d-flex align-items-center">{handleReminderCheck(clientProfileData.send_ratings_emails)}Send Ratings Emails</p>
                                </div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><Settings /></div>
                                <div>
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>All Email Settings</p>
                                    <p className="d-flex align-items-center">{handleReminderCheck(clientProfileData.do_not_email)}All Email Settings</p>
                                </div>
                            </div>
                            <div className="d-flex gap-[10px]">
                                <div><ThumbsUp /></div>
                                <div>
                                    <div>
                                        <p className="text-muted fw-light mb-0" style={{ fontSize: '13px' }}>How did you hear about us??</p>
                                        <p className="text-body fw-bold fs-6 mb-0">{handleNullValues(clientProfileData.how_heard_about_us)}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted fw-light mb-0" style={{ fontSize: '13px' }}>Who were you referred to?</p>
                                        <p className="text-body fw-bold fs-6 mb-0">{handleNullValues(clientProfileData.who_were_you_referred_to)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px] ">
                                <div><Users /></div>
                                <div>
                                    <Button type="button" className="btn btn-outline-secondary d-flex align-items-center bg-white gap-[5px] border border-secondary" onClick={handleAddRelationModal}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-circle-plus"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
                                        Add Relationship
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col className="w-50 d-flex flex-column gap-[20px]">
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px]">
                                <div><DollarSign /></div>
                                <div className="w-100">
                                    <p className=" mb-0 text-muted fw-light" style={{ fontSize: '13px' }}>Billing Notices</p>
                                    <p className="mb-2">Test has a balance of $825.00</p>
                                    <ButtonGroup size="sm" aria-label="Basic example" className="w-100">
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]"><Mail size={20} />Email Reminder</Button>
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]" ><Smartphone size={20} />Text Reminder</Button>
                                    </ButtonGroup>
                                    <Button className="btn btn-outline-secondary d-flex align-items-center w-100 mt-[10px] text-white justify-content-center" size="sm"><DollarSign size={20} />Receive Payment</Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px]">
                                <div><CalendarDays /></div>
                                <div className="w-100">
                                    <p style={{ color: "gray" }}>Tester has no upcoming appointments. <span style={{ color: "#0dcaf0" }}>Add a Return Visit Reminder</span></p>
                                    <ButtonGroup size="sm" aria-label="Basic example" className="w-100">
                                        <Button size="sm" variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]"><MoveRight size={20} />View All</Button>
                                        <Button size="sm" variant="outline-secondary d-flex justify-content-center align-items-center" >
                                            <Mail size={20} />
                                            <DropdownButton as={ButtonGroup} title="Email" id="bg-nested-dropdown" variant="outline" size="sm">
                                                <Dropdown.Item eventKey="1" className="d-flex gap-[5px]"><Mail />Send Now</Dropdown.Item>
                                                <Dropdown.Item eventKey="2" className="d-flex gap-[5px]"><Edit />Add Message</Dropdown.Item>
                                            </DropdownButton>
                                        </Button>
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]" ><Printer size={20} />Print</Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px]">
                                <div><UserRound /></div>
                                <div className="w-100">
                                    <p className="text-muted fw-light mb-0" style={{ fontSize: '13px' }}>Username / Logins</p>
                                    <p className="d-flex align-items-center mb-2 gap-[10px]"><UserRound size={15} /> {handleNullValues(clientProfileData.name)}</p>
                                    <ButtonGroup size="sm" aria-label="Basic example" className="w-100">
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]">
                                            <Mail size={20} />
                                            <DropdownButton as={ButtonGroup} title="Welcome" id="bg-nested-dropdown" variant="outline" size="sm">
                                                <Dropdown.Item eventKey="1" className="d-flex gap-[5px]"><Mail />Send Now</Dropdown.Item>
                                                <Dropdown.Item eventKey="2" className="d-flex gap-[5px]"><Edit />Add Message</Dropdown.Item>
                                            </DropdownButton>
                                        </Button>
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]" >
                                            <Smartphone size={20} />
                                            <DropdownButton as={ButtonGroup} title="Password Reset" id="bg-nested-dropdown" variant="outline" size="sm">
                                                <Dropdown.Item eventKey="1" className="d-flex gap-[5px]"><Mail />Send Now</Dropdown.Item>
                                                <Dropdown.Item eventKey="2" className="d-flex gap-[5px]"><Edit />Add Message</Dropdown.Item>
                                            </DropdownButton>
                                        </Button>
                                    </ButtonGroup>
                                    <p className="mb-1">Last Login: Wednesday, November 30, 2022 10:14 AM</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">

                            <div className="d-flex gap-[10px]">
                                <div><UserRound /></div>
                                <div className="w-100">
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>Username / Logins</p>
                                    <Table borderless>
                                        <thead>
                                            <tr>
                                                <th>Intake form</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="d-flex align-items-center">
                                                        {item.intakeForm} <AlertTriangle className="ml-2 bg-white" strokeWidth={1} fill="#f19a04" style={{ color: '#fff' }} />
                                                    </td>
                                                    <td>{item.status}</td>
                                                    <td style={{ listStyle: 'none' }}>
                                                        <OverlayTrigger
                                                            trigger="click"
                                                            placement="left"
                                                            show={showPopover === index}
                                                            overlay={popover(index)}
                                                        >
                                                            <Ellipsis size={100} onClick={() => handlePopoverClick(index)} />
                                                        </OverlayTrigger>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <Alert variant="warning" style={{ backgroundColor: '#fff9e6', color: '#c18702', border: 'none' }}>
                                        <div className="d-flex align-items-start justify-content-start gap-[10px]">
                                            <AlertTriangle size={70} className="h-auto mt-1" />
                                            <span>
                                                The Intake form is out of date because the template has been updated since it was created.
                                                To fill out the most recent version, click the <b>•••</b> button to delete it and then
                                                choose one of the options below to complete a fresh copy.
                                            </span>
                                        </div>
                                    </Alert>
                                    <ButtonGroup size="sm" aria-label="Basic example" className="w-100">
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]">
                                            <Pencil onClick={()=>handleNavigate(clientProfileData)} size={20} />
                                            <DropdownButton as={ButtonGroup} title="Fill Out" id="bg-nested-dropdown" variant="outline" size="sm">
                                                <Dropdown.Item eventKey="1">Fill all pending forms</Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="2"><Edit size={15} />New Client Intake Form* Copy</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="3"><Edit size={15} />New Client Intake Form*</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="4"><Edit size={15} />New Client Intake Forms (IV and IM Injections)</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="5"><Edit size={15} />Consent for Dermal Fillers*</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="6"><Edit size={15} />General Intake Form for ALL treatments</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="7"><Edit size={15} />Consent for Neuromodulator*</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="8"><Edit size={15} />Consent for Neuromodulator* Copy</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="9"><Edit size={15} />Consent for IV Therapy*</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="10"><Edit size={15} />Intake Form (September 2024)</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="11"><Edit size={15} />IV Therapy Intake form</Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="2"><Edit size={15} />Dropdown link</Dropdown.Item>
                                            </DropdownButton>
                                        </Button>
                                        <Button variant="outline-secondary d-flex justify-content-center align-items-center gap-[5px]" >
                                            <Smartphone size={20} />
                                            <DropdownButton as={ButtonGroup} title="Email" id="bg-nested-dropdown" variant="outline" size="sm">
                                                <Dropdown.Header>New Client Intake Form* Copy</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="1">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="2">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>New Client Intake Form*</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="3">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="4">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>New Client Intake Forms (IV and IM Injections)</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="5">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="6">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>Consent for Dermal Fillers*</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="7">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="8">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>General Intake Form for ALL treatments</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="9">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="10">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Header>Consent for Neuromodulator*</Dropdown.Header>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="11">
                                                    <Mail size={16} /> Send Now
                                                </Dropdown.Item>
                                                <Dropdown.Item className={"d-flex align-items-center gap-[5px]"} eventKey="12">
                                                    <Edit size={16} /> Add Message...
                                                </Dropdown.Item>
                                            </DropdownButton>
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </div>

                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="mt-2 d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-start gap-[10px]">
                                    <File />
                                    <p>Surveys</p>
                                    <Info />
                                </div>
                                <div>
                                    <ButtonGroup>
                                        <Button size="md" variant="outline-secondary" className=" d-flex justify-content-center align-items-center gap-[5px] rounded-top rounded-bottom" onClick={handleSurveySetupModal}>
                                            <PlusCircle size={20} /> Set Up
                                        </Button>
                                        <Button size="sm" variant="outline-secondary" className=" d-none justify-content-center align-items-center gap-[5px]" >
                                        </Button>
                                    </ButtonGroup>
                                    <SurveySetup open={showSurveySetup} handleSurveySetupModal={handleSurveySetupModal} handleSurveySetupChange={handleSurveySetupChange} surveySetup={surveySetup}/>
                                </div>
                            </div>
                            <Table borderless>
                                <thead>
                                    <tr>
                                        <th>Survey</th>
                                        <th>Status</th>
                                        <th>History</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="4" className="text-center">
                                            No data available
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px] mt-2">
                                <div><Tag /></div>
                                <div className="w-100">
                                    <p className="text-muted fw-light" style={{ fontSize: '13px' }}>Default Adjustments</p>
                                    <ButtonGroup>
                                        <Button size="sm" variant="outline-secondary" className=" d-flex justify-content-center align-items-center gap-[5px] rounded-top rounded-bottom" >
                                            <PlusCircle size={20} />
                                            <DropdownButton as={ButtonGroup} title="Add" id="bg-nested-dropdown" variant="outline" size="sm">
                                                {defaultAdjustment.map((discount, index) => (
                                                    <Dropdown.Item key={index}>{discount}</Dropdown.Item>
                                                ))}
                                            </DropdownButton>
                                        </Button>
                                        <Button size="sm" variant="outline-secondary" className=" d-none justify-content-center align-items-center gap-[5px]" >
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border w-100 bg-white position-relative rounded">
                            <div className="d-flex gap-[10px] mt-2">
                                <div><MessageCircle /></div>
                                <div className="w-100">
                                    <div className="form-floating">
                                        <textarea className="form-control" placeholder="Leave a comment here" id="floatingTextarea"></textarea>
                                        <label for="floatingTextarea">Add Note...</label>
                                    </div>
                                    <div className="d-flex justify-content-end gap-[10px] mt-2">
                                        <button type="button" className="btn" data-bs-toggle="button">Cancel</button>
                                        <Button>Add</Button>
                                    </div>
                                    <div className="d-flex justify-content-between gap-[10px] mt-2">
                                        <div className="d-flex justify-content-between w-100">
                                            <div>
                                                <div>
                                                <p style={{ fontSize: "14px" }}>Using suite for headshots</p>
                                                    <p className="m-0" style={{ fontSize: "14px",color: "gray" }}>by Kimberlie Rodriguez, Mar 5, 2024</p>
                                                </div>
                                                <div>
                                                    <p className="m-0" style={{ fontSize: "14px",color: "gray" }}>Noted on. <span style={{ color: "#0dcaf0" }}>Appointment: March 7, 2024 - 12:45pm, Restalyne Filler (60 minutes)</span></p>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-[10px] align-items-center" style={{ listStyle: "none" }}>
                                                <Star />
                                                <OverlayTrigger trigger="click" placement="left" overlay={popoverHeadshot()} >
                                                    <Ellipsis size={200} />
                                                </OverlayTrigger>
                                            </div>
                                        </div>
                                    </div>
                            </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
}

const AddRelationShip = ({ showModal, handleClose, handleSearchClients, searchQuery, searchedClients, handleNullValues }) => {
    return <div>
        <Modal show={showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Select Client</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <p className="fs-6">Use the search field below to search the Client to add a relationship</p>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1"><Search /></span>
                    <input type="text" className="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" value={searchQuery} onChange={handleSearchClients} />
                </div>
                <div className="overflow-scroll no-scrollbar" style={{ maxHeight: "300px", border: "none" }}>
                    {searchQuery?.length > 0 ? (
                        searchedClients?.length > 0 ? (
                            searchedClients.map((client, index) => (
                                <div key={index} className="d-flex flex-column gap-[10px]"><SearchedClientsCard client={client} handleNullValues={handleNullValues} /></div>
                            ))
                        ) : (
                            <div className="mt-2"><SearchedClientsPlaceholder /></div>
                        )
                    ) : null}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
};
const SearchedClientsPlaceholder = () => {
    return <Card>
        <Card.Body>
            <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder>
        </Card.Body>
    </Card>
};
const SearchedClientsCard = ({ client, handleNullValues }) => {
    return <Card className="mt-2 p-1">
        <Card.Body className="p-1">
            <Card.Title className="mb-0" style={{ fontSize: "14px" }}>{client.name}</Card.Title>
            <Card.Text className="d-flex mb-0 justify-content-start align-items-center"><Smartphone color="gray" size={15} />{handleNullValues(client.phone_number)}</Card.Text>
            <Card.Text className="d-flex"><CalendarDays color="gray" size={15} />{handleNullValues(client.phone_number)}</Card.Text>
        </Card.Body>
    </Card>
};
const SurveySetup = ({ open, handleSurveySetupModal, handleSurveySetupChange,surveySetup }) => {
    return <Modal show={open} onHide={handleSurveySetupModal}>
        <Modal.Header closeButton>
            <Modal.Title>Survey Set Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p style={{ color: "gray", fontSize: "14px" }}>Choose a survey to add to this patient profile or <span style={{ color: "#0dcaf0" }}>view and edit surveys from settings</span></p>
            <Form.Select aria-label="Default select example" onChange={handleSurveySetupChange} value={surveySetup}>
                <option>Select an option</option>
                <option value="1">COVID-19 screening</option>
            </Form.Select>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleSurveySetupModal}>
                Close
            </Button>
            <Button variant="primary" onClick={handleSurveySetupModal}>
                Save
            </Button>
        </Modal.Footer>
    </Modal>
}
export default ClientProfile