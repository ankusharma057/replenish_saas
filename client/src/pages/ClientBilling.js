import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createSaveCardCheckoutSession,
  fetchCreditCards as fetchCreditCardsAPI,
  removeCreditCard as removeCreditCardAPI,
  fetchConfig,
  getEmployeesOnly,
  getLocationsWithoutEmployee
} from "../Server";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { ChevronDown, Mail, Printer, PrinterIcon, Search, Settings, Settings2, SlidersHorizontal, X } from "lucide-react";
import { Badge, Button, ButtonGroup, Col, Collapse, Dropdown, DropdownButton, Form, FormControl, InputGroup, ListGroup, Offcanvas, Overlay, OverlayTrigger, Placeholder, Popover, Row, SplitButton, Table } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import CountUp from 'react-countup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BiSolidDownArrow } from 'react-icons/bi';
import moment from 'moment';
import { IoMdArrowDropdown } from "react-icons/io";

const ClientBilling = ({ stripeClientId, clientId, setCurrentTab }) => {
  const hasFetchedSession = useRef(false);
  const [creditCards, setCreditCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');
  const [clientSecret, setClientSecret] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkoutSessionUrl, setCheckoutSessionUrl] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDetailDrawerOpen, setIsCardDetailDrawerOpen] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [flipLeftCardIndex, setflipLeftCardIndex] = useState(null)
  const [flipRightCardIndex, setFlipRightCardIndex] = useState(null)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dateRangeRef = useRef(null);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [serviceLocation, setServiceLocation] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [enablePaymentSearch, setEnablePaymentSearch] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [allLocations, setAllLocations] = useState([]);
  const [purchaseDetails,setPurchaseDetails]=useState(false)
  const topleftCardsData = [
    {
      id: 1,
      count: 6,
      label: "Total Booking",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 2,
      count: 0,
      label: "Upcomming appointment",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 3,
      count: 1,
      label: "No Shows",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 4,
      count: 5,
      label: "Month since last visit",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
  ];
  const topRightCardsData = [
    {
      id: 1,
      count: 685.00,
      label: "Total Booking",
      backLabel: "Recieve Payments",
      targetTab: "Appointments"
    },
    {
      id: 2,
      count: 0.00,
      label: "Upcomming appointment",
      backLabel: "View Credit",
      targetTab: "Billing"
    },
    {
      id: 3,
      count: 833.000,
      label: "No Shows",
      backLabel: "View Purchases",
      targetTab: "Billing"
    },
  ];
  

  const toggleDrawerHandler = () => {
    setIsOpen(!isOpen);
  };


  useEffect(() => {
      async function loadConfig() {
      const publicKey = await fetchConfig();
      setStripePublicKey(publicKey);
      }
      loadConfig();
      getEmployees();
      getAllEmployeeLocation();
  }, []);

  useEffect(() => {
      if (stripePublicKey) {
        setStripePromise(loadStripe(stripePublicKey));
      }
  }, [stripePublicKey]);
  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesOnly(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllLocations = async (refetch = false) => {
    try {
      const { data } = await getEmployeesOnly(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllEmployeeLocation = async (employeeId, refetch = false) => {
    const { data } = await getLocationsWithoutEmployee(employeeId, refetch);
    if (data?.length > 0) {
      setServiceLocation(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };
  const fetchCreditCards = async () => {
    try {
      const data = await fetchCreditCardsAPI(stripeClientId, clientId);
      setCreditCards(data);
    } catch (error) {
      handleError("Error fetching credit cards:", error);
    }
  };
  
  const removeCreditCard = async (paymentMethodId) => {
    try {
      await removeCreditCardAPI(paymentMethodId);
      setCreditCards(prevCards => prevCards.filter(card => card.id !== paymentMethodId));
      setIsCardDetailDrawerOpen(false);
      toast.success("Card Removed Successfully!");
    } catch (error) {
      handleError("Error removing credit card:", error);
    }
  };
  
  const handleError = (message, error) => {
    toast.error(`${message} ${error.message}`);
    setError(error.message);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'creditCards') {
      fetchCreditCards();
    }
  };

  const navigate = useNavigate()

  const toggleDrawer = async () => {
    try {
      const { clientSecret, checkoutUrl } = await createSaveCardCheckoutSession(stripeClientId, clientId);

      if (checkoutUrl) {
        setCheckoutSessionUrl(checkoutUrl);
      }

      if (clientSecret) {
        setClientSecret(clientSecret);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      toast.error("Error creating checkout session:", error);
    }
  };


  const tabs = [
    { id: 'purchases', label: 'Purchases' },
    { id: 'payments', label: 'Payments' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'creditMemos', label: 'Credit Memos' },
    { id: 'giftCards', label: 'Gift Cards' },
    { id: 'creditCards', label: 'Credit Cards' },
    { id: 'packagesMemberships', label: 'Packages & Memberships' },
  ];
  const statusOptions = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Unpaid / Unsubmitted", value: "unpaid_unsubmitted" },
    { label: "Submitted", value: "submitted" },
    { label: "Rejected", value: "rejected" },
    { label: "No Charge", value: "no_charge" },
    { label: "All Outstanding", value: "all_outstanding" },
    { label: "All Private Outstanding", value: "all_private_outstanding" },
    { label: "All Claims Outstanding", value: "all_claims_outstanding" }
  ];
  const daysRangeOptions = [
    { label: "0 - 30 Days", value: "0_30_days" },
    { label: "31 - 60 Days", value: "31_60_days" },
    { label: "61 - 90 Days", value: "61_90_days" },
    { label: "91 - 120 Days", value: "91_120_days" },
    { label: "120+ Days", value: "120_plus_days" }
  ];
  const getEndDateMinDate = () => {
    if (startDate) {
      return getNextDay(startDate);
    }
    return null;
  };
  const getNextDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };
  const handleToggle = (event) => {
    setShow(!show);
  };
  const handlePaymentsSearch=()=>{
    setEnablePaymentSearch(!enablePaymentSearch)
  };
  const filteredLocationItems = serviceLocation.filter((item) =>
    item.label.toLowerCase().includes(searchLocation.toLowerCase())
  );
  const handlePurchaseDetails=()=>{
    setPurchaseDetails(!purchaseDetails)
  }
  const Purchases = () => {
    return <div>
      <PurchaseDetails />
      <div >
        <div className={"w-100 py-3 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div>
                <ButtonGroup style={{ border: "none" }}>
                  <Button aria-controls="example-collapse-text" aria-expanded={isOpen} className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={toggleDrawerHandler}><Settings size={20} />Filter</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>0 Purchase Selected</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>Select All</Button>
                </ButtonGroup>
              </div>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div className='d-flex justify-content-end align-items-center gap-[10px] pr-3'>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Mail size={20} color='black' />Pay Balance</Button>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Printer size={20} color='#111' />Statement</Button>
              </div>
            </Col>
          </Row>
        </div>
        {isOpen &&
          <div className='collapseContainer mt-0'>
            <div className={"w-100 p-3 rounded d-flex gap-[15px]"} style={{ backgroundColor: "rgb(247 245 245)" }} id="example-collapse-text">
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'>
                  {serviceLocation.map((item) => {
                    return <option value={item.value}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Form.Control
                  size='sm'
                  placeholder="Invoice Number"
                  aria-label="Username"
                  aria-describedby="basic-addon1"
                />
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'>
                  <option>All Staff</option>
                  {employeeList.map((employee) => {
                    return <option value={employee.name}>{employee.name}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'>
                  <option>Status</option>
                  {statusOptions.map((item) => {
                    return <option value={item.value}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div className="d-flex justify-content-start align-items-center">
                <OverlayTrigger
                  trigger="click"
                  placement="top"
                  overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                    <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                      <div className="d-flex justify-content-between gap-3 align-items-center">
                        <div>
                          <label>Start Date:</label>
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                            dateFormat="yyyy/MM/dd"
                            inline
                          />
                        </div>
                        <div>
                          <label>End Date:</label>
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                            dateFormat="yyyy/MM/dd"
                            inline
                            minDate={getEndDateMinDate()}
                            disabled={!startDate}
                          />
                        </div>
                      </div>
                    </Popover.Body>
                  </Popover>}
                  rootClose
                >
                  <Button
                    variant="outline-secondary"
                    style={{
                      fontSize: "12px",
                      width: "150px",
                      border: "1px solid #dee2e6",
                      backgroundColor: "#fff",
                    }}
                  >
                    Select Date Range
                  </Button>
                </OverlayTrigger>
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'>
                  <option>All Invoices Ages</option>
                  {daysRangeOptions.map((item) => {
                    return <option value={item.label}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Button variant="outline-secondary" size='sm' style={{ border: "1px solid #dee2e6", backgroundColor: "#fff" }}>Clear</Button>
              </div>
            </div>
          </div>}
        <div>
          <Table responsive="sm">
            <thead>
              <tr>
                <th style={{ color: "#22D3EE" }}>Date</th>
                <th style={{ color: "#22D3EE" }}>Item</th>
                <th style={{ color: "#22D3EE" }}>Staff Member</th>
                <th style={{ color: "#22D3EE" }}>Invoice</th>
                <th style={{ color: "#22D3EE" }}>Status</th>
                <th style={{ color: "#22D3EE" }}>Amount</th>
                <th style={{ color: "#22D3EE" }}>Balance</th>
                <th style={{ color: "#22D3EE" }}></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nov 12 2024</td>
                <td>ICare Jenny</td>
                <td>Ashrut Dev</td>
                <td>Client Invoice 6039-01 Test Account</td>
                <td>Unpaid</td>
                <td>$75.00</td>
                <td>Balance</td>
                <td>
                  <div className='d-flex border rounded justify-content-between align-items-center'>
                    <Button variant='outline-secondary' style={{ border: "none" }} size='sm' className='w-100' onClick={handlePurchaseDetails}>View</Button>
                    <OverlayTrigger
                      trigger="click"
                      key={"top"}
                      placement={"top"}
                      overlay={
                        <Popover id={`popover-positioned-top`}>
                          <Popover.Body>
                            <div>
                              <strong>Receive Client Payment</strong>
                              <hr />
                            </div>
                            <div>
                              <p>Print Receipt (Quick)</p>
                              <p>Print Receipt (Options)</p>
                              <p>Print Receipt (Detailed)</p>
                              <hr />
                            </div>
                            <div>
                              <p>Email Receipt (Options)</p>
                              <p>Email Receipt (Detailed)</p>
                              <hr />
                            </div>
                            <div>
                              <p>Delete Purchase...</p>
                              <hr />
                            </div>
                            <div>
                              <p>View Sale</p>
                            </div>
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <ChevronDown size={20} color='#979a9c' style={{ marginRight: "10px" }} />
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  }
  const PurchaseDetails = () => {
    return <div>
      <Offcanvas show={purchaseDetails} onHide={handlePurchaseDetails} placement='end'>
        <Offcanvas.Header>
          <div className='d-flex justify-content-between align-items-center'>
            <div className='d-flex justify-content-start align-items-center'>
              <Offcanvas.Title>Purchase</Offcanvas.Title><Badge bg="secondary" style={{backgroundColor:"#fba919",color:"black"}}>Unpaid</Badge>
            </div>
            <div className='d-flex gap-[8px] align-items-center'>
              <Button variant='outline-secondary'>View Sale</Button>
              <SplitButton
                key={"Primary"}
                id={`dropdown-split-variants-${variant}`}
                variant={"Primary"}
                title={variant}
              >
                <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                <Dropdown.Item eventKey="3" active>
                  Active Item
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
              </SplitButton>
            </div>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          Some text as placeholder. In real life you can have the elements you
          have chosen. Like, text, images, lists, etc.
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  };
  const Payments = () => {
    return <div>
      <div className={"w-100 py-3 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
        <Row>
          <Col xs={6} sm={6} md={6} lg={6}>
            <div>
              <ButtonGroup style={{ border: "none" }}>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={handlePaymentsSearch}><Search size={20} />Filter</Button>
                <DropdownButton
                  id={`dropdown-variants-Secondary`}
                  variant={'Secondary'}
                  title={'All Locations'}
                >
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    className="mx-3 my-2 w-auto"
                    onChange={(e) => setSearchLocation(e.target.value)}
                    value={searchLocation}
                  />
                  {filteredLocationItems.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <DropdownButton
                  id={`dropdown-variants-Secondary`}
                  variant={'Secondary'}
                  title={'All Payments Method'}
                >
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    className="mx-3 my-2 w-auto"
                    onChange={(e) => setSearchLocation(e.target.value)}
                    value={searchLocation}
                  />
                  {filteredLocationItems.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <DropdownButton
                  id={`dropdown-variants-Secondary`}
                  variant={'Secondary'}
                  title={'All Balances'}
                >
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    className="mx-3 my-2 w-auto"
                    onChange={(e) => setSearchLocation(e.target.value)}
                    value={searchLocation}
                  />
                  {filteredLocationItems.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <DropdownButton
                  id={`dropdown-variants-Secondary`}
                  variant={'Secondary'}
                  title={'Payments'}
                >
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    className="mx-3 my-2 w-auto"
                    onChange={(e) => setSearchLocation(e.target.value)}
                    value={searchLocation}
                  />
                  {filteredLocationItems.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                      <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                        <div className="d-flex justify-content-between gap-3 align-items-center">
                          <div>
                            <label>Start Date:</label>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                            />
                          </div>
                          <div>
                            <label>End Date:</label>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                              minDate={getEndDateMinDate()}
                              disabled={!startDate}
                            />
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>}
                    rootClose
                  >
                    <Button
                      variant="outline-secondary"
                      style={{
                        fontSize: "12px",
                        width: "150px",
                        border: "1px solid #dee2e6",
                        backgroundColor: "#fff",
                      }}
                    >
                      Select Date Range
                    </Button>
                  </OverlayTrigger>
                </Button>
              </ButtonGroup>
            </div>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6}>
            <div className='d-flex justify-content-end align-items-center gap-[10px] pr-3'>
              <DropdownButton
                key={'Secondary'}
                variant={'Secondary'}
                title={'Selected(0)'}
                className='border rounded'
              >
                <Dropdown.Item eventKey="1">Action</Dropdown.Item>
                <Dropdown.Item eventKey="2">Another action</Dropdown.Item>
                <Dropdown.Item eventKey="3" active>
                  Active Item
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item eventKey="4">Separated link</Dropdown.Item>
              </DropdownButton>
            </div>
          </Col>
        </Row>

      </div>
      {enablePaymentSearch &&
        <div className='p-2 mt-3 border rounded'>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div>
                <InputGroup>
                  <InputGroup.Text id="basic-addon1"><Search size={20} /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search by Reference Number..."
                  />
                </InputGroup>
              </div>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6} className='px-0'>
              <div className='d-flex justify-content-end align-items-center gap-[10px] pr-3'>
                <InputGroup>
                  <InputGroup.Text id="basic-addon1"><Search size={20} /></InputGroup.Text>
                  <Form.Control
                    placeholder="Search by Amount..."
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>
        </div>}
      <div>
        <Table responsive="sm">
          <thead>
            <tr>
              <th style={{ color: "#22D3EE" }}>Payment Date</th>
              <th style={{ color: "#22D3EE" }}>Method</th>
              <th style={{ color: "#22D3EE" }}>Location</th>
              <th style={{ color: "#22D3EE" }}>Reference Number</th>
              <th style={{ color: "#22D3EE" }}>Total</th>
              <th style={{ color: "#22D3EE" }}>Applied To</th>
              <th style={{ color: "#22D3EE" }}>Balance Remaining</th>
              <th style={{ color: "#22D3EE" }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
              <td>$75.00</td>
              <td><span style={{ color: "#22D3EE" }}>Invoice#5019-P19</span>$10</td>
              <td>
                <div className='d-flex border rounded justify-content-between align-items-center'>
                  <Button variant='outline-secondary' style={{ border: "none" }} size='sm' className='w-100'>View</Button>
                  <OverlayTrigger
                    trigger="click"
                    key={"top"}
                    placement={"top"}
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Body className='p-0'>
                          <ListGroup>
                            <ListGroup.Item className='d-flex align-items-center'><PrinterIcon size={15} />Print (Quick)</ListGroup.Item>
                            <ListGroup.Item className='d-flex align-items-center'><PrinterIcon size={15} />Print (Optional)</ListGroup.Item>
                            <ListGroup.Item className='d-flex align-items-center'><Mail size={15} />Email Receipt</ListGroup.Item>
                          </ListGroup>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <ChevronDown size={20} color='#979a9c' style={{ marginRight: "10px" }} />
                  </OverlayTrigger>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  };
  const Receipts = () => {
    return <div>
      <div className={"w-100 py-2 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
        <Row>
          <Col xs={6} sm={6} md={6} lg={6}>
            <div>
              <ButtonGroup style={{ border: "none" }}>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={handlePaymentsSearch}><SlidersHorizontal size={20} /></Button>
                <DropdownButton
                  id={`dropdown-variants-Secondary`}
                  variant={'Secondary'}
                  title={'All Locations'}
                >
                  <FormControl
                    type="text"
                    placeholder="Search..."
                    className="mx-3 my-2 w-auto"
                    onChange={(e) => setSearchLocation(e.target.value)}
                    value={searchLocation}
                  />
                  {filteredLocationItems.map((item) => (
                    <Dropdown.Item key={item.key} eventKey={item.key}>
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                      <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                        <div className="d-flex justify-content-between gap-3 align-items-center">
                          <div>
                            <label>Start Date:</label>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                            />
                          </div>
                          <div>
                            <label>End Date:</label>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                              minDate={getEndDateMinDate()}
                              disabled={!startDate}
                            />
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>}
                    rootClose
                  >
                    <Button
                      variant="outline-secondary"
                      style={{
                        fontSize: "12px",
                        width: "150px",
                        border: "1px solid #dee2e6",
                        backgroundColor: "#fff",
                      }}
                    >
                      Select Date Range
                    </Button>
                  </OverlayTrigger>
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>
      </div>
      <div>
        <Table responsive="sm">
          <thead>
            <tr>
              <th style={{ color: "#22D3EE" }}>Date</th>
              <th style={{ color: "#22D3EE" }}>Location</th>
              <th style={{ color: "#22D3EE" }}>Items</th>
              <th style={{ color: "#22D3EE" }}>Payments Methods</th>
              <th style={{ color: "#22D3EE" }}>Total</th>
              <th style={{ color: "#22D3EE" }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
              <td>
                <div className='d-flex border rounded justify-content-between align-items-center'>
                  <Button variant='outline-secondary' style={{ border: "none" }} size='sm' className='w-100'>View</Button>
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  };
  const CreditMemo = () => {
    return <div>
      <div className={"w-100 py-2 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
        <Row>
          <Col xs={6} sm={6} md={6} lg={6}>
            <div>
              <ButtonGroup style={{ border: "none" }}>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={handlePaymentsSearch}><SlidersHorizontal size={20} /></Button>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                      <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                        <div className="d-flex justify-content-between gap-3 align-items-center">
                          <div>
                            <label>Start Date:</label>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                            />
                          </div>
                          <div>
                            <label>End Date:</label>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                              minDate={getEndDateMinDate()}
                              disabled={!startDate}
                            />
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>}
                    rootClose
                  >
                    <Button
                      variant="outline-secondary"
                      style={{
                        fontSize: "12px",
                        width: "150px",
                        border: "1px solid #dee2e6",
                        backgroundColor: "#fff",
                      }}
                    >
                      Select Date Range
                    </Button>
                  </OverlayTrigger>
                </Button>
              </ButtonGroup>
            </div>
          </Col>
        </Row>
      </div>
      <div>
        <Table responsive="sm">
          <thead>
            <tr>
              <th style={{ color: "#22D3EE" }}>Date</th>
              <th style={{ color: "#22D3EE" }}>Credit Memo #</th>
              <th style={{ color: "#22D3EE" }}>Credit</th>
              <th style={{ color: "#22D3EE" }}>Description</th>
              <th style={{ color: "#22D3EE" }}>Total</th>
              <th style={{ color: "#22D3EE" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
              <td>$75.00</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  };
  const GiftCards = () => {
    return <div>
      <div className={"w-100 rounded"}>
        <Row>
          <Col xs={12} sm={12} md={12} lg={12}>
            <div>
              <p style={{ color: "#696977" }}>Scan a gift card or enter the number from the card to find a gift card. View a gift card to load and redeem it.</p>
              <InputGroup className="">
                <InputGroup.Text id="basic-addon1"><Search size={20} color='#e5e7eb' /></InputGroup.Text>
                <Form.Control
                  placeholder="Enter a new or existing gift card number..."
                  aria-label="Username"
                />
              </InputGroup>
            </div>
          </Col>
        </Row>
      </div>
      <div>
        <Table responsive="sm">
          <thead>
            <tr>
              <th style={{ color: "#22D3EE" }}>Date Created</th>
              <th style={{ color: "#22D3EE" }}>Number</th>
              <th style={{ color: "#22D3EE" }}>Date Last Used</th>
              <th style={{ color: "#22D3EE" }}>Details</th>
              <th style={{ color: "#22D3EE" }}>Transaction</th>
              <th style={{ color: "#22D3EE" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
              <td>$75.00</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  };
  const CreditCards = () => {
    return (
      <div className="py-8">
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <button
              className="bg-[#22D3EE] text-white py-2 px-4 rounded hover:bg-[#1cb3cd] transition duration-200"
              onClick={toggleDrawer}
            >
              Add Credit Card
            </button>
          </div>
          <table className="min-w-full table-auto bg-white border border-gray-200 shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 font-medium text-gray-600">Integration</th>
                <th className="px-4 py-2 font-medium text-gray-600">Nickname</th>
                <th className="px-4 py-2 font-medium text-gray-600">Card Type</th>
                <th className="px-4 py-2 font-medium text-gray-600">Card Number</th>
                <th className="px-4 py-2 font-medium text-gray-600">Expiry</th>
                <th className="px-4 py-2 font-medium text-gray-600">Last Used</th>
                <th className="px-4 py-2 font-medium text-gray-600">Locations</th>
                <th className="px-4 py-2 font-medium text-gray-600">Date Added</th>
                <th className="px-4 py-2 font-medium text-gray-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {creditCards.length > 0 ? (
                creditCards.map((card) => (
                  <tr key={card.id} className="border-t">
                    <td className="px-4 py-2 text-gray-700">{card.name}</td>
                    <td className="px-4 py-2 text-gray-700">{card.nickname || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-700">{card.cardType}</td>
                    <td className="px-4 py-2 text-gray-700">**** **** **** {card.cardNumber}</td>
                    <td className="px-4 py-2 text-gray-700">{card.expiry}</td>
                    <td className="px-4 py-2 text-gray-700">{card.lastUsed || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <ul className="p-0">
                        {card.locations && card.locations.length > 0 ? (
                          card.locations.map((location, i) => (
                            <li key={i}>{location}</li>
                          ))
                        ) : (
                          <li>N/A</li>
                        )}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{card.dateAdded}</td>
                    <td>
                      <button
                        className="border border-black px-2 py-1 rounded-md text-sm"
                        onClick={() => {
                          setSelectedCard(card);
                          setIsCardDetailDrawerOpen(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-2 text-center text-gray-700">No saved credit cards found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  const PackageAndMembership = () => {
    return <div>
      <div className={"w-100 py-2 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
        <Row>
          <Col xs={6} sm={6} md={6} lg={6}>
            <div>
              <ButtonGroup style={{ border: "none" }}>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={handlePaymentsSearch}><SlidersHorizontal size={20} /></Button>
                <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>
                  <OverlayTrigger
                    trigger="click"
                    placement="top"
                    overlay={<Popover id="date-picker-popover" style={{ width: "550px", marginLeft: "-70px", border: "none" }}>
                      <Popover.Body style={{ width: "550px", backgroundColor: "#fff", border: "1px solid #eee" }}>
                        <div className="d-flex justify-content-between gap-3 align-items-center">
                          <div>
                            <label>Start Date:</label>
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                            />
                          </div>
                          <div>
                            <label>End Date:</label>
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(moment(date).format("YYYY/MM/DD"))}
                              dateFormat="yyyy/MM/dd"
                              inline
                              minDate={getEndDateMinDate()}
                              disabled={!startDate}
                            />
                          </div>
                        </div>
                      </Popover.Body>
                    </Popover>}
                    rootClose
                  >
                    <div className='d-flex justify-content-start align-items-center'>
                      Select Date Range<IoMdArrowDropdown />
                    </div>
                  </OverlayTrigger>
                </Button>
                <DropdownButton
                  as={ButtonGroup}
                  key={'Secondary'}
                  variant={'Secondary'}
                  title={'All Payments'}
                >
                  <Dropdown.Item onClick={(e) => e.stopPropagation()} eventKey="1" className='d-flex justify-content-between align-items-center'>All Payments <Form.Check type={"checkbox"} /></Dropdown.Item>
                  <Dropdown.Item onClick={(e) => e.stopPropagation()} eventKey="1" className='d-flex justify-content-between align-items-center'>Purchased <Form.Check type={"checkbox"} /></Dropdown.Item>
                  <Dropdown.Item onClick={(e) => e.stopPropagation()} eventKey="1" className='d-flex justify-content-between align-items-center'>Refunded <Form.Check type={"checkbox"} /></Dropdown.Item>
                </DropdownButton>
              </ButtonGroup>
            </div>
          </Col>
        </Row>
      </div>
      <div>
        <Table responsive="sm">
          <thead>
            <tr>
              <th style={{ color: "#22D3EE" }}>Date Purchased</th>
              <th style={{ color: "#22D3EE" }}>Type</th>
              <th style={{ color: "#22D3EE" }}>Name</th>
              <th style={{ color: "#22D3EE" }}>Usage</th>
              <th style={{ color: "#22D3EE" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  };

  const tabContent = {
    purchases: <div><Purchases/></div>,
    payments: <div><Payments/></div>,
    receipts: <div><Receipts/></div>,
    creditMemos: <div><CreditMemo/></div>,
    giftCards: <div><GiftCards/></div>,
    creditCards: <div><CreditCards/></div>,
    packagesMemberships: <div><PackageAndMembership/></div>,
  };

  useEffect(() => {
    if (hasFetchedSession.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      hasFetchedSession.current = true;
      fetch(`/api/client/stripe/card_success?session_id=${sessionId}`)
        .then((response) => {
          if (response.ok) {
            toast.success('Card Added Successfully');
            setActiveTab('creditCards');
            fetchCreditCards();

            urlParams.delete('session_id');
            navigate(`/customers/${clientId}?${urlParams.toString()}`, { replace: true });
          } else {
            toast.error('Error adding credit card');
          }
        })
        .catch((error) => toast.error('Error fetching payment details:', error));
    }
  }, [navigate]);

  useEffect(() => {
    if (checkoutSessionUrl) {
      window.location.href = checkoutSessionUrl;
    }
  }, [checkoutSessionUrl]);
  const handleLeftCardClick = (index) => {
    setflipLeftCardIndex(index)
};
const handleLeftCardOut = () => {
    setflipLeftCardIndex(null)
};
const handleRightCardClick = (index) => {
    setFlipRightCardIndex(index)
};
const handleRightCardOut = () => {
    setFlipRightCardIndex(null)
};
const handleClientProfileFlipCard=()=>{
  setCurrentTab("Appointments");
};
const formatAmount = (amount) => {
  const amountString = Number(amount).toFixed(2);
  const decimalPart = amountString.slice(-3);
  const mainAmount = amountString.slice(0, -3);
  return { mainAmount, decimalPart };
};


  return (
    <div className="">
      <Row xs={6} sm={6} md={6} lg={6} className="bg-white p-3 rounded">
        <Col className="w-50">
          <div className="d-flex justify-content-between align-items-center">
            {topleftCardsData.map((item, index) => {
              return <div onMouseOver={() => handleLeftCardClick(index)} onMouseOut={handleLeftCardOut} key={index} className="w-[110px] h-[110px] p-1">
                <ReactCardFlip isFlipped={flipLeftCardIndex === index} flipDirection="horizontal">
                  <div className="d-flex flex-column justify-content-between align-items-center">
                    <div className="h2 text-secondary">
                      <CountUp end={item.count} />
                    </div>
                    <div className="h6 text-center text-muted">{item.label}</div>
                  </div>
                  <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                    <p className=" fs-6 mb-0 text-center text-white">{item.backLabel}</p>
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
                      <span className="large"> <CountUp end={mainAmount} />{ }</span>
                      <span className="fs-6  mt-[4px]">{decimalPart}</span>
                    </div>
                    <div className="h6 text-center text-muted">{item.label}</div>
                  </div>
                  <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                    <p className="w-100 fs-6 mb-0 text-center text-white">{item.backLabel}</p>
                  </div>
                </ReactCardFlip>
              </div>
            })}
          </div>
        </Col>
      </Row>
      <Row xs={6} sm={6} md={6} lg={6} className="bg-white p-3 rounded mt-2">
        <Col xs={12} sm={12} md={12} lg={12}>
          <div className='d-flex justify-content-between align-items-center'>
            <div className="flex space-x-4 w-100" >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-auto p-1 font-medium ${activeTab === tab.id
                    ? 'border-b-2 border-cyan-500 text-cyan-500'
                    : 'text-gray-500'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button size='sm' className='w-[130px] h-[35px]'>New Purchase</Button>
          </div>
          <div className="mt-4 w-100">
            {tabContent[activeTab]}
          </div>
        </Col>
      </Row>
      <div className={`fixed top-0 right-0 h-full overflow-y-auto w-full lg:w-3/4 z-10 bg-[#EDEDED] shadow-lg p-6 transform transition-transform duration-300 ${isCardDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end items-center mb-4 pt-20">
          <button
            className="text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={() => setIsCardDetailDrawerOpen(false)}
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </div>

        {selectedCard ? (
          <div className='bg-white rounded-md p-4'>
            <h2 className="text-xl font-semibold text-[#696977]">MasterCard ending in {selectedCard.cardNumber.slice(-4)}</h2>

            <div className="grid grid-cols-4 gap-x-4 border-gray-200 pt-2">
              <div className="col-span-4">
                <span className="text-sm text-[#696977]">Card Number</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">XXXX XXXX XXXX {selectedCard.cardNumber.slice(-4)}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Expiry Month</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">{selectedCard.expiry.slice(0, 2)}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Expiry Year</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">{selectedCard.expiry.slice(-4)}</p>
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Security Code</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">CCV</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
                onClick={() => removeCreditCard(selectedCard.paymentMethodId)}
                aria-label="Remove Credit Card"
              >
                Remove Credit Card
              </button>
            </div>
          </div>
        ) : (
          <p>Loading card details...</p>
        )}
      </div>

      <div className={`fixed top-0 right-0 h-full overflow-y-auto w-full lg:w-1/2 z-10 bg-white shadow-lg p-6 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end items-center mb-4 pt-20">
          <button
            className="text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </div>

        {clientSecret ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        ) : (
          <p>Loading payment details...</p>
        )}
      </div>
    </div>
  );
};

export default ClientBilling;