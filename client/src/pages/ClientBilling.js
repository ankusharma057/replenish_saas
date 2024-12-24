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
  getLocationsWithoutEmployee,
  clientBillingPurchases,
  printPurchasePdf,
  sendPurchaseEmail,
  getProductsList
} from "../Server";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { ArrowRightLeft, CalendarDays, ChevronDown, LogOut, Mail, Phone, Printer, PrinterIcon, Search, Settings, SlidersHorizontal, Smartphone, UserRound, X,XSquare } from "lucide-react";
import { Badge, Button, ButtonGroup, Col, Collapse, Dropdown, DropdownButton, Form, FormControl, InputGroup, ListGroup, Modal, Offcanvas, Overlay, OverlayTrigger, Placeholder, Popover, Row, SplitButton, Table } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import CountUp from 'react-countup';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BiSolidDownArrow } from 'react-icons/bi';
import moment from 'moment';
import { IoMdArrowDropdown } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { FaLinkSlash, FaPencil, FaRegBuilding, FaRegCalendarDays, FaRegCreditCard } from 'react-icons/fa6';
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";


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
  const [purchaseDetails,setPurchaseDetails]=useState(false);
  const [purchaseDetailsContent,setPurchaseDetailsContent]=useState(null);
  const [paymentDetails,setPaymentDetails]=useState(false);
  const [purchaseDate,setPurchaseDate]=useState(Date())
  const [enableAppliedCalender,setEnableAppliedCalender]=useState(false)
  const [enableAppliedHistoryCalender,setEnableAppliedHistoryCalender]=useState(false)
  const [clientPurchases,setClientPurchases]=useState([])
  const [purchaseChangeEmployee,setPurchaseChangeEmployee]=useState(false)
  const [purchaseSearch,setPurchaseSearch]=useState("")
  const [locationFilter,setLocationFilter]=useState("")
  const [invoiceNumberFilter,setInvoiceNumberFilter]=useState("")
  const [employeeFilter,setEmployeeFilter]=useState("")
  const [statusFilter,setStatusFilter]=useState("")
  const [agesFilter,setAgesFilter]=useState("")
  const [showDateRangeSelector,setShowDateRangeSelector]=useState(false)
  const wrapperRef = useRef(null);
  const [showNewPurchaseSlider, setShowNewPurchaseSlider] = useState(false)
  const [showPayBalance, setShowPayBalance] = useState(false)
  const [showAddStaffModal, setShowAddStaffModal] = useState(false)
  const [showNewPurchaseSliderLocation, setShowNewPurchaseSliderLocation] = useState("")
  const [showNewPurchaseSliderProductSearch, setShowNewPurchaseSliderProductSearch] = useState("")
  const [productList, setProductList] = useState([])
  const [selectedProductsIds, setSelectedProductsIds] = useState([])
  const [purchaseFilterPayload, setPurchaseFilterPayload] = useState({
    location_id: "",
    employee_id: "",
    is_paid: "",
    start_date: "",
    end_date: "",
    invoice_age: ""
  })
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
      getClientBillingPurchases();
      getAllProducts();
  }, []);

  useEffect(() => {
      if (stripePublicKey) {
        setStripePromise(loadStripe(stripePublicKey));
      }
  }, [stripePublicKey]);
  const getAllProducts=async()=>{
    let response = await getProductsList()
    setProductList(response.data)
  };
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
  const getClientBillingPurchases = async () => {
    try {
      const data = await clientBillingPurchases(clientId, purchaseFilterPayload)
      if (Array.isArray(data)) {
        setClientPurchases(data)
      } else if (data.message) {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Error in getClientBillingPurchases:", error.message);
      toast.error(error.message);
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
    // { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Unpaid", value: "unpaid" },
    // { label: "Submitted", value: "submitted" },
    // { label: "Rejected", value: "rejected" },
    // { label: "No Charge", value: "no_charge" },
    // { label: "All Outstanding", value: "all_outstanding" },
    // { label: "All Private Outstanding", value: "all_private_outstanding" },
    // { label: "All Claims Outstanding", value: "all_claims_outstanding" }
  ];
  const daysRangeOptions = [
    { label: "0 - 30 Days", value: "0-30" },
    { label: "31 - 60 Days", value: "31-60" },
    { label: "61 - 90 Days", value: "61-90" },
    { label: "91 - 120 Days", value: "91-120" },
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
  const handlePurchaseDetails=(purchaseId)=>{
    let purchaseItem = clientPurchases.find((item)=>item.id === purchaseId);
    if(purchaseItem){
      setPurchaseDetailsContent(purchaseItem)
      setPurchaseDetails(!purchaseDetails)
    }
  }
  const handlePurchaseDetailsClose=()=>{
    setPurchaseDetailsContent(null)
    setPurchaseDetails(!purchaseDetails)
  }
  const handlePaymentDetails=()=>{
    setPaymentDetails(!paymentDetails)
  };
  const handleAppliedCalender=()=>{
    setEnableAppliedCalender(!enableAppliedCalender)
  };
  const handleAppliedHistoryCalender=()=>{
    setEnableAppliedHistoryCalender(!enableAppliedHistoryCalender)
  };
  const handlePurchaseChangeEmployee=()=>{
    setPurchaseDetails(!purchaseDetails)
    setPurchaseChangeEmployee(!purchaseChangeEmployee)
  };
  let filterEmployeeList =employeeList.filter((item) =>
    item.name.toLowerCase().startsWith(purchaseSearch?.toLowerCase())
  );;
  const handlePrintPdf = async (employeeId) => {
    let response = await printPurchasePdf(clientId, employeeId)
    const blobUrl = URL.createObjectURL(response);
    window.open(blobUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };
  const handleSendEmail = async (employeeId) => {
    let response = await sendPurchaseEmail(clientId, employeeId)
    if(response.status===200){
      toast.success(response.data.message)
    }else{
      toast.error(response.data.message)
    }
  };
   const handleLocationFilter =async(event)=>{
    let location = serviceLocation.find((item)=>item.label===event.target.value)
    if(location){
      setLocationFilter(event.target.value)
      await setPurchaseFilterPayload((prev)=>({
        ...prev,
        location_id:location.id
      }))
      getClientBillingPurchases()
    }
   };
   const handleInvoiceNumberFilter=(event)=>{
      setInvoiceNumberFilter(event.target.value)
      setPurchaseFilterPayload((prev)=>({
        ...prev,
        // location_id:location.id
      }))
   };
  const handleEmployeeFilter = async (event) => {
    if (event.target.value === "All Staff") {
      try {
        const data = await clientBillingPurchases(clientId, employeeFilter)
        if (Array.isArray(data)) {
          setClientPurchases(data)
        } else if (data.message) {
          toast.error(data.message)
        }
      } catch (error) {
        console.error("Error in getClientBillingPurchases:", error.message);
        toast.error(error.message);
      }
    } else {
      setEmployeeFilter(event.target.value)
      let employee = await employeeList.find((item) => item.name === event.target.value)
      if (employee) {
        setPurchaseFilterPayload((prev) => ({
          ...prev,
          employee_id: employee.id
        }))
        let payload = {
          ...purchaseFilterPayload,
          employee_id: employee.id
        }
        try {
          const data = await clientBillingPurchases(clientId, payload)
          if (Array.isArray(data)) {
            setClientPurchases(data)
          } else if (data.message) {
            toast.error(data.message)
          }
        } catch (error) {
          console.error("Error in getClientBillingPurchases:", error.message);
          toast.error(error.message);
        }
      }
    }
  };
   const handleStatusFilter=async(event)=>{
      setStatusFilter(event.target.value)
      setPurchaseFilterPayload((prev)=>({
        ...prev,
        is_paid:event.target.value==="Paid"?true:event.target.value==="Unpaid"?false:""
      }))
      let payload={
        ...purchaseFilterPayload,
        is_paid:event.target.value==="Paid"?true:event.target.value==="Unpaid"?false:""
      }
      try {
        const data = await clientBillingPurchases(clientId, payload)
        if (Array.isArray(data)) {
          setClientPurchases(data)
        } else if (data.message) {
          toast.error(data.message)
        }
      } catch (error) {
        console.error("Error in getClientBillingPurchases:", error.message);
        toast.error(error.message);
      }
   };
   const handleAgesFilter=(event)=>{
      setAgesFilter(event.target.value)
      setPurchaseFilterPayload((prev)=>({
        ...prev,
        invoice_age:event.target.value
      }))
   };
  const handleClear = async () => {
    setLocationFilter("");
    setInvoiceNumberFilter("");
    setEmployeeFilter("");
    setStatusFilter("");
    setAgesFilter("");
    setPurchaseFilterPayload({
      location_id: "",
      employee_id: "",
      is_paid: false,
      start_date: "",
      end_date: "",
      invoice_age: ""
    });
    let payload={}
    try {
      const data = await clientBillingPurchases(clientId, payload)
      if (Array.isArray(data)) {
        setClientPurchases(data)
      } else if (data.message) {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Error in getClientBillingPurchases:", error.message);
      toast.error(error.message);
    }
  };
  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowDateRangeSelector(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const isDateInRange = (date) => {
    return (
      startDate &&
      endDate &&
      moment(date).isBetween(moment(startDate), moment(endDate), "day", "[]")
    );
  };
  const customDayClassName = (date) => {
    if (moment(date).isSame(startDate, "day")) return "start-date";
    if (moment(date).isSame(endDate, "day")) return "end-date";
    if (isDateInRange(date)) return "in-range";
    return "";
  };
  const handlePurchaseStartDate = (date) => {
    setStartDate(date);
    setPurchaseFilterPayload((prev) => ({
      ...prev,
      start_date: moment(date).format('MM-DD-YYYY'),
    }))
    if (endDate && moment(date).isAfter(endDate)) {
      setEndDate(null);
      setPurchaseFilterPayload((prev) => ({
        ...prev,
        end_date: "",
      }))
    }
  };
  const handlePurchaseEndDate=async(date)=>{
    setEndDate(date);
    setPurchaseFilterPayload((prev)=>({
      ...prev,
      end_date: date,
    }));
    let payload={
      start_date: purchaseFilterPayload.start_date,
      end_date: moment(date).format('MM-DD-YYYY'),
    }
    try {
      const data = await clientBillingPurchases(clientId, payload)
      if (Array.isArray(data)) {
        setClientPurchases(data)
      } else if (data.message) {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Error in getClientBillingPurchases:", error.message);
      toast.error(error.message);
    }
    setShowDateRangeSelector(false);
  };
  const Purchases = () => {
    return <div>
      <PurchaseDetails />
      <PurchasePayBalance/>
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
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]' onClick={()=>setShowPayBalance(true)}><Mail size={20} color='black' />Pay Balance</Button>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Printer size={20} color='#111' />Statement</Button>
              </div>
            </Col>
          </Row>
        </div>
        {isOpen &&
          <div className='collapseContainer mt-0'>
            <div className={"w-100 p-3 rounded d-flex gap-[15px]"} style={{ backgroundColor: "rgb(247 245 245)" }} id="example-collapse-text">
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm' value={locationFilter} onChange={handleLocationFilter}>
                  {serviceLocation.map((item) => {                    
                    return <option value={item.label}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Form.Control
                  size='sm'
                  placeholder="Invoice Number"
                  aria-label="Username"
                  value={invoiceNumberFilter} 
                  onChange={handleInvoiceNumberFilter}
                />
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'value={employeeFilter}  onChange={handleEmployeeFilter}>
                  <option value ={"All Staff"}>All Staff</option>
                  {employeeList.map((employee,index) => {
                    return <option key={index} value={employee?.name}>{employee?.name}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm'value={statusFilter} onChange={handleStatusFilter}>
                  <option>---Status---</option>
                  {statusOptions.map((item) => {
                    return <option value={item.label}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div ref={wrapperRef} className="d-flex justify-content-start align-items-center position-relative">
                {/* <OverlayTrigger
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
                  rootClose={false}
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
                </OverlayTrigger> */}
                <Button
                  variant="outline-secondary"
                  style={{
                    fontSize: "12px",
                    width: "150px",
                    border: "1px solid #dee2e6",
                    backgroundColor: "#fff",
                  }}
                  onClick={() => setShowDateRangeSelector(!showDateRangeSelector)}
                >
                  Select Date Range
                </Button>
                {showDateRangeSelector &&
                  <div className="d-flex justify-content-between gap-3 align-items-center  position-absolute bg-white p-3 border rounded"
                    style={{
                      border: "1px solid red",
                      bottom: "50px",
                      right: "0px"
                    }}
                  >
                    <div>
                      <label>Start Date:</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                          handlePurchaseStartDate(date)
                        }}
                        inline
                        dayClassName={customDayClassName}
                      />
                    </div>
                    <div>
                      <label>End Date:</label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => {handlePurchaseEndDate(date);}}
                        inline
                        minDate={startDate}
                        disabled={!startDate}
                        dayClassName={customDayClassName}
                      />
                    </div>
                  </div>
                }
              </div>
              <div>
                <Form.Select style={{ width: "150px" }} aria-label="Default select example" size='sm' value={agesFilter} onChange={handleAgesFilter}>
                  <option>All Invoices Ages</option>
                  {daysRangeOptions.map((item) => {
                    return <option value={item.value}>{item.label}</option>
                  })}
                </Form.Select>
              </div>
              <div>
                <Button variant="outline-secondary" size='sm' style={{ border: "1px solid #dee2e6", backgroundColor: "#fff" }} onClick={handleClear}>Clear</Button>
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
              {Array.isArray(clientPurchases)? clientPurchases.map((purchase,index)=>{
                return <tr>
                <td>{moment(purchase.created_at).format("MMM DD YYYY")}</td>
                <td>ICare Jenny</td>
                <td>{purchase.employee_name}</td>
                <td>{purchase.client_name}-{purchase.id}-{purchase.employee_name}</td>
                <td>{purchase.is_paid?"Paid":"Unpaid"}</td>
                <td>${purchase.charge}</td>
                <td className='text-danger'>${purchase.charge}</td>
                <td>
                  <div className='d-flex border rounded justify-content-between align-items-center'>
                    <Button variant='outline-secondary' style={{ border: "none" }} size='sm' className='w-100' onClick={()=>handlePurchaseDetails(purchase.id)}>View</Button>
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
                              <p className='cursor-pointer' onClick={()=>handlePrintPdf(purchase.employee.id)}>Print Receipt (Quick)</p>
                              <p>Print Receipt (Options)</p>
                              <p>Print Receipt (Detailed)</p>
                              <hr />
                            </div>
                            <div>
                              <p className='cursor-pointer' onClick={()=>handleSendEmail(purchase.employee.id)}>Email Receipt (Options)</p>
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
              }): (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Invoices Found
                  </td>
                </tr>
              )
              }
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  };
  const PurchaseDetails = () => {
    return <div>
      <PurchaseChangeEmployee/>
      <Offcanvas show={purchaseDetails} onHide={handlePurchaseDetailsClose} placement='end' style={{ width: "80%", backgroundColor: "#ededed" }}>
        <Offcanvas.Header>
          <div className='d-flex justify-content-between align-items-center w-100'>
            <div className='d-flex justify-content-start align-items-center'>
              <Offcanvas.Title style={{ fontSize: "35px" }}>Purchase</Offcanvas.Title><Badge bg="secondary" style={{ backgroundColor: "#fba919", color: "black" }}>Unpaid</Badge>
            </div>
            <div className='d-flex gap-[8px] align-items-center'>
              <Button variant='outline-secondary' size='sm'>View Sale</Button>
              <SplitButton
                key={"Primary"}
                id={`dropdown-split-variants`}
                variant={"Primary"}
                title={"Pay"}
                style={{ background: "#22D3EE" }}
                size='sm'
              >
                <Dropdown.Header>Print</Dropdown.Header>
                <Dropdown.Item>Receipt (Quick)</Dropdown.Item>
                <Dropdown.Item>Receipt (Options)</Dropdown.Item>
                <Dropdown.Item>Receipt (Detailed)</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Email</Dropdown.Header>
                <Dropdown.Item>Receipt (Options)</Dropdown.Item>
                <Dropdown.Item>Receipt (Detailed)</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>PDF</Dropdown.Header>
                <Dropdown.Item>Receipt (Options)</Dropdown.Item>
                <Dropdown.Item>Receipt (Detailed)</Dropdown.Item>
              </SplitButton>
              <LogOut style={{ backgroundColor: "#fff", padding: "5px", borderRadius: "5px" }} size={30} />
              <XSquare style={{ backgroundColor: "#fff", padding: "5px", borderRadius: "5px" }} size={30} onClick={handlePurchaseDetailsClose} />
            </div>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p className='text-muted fs-5'>{}</p>
          <Row>
            <Col xs={12} sm={12} md={8} lg={8}>
              <div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Client</p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div>
                          <p className='mb-0' style={{ fontSize: "13px" }}>{purchaseDetailsContent?.client?.name}</p>
                          <p className='mb-0 d-flex justify-content-start align-items-center gap-[5px]' style={{ fontSize: "13px" }}><Smartphone size={10} />{purchaseDetailsContent?.client?.phone_number?purchaseDetailsContent?.client?.phone_number:"-"}</p>
                          <p className='mb-0' style={{ fontSize: "13px", color: "#22D3EE" }}>{purchaseDetailsContent?.client?.email}</p>
                        </div>
                      </Col>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div>
                          <p className='mb-0' style={{ fontSize: "13px", fontWeight: 700 }}>Personal Health Number - </p>
                          <p className='mb-0' style={{ fontSize: "13px", fontWeight: 700 }}>Birth Date - {purchaseDetailsContent?.client?.name}</p>
                          <p className='mb-0' style={{ fontSize: "13px", fontWeight: 700 }}>Client Number <span style={{ fontSize: "13px", fontWeight: 300 }}>389</span></p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Purchase Details</p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div className='d-flex gap-[20px]'>
                          <div>
                            <p className='mb-0' style={{ fontWeight: 700, fontSize: "15px" }}>Purchase Date</p>
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              overlay={<Popover id="date-picker-popover" style={{ marginLeft: "50px" }}>
                                <Popover.Body >
                                  <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(moment(date).format("YYYY/MM/DD"))}
                                    dateFormat="yyyy/MM/dd"
                                    inline
                                  />
                                </Popover.Body>
                              </Popover>}
                              rootClose
                            >
                              <Button
                                variant="outline-secondary"
                                className='d-flex justify-content-start align-items-center gap-[5px] w-[150px]'
                                size={"sm"}
                              >
                                <CalendarDays />{moment(purchaseDate).format('YYYY/MM/DD')}
                              </Button>
                            </OverlayTrigger>
                          </div>
                          <div className=''>
                            <p className='mb-0' style={{ fontWeight: 700, fontSize: "15px" }}>Product</p>
                            <p className='mb-0' style={{ fontSize: "13px" }}>ICare Jenny</p>
                          </div>
                        </div>
                      </Col>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div className='d-flex gap-[20px]'>
                          <div className=''>
                            <p className='mb-0' style={{ fontWeight: 700, fontSize: "15px" }}>Quantity</p>
                            <input className='w-[150px] border p-1 rounded' type='number' value={1} />
                          </div>
                          <div className=''>
                            <p className='mb-0' style={{ fontWeight: 700, fontSize: "15px" }}>Amount</p>
                            <p className='mb-0' style={{ fontSize: "13px" }}>$75.00</p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Staff Member <span style={{ fontSize: "12px" }}>receiving compensation</span></p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <div>
                          <div className='d-flex justify-content-between align-items-center gap-[20px]'>
                            <p className='text-muted mb-0' style={{ fontSize: "15px" }}>Ashrut Dev</p>
                            <div className='d-flex align-items-center'>
                              <Button variant='outline-secondary d-flex justify-content-start align-items-center' style={{ color: "#22D3EE", border: "none", fontSize: "13px" }} onClick={handlePurchaseChangeEmployee}><ArrowRightLeft size={15} color={"#22D3EE"} />Change</Button>
                              <div>|</div>
                              <Button variant='outline-secondary d-flex justify-content-start align-items-center text-danger' style={{ color: "red", border: "none", fontSize: "13px" }}><X size={15} color={"red"} />Remove</Button>
                            </div>
                          </div>
                          <p style={{ fontSize: "15px" }} className='text-muted'>This staff member will receive any applicable commissions for this purchase and will be listed on invoices, receipts and statements.</p>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Invoices</p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <div>
                          <Table hover size="sm">
                            <thead>
                              <tr>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Invoice#</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Date</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Invoiced To</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Status</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Total</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Balance</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>{purchaseDetailsContent?.id}</td>
                                <td>{purchaseDetailsContent?.created_at}</td>
                                <td>
                                  <div>
                                    <p className='mb-0'>{purchaseDetailsContent?.employee.name}</p>
                                    <p className='mb-0' style={{ fontSize: "11px" }}>Quantity:1</p>
                                  </div>
                                </td>
                                <td><p style={{ color: "#f19a04" }}>{purchaseDetailsContent?.is_paid?"Paid":"Unpaid"}</p></td>
                                <td><p>${purchaseDetailsContent?.charge}</p></td>
                                <td><p style={{ color: "red" }}>${purchaseDetailsContent?.charge}</p></td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1 d-flex justify-content-between align-items-center w-100'>Payment<Button variant='outline-secondary' className='bg-white'>Receive Payments</Button></p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        <div>
                          <Table hover size="sm">
                            <thead>
                              <tr>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Date Applied</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Payment Date</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Payment</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Detail</th>
                                <th style={{ color: "#555555", fontSize: "16px" }}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {/* <p style={{ color: "#555555", fontSize: "16px", fontWeight: 700 }} className='text-center mt-3'>No Payments</p> */}
                              <tr>
                                <td>Nov 12, 2024</td>
                                <td>Nov 12, 2024</td>
                                <td>Unpaid</td>
                                <td>details</td>
                                <td>$75.00</td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={12} md={4} lg={4}>
              <div className='mt-3'>
                <p className='text-muted fs-4 mb-1'>Summary</p>
                <div className='bg-white p-3 rounded bg-white'>
                  <Row>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>ICare Jenny</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <hr />
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>User Fee</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Quantity</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Sub Total</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Tax</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Total</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <hr />
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px", color: "#22D3EE" }}>Test Account #6089-P01</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Total</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Balance</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                    <hr />
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div>
                        <p className='mb-0' style={{ fontSize: "16px" }}>Balance</p>
                      </div>
                    </Col>
                    <Col xs={6} sm={6} md={6} lg={6}>
                      <div className='d-flex justify-content-end'>
                        <p className='mb-0' style={{ fontSize: "16px" }}>$75.00</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  };
  const PurchaseChangeEmployee = () => {
    return <div>
      <Modal show={purchaseChangeEmployee} onHide={handlePurchaseChangeEmployee}>
        <Modal.Header closeButton>
          <Modal.Title className='text-muted fs-3 fw-light'>Select a Staff Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Text className="text-muted">Use the search field below to select a staff member to receive compensation</Form.Text>
            <Form.Control type="text" placeholder="Search Staff Member..." value={purchaseSearch} onChange={(event) => setPurchaseSearch(event.target.value)} />
          </Form.Group>
          {purchaseSearch &&
            <ListGroup style={{ maxHeight: "350px", overflow: "scroll" }}>
              {filterEmployeeList.map((item, index) => {
                return <ListGroup.Item key={index}>{item.name}</ListGroup.Item>
              })}
            </ListGroup>
          }
        </Modal.Body>
      </Modal>
    </div>
  };
  const PurchasePayBalance = () => {
    return <Modal show={showPayBalance} onHide={() => setShowPayBalance(false)}>
      <Modal.Header closeButton>
        <Modal.Title className='text-muted'>Send Pay Balance Reminder by Email</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label className='text-muted'>Hello Tester,</Form.Label>
            <Form.Control as="textarea" rows={5} placeholder='Add optional note...'/>
          </Form.Group>
        </Form>
        <Form.Label className='text-muted' style={{lineHeight:"17px",fontSize:"14px",fontStyle:"italic"}}>You have an account balance of $1,996.50 which you can pay through the patient portal. (A button reading "Pay" will appear below message)</Form.Label>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPayBalance(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={() => setShowPayBalance(false)}>
          Send
        </Button>
      </Modal.Footer>
    </Modal>
  };
  const Payments = () => {
    return <div>
      <PaymentsDetails/>
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
              <th><Form.Check type={"checkbox"}/></th>
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
              <td><Form.Check type={"checkbox"}/></td>
              <td>Nov 12 2024</td>
              <td>ICare Jenny</td>
              <td>Ashrut Dev</td>
              <td>Client Invoice 6039-01 Test Account</td>
              <td>Unpaid</td>
              <td>$75.00</td>
              <td><span style={{ color: "#22D3EE" }}>Invoice#5019-P19</span>$10</td>
              <td>
                <div className='d-flex border rounded justify-content-between align-items-center'>
                  <Button variant='outline-secondary' style={{ border: "none" }} size='sm' className='w-100' onClick={handlePaymentDetails}>View</Button>
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
  const PaymentsDetails = () => {
    return <div>
      <Offcanvas show={paymentDetails} onHide={handlePaymentDetails} placement='end' style={{ width: "80%", backgroundColor: "#ededed" }}>
        <Offcanvas.Header >
          <div className='d-flex justify-content-between align-items-center w-100'>
            <div className='d-flex justify-content-start align-items-center'>
              <Offcanvas.Title style={{ fontSize: "35px" }}>Payment #25659</Offcanvas.Title>
            </div>
            <div className='d-flex gap-[8px] align-items-center'>
              <XSquare style={{ backgroundColor: "#fff", padding: "5px", borderRadius: "5px" }} size={30} onClick={handlePaymentDetails} />
            </div>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p className='text-muted fs-5'>ICare Jenny - Replanish- La Frontera</p>
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <div>
                <div className='mt-3'>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div>
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <FaUser size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Payer</p>
                              <p className='mb-1' style={{ color: "#22D3EE" }}>Test Account (tester)</p>
                            </div>
                          </div>
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <FaRegBuilding size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Location</p>
                              <p className='mb-1'>ReplanishMD - Bellaire Conierge</p>
                            </div>
                          </div>
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <FaRegCreditCard size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Payment Method</p>
                              <p className='mb-1' style={{ color: "#22D3EE" }}>Jane Payments acct_1PUBYWR60loua6ON MasterCard</p>
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div>
                        <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <CalendarDays size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Payer</p>
                              <p className='mb-1' style={{ color: "#22D3EE" }}>Oct 18, 2024</p>
                            </div>
                          </div>
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <PiCurrencyDollarSimpleBold size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Amount</p>
                              <p className='mb-1'>$10.00</p>
                            </div>
                          </div>
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <FaRegCreditCard size={25} style={{ marginTop: "5px" }} />
                            <div>
                              <p className='text-muted mb-1'>Reference Number</p>
                              <p className='mb-1' style={{ color: "#22D3EE" }}>ch_3QBKLHJnuK6juLtD15z88pCG</p>
                            </div>
                          </div>  
                          <div className='d-flex justify-content-start align-items-start gap-[20px]'>
                            <div className='w-[30px]'></div>
                            <div>
                              <p className='text-muted mb-1'>Replanish App Details</p>
                              <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>Status: succeeded (authorized) on Fri, Oct 18, 2024 12:52 PM</p>
                              <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>$10.00 on MASTERCARD ending in 6954</p>
                              <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>Transaction ID: 2908</p>
                              <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>Authorization: 2908</p>
                            </div>
                          </div>  
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Applied To</p>
                  <div className='bg-white p-3 rounded'>
                    <Row>
                      <Col xs={1} sm={1} md={1} lg={1}>
                        <div className='d-flex'>
                          <div className='d-flex justify-content-center text-white fs-6 align-items-center bg-secondary rounded-circle  w-[50px] h-[50px]'>1</div>
                        </div>
                      </Col>
                      <Col xs={7} sm={7} md={7} lg={7}>
                        <div className=''>
                          <p className='text-muted mb-0'><span style={{ color: "#22D3EE" }}>Invoice #5019-P01</span> -  Applied on Oct 18, 2024</p>
                          <p className='text-muted mb-0' style={{ fontSize: "13px" }}>April 29, 2024 - 10:30am, Follow Up (30 minutes)</p>
                          <p className='text-muted mb-0' style={{ fontSize: "13px" }}>Cintia Jimenez BSN, RN</p>
                        </div>
                      </Col>
                      <Col xs={4} sm={4} md={4} lg={4}>
                        <div className='d-flex justify-content-between align-items-center'>
                          <div className='d-flex justify-content-start align-items-center gap-[20px]'>
                            <div className='w-[50px] h-[50px] bg-light rounded-circle d-flex justify-content-center text-white  align-items-center'>
                              <FaLinkSlash color='#000'/>
                            </div>
                            <div className='w-[50px] h-[50px] bg-light rounded-circle d-flex justify-content-center text-white  align-items-center'>
                              <FaPencil color='#000' onClick={handleAppliedCalender}/>
                            </div>
                          </div>
                          <div>
                            <p className='text-muted'>$75.00</p>
                          </div>
                        </div>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={12}>
                        {enableAppliedCalender &&
                          <div className='border rounded p-4 bg-white mt-2'>
                            <label style={{ color: '#696977', fontSize: "12px" }}>Applied To</label>
                            <InputGroup className="mb-3">
                              <InputGroup.Text id="basic-addon1"><CalendarDays /></InputGroup.Text>
                              <Form.Control
                                placeholder="Username"
                                type='date'
                                onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                                onChange={(e) => e.target.blur()}
                              />
                            </InputGroup>
                            <div className='d-flex gap-[10px]'>
                              <Button variant='outline-secondary' style={{ color: "#fff", border: "1px solid #22D3EE", backgroundColor: "#22D3EE" }}>Save</Button>
                              <Button variant='outline-secondary' style={{ backgroundColor: "#fff" }} onClick={handleAppliedCalender}>Cancel</Button>
                            </div>
                          </div>}
                      </Col>
                    </Row>
                  </div>
                  <div className='p-3 rounded d-flex justify-content-end align-items-end flex-column border'  style={{backgroundColor:"#f5f5f5"}}>
                    <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>Total Applied: $10.00</p>
                    <p style={{ color: "#555555", fontSize: "13px" }} className='mb-0'>Balance Remaining:  $0.00</p>
                  </div>
                  <div className='p-3 rounded d-flex justify-content-end align-items-end flex-column border'  style={{backgroundColor:"#f5f5f5"}}>
                    <p style={{ color: "#555555", }} className='mb-0 fs-4'>Balance Remaining: : $0.00</p>
                  </div>
                </div>
                <div className='mt-3'>
                  <div className='border p-3 rounded' style={{ backgroundColor: "#f5f5f5" }}>
                    <Row>
                      <Col xs={11} sm={11} md={11} lg={11}>
                        <div>
                          <InputGroup>
                            <InputGroup.Text id="basic-addon1"><Search size={20} color={'#696977'} /></InputGroup.Text>
                            <Form.Control
                              placeholder="Search outstanding invoices by patient, invoice number, claim etc."
                            />
                            <InputGroup.Text id="basic-addon1"><X size={20} color={'#696977'} /></InputGroup.Text>
                          </InputGroup>
                        </div>
                      </Col>
                      <Col xs={1} sm={1} md={1} lg={1}>
                        <div>
                          <Button variant='outline-secondary' size='sm' className='w-100'>View All</Button>
                        </div>
                      </Col>
                    </Row>
                    <div className='mt-3'>
                      <Row>
                        <Col xs={1} sm={1} md={1} lg={1}>
                          <div style={{ backgroundColor: "#eeeeee" }} className='mt-2 d-flex justify-content-center align-items-center text-dark rounded-circle w-[50px] h-[50px]'>
                            +
                          </div>
                        </Col>
                        <Col xs={6} sm={6} md={6} lg={6}>
                          <div className=''>
                            <p className='text-muted fs-4 mb-1'>Invoice #5971-P01<span className='' style={{ color: "#22D3EE" }}>Tester Account</span></p>
                            <p className='text-muted mb-0' style={{ fontSize: "13px" }}>October 28, 2024 - 5:00pm, Neurotoxin treatment (15 minutes)</p>
                            <p className='text-muted mb-0' style={{ fontSize: "13px" }}>Dr. Kelechi Azuogu</p>
                            <p className='text-muted mb-0' style={{ fontSize: "11px" }}>Last invoiced on Oct 28, 2024</p>
                          </div>
                        </Col>
                        <Col xs={5} sm={5} md={5} lg={5}>
                          <div className='d-flex justify-content-end align-items-end gap-[20px]'>
                            <InputGroup >
                              <InputGroup.Text id="basic-addon1"><span className='text-secondary'>$</span></InputGroup.Text>
                              <Form.Control
                                placeholder="Username"
                                value={0.00}
                                className='text-end'
                              />
                              <InputGroup.Text id="basic-addon1"><span className='text-secondary'>of $6.50</span></InputGroup.Text>
                            </InputGroup>
                            <Button size='md' variant='outline-secondary' className='d-flex gap-[5px] align-items-center'><FaLinkSlash size={20} />Apply</Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Applied History</p>
                  <div className='border p-3 rounded bg-white'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div><p style={{ fontSize: "13px" }}>Oct 18, 2024 12:52 PM</p></div>
                      <div><p style={{ fontSize: "13px" }}>Invoice #5019-P01</p></div>
                      <div><p style={{ fontSize: "13px" }}>April 29, 2024 - 10:30am, Follow Up (30 minutes)
                        Cintia Jimenez BSN, RN</p></div>
                      <div><p style={{ fontSize: "13px" }} onClick={handleAppliedHistoryCalender}><FaPencil size={15} style={{ color: "#22D3EE" }} /></p></div>
                      <div><p style={{ fontSize: "13px" }}>$78.00</p></div>
                    </div>
                  </div>
                  {enableAppliedHistoryCalender &&
                    <div className='border rounded p-4 bg-white mt-2'>
                      <label style={{ color: '#696977', fontSize: "12px" }}>Applied To</label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1"><CalendarDays /></InputGroup.Text>
                        <Form.Control
                          placeholder="Username"
                          type='date'
                          onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                          onChange={(e) => e.target.blur()}
                        />
                      </InputGroup>
                      <div className='d-flex gap-[10px]'>
                        <Button variant='outline-secondary' style={{ color: "#fff", border: "1px solid #22D3EE", backgroundColor: "#22D3EE" }}>Save</Button>
                        <Button variant='outline-secondary' style={{ backgroundColor: "#fff" }} onClick={handleAppliedHistoryCalender}>Cancel</Button>
                      </div>
                    </div>}
                </div>
                <div className='mt-3'>
                  <p className='text-muted fs-4 mb-1'>Activity</p>
                  <div className='border p-3 rounded bg-white'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <div><p style={{ fontSize: "14px" }}>Payment received by Kelechi Azuogu Fri, Oct 18, 2024 12:52 PM</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
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
const handlePurchaseLocation=(event)=>{
  setShowNewPurchaseSliderLocation(event.target.value)
};
const handlePurchaseSearch=(event)=>{
  setShowNewPurchaseSliderProductSearch(event.target.value)
};
const filterProductList = productList.filter((item) => item.name.toLowerCase().startsWith(showNewPurchaseSliderProductSearch.toLowerCase()))
const handleSelectProduct=(productId)=>{
  if(!setSelectedProductsIds.includes(productId)){
    setSelectedProductsIds((prevSelectedIds) => [...prevSelectedIds, productId]);
  }else{
    setSelectedProductsIds((prevSelectedIds) => 
      prevSelectedIds.filter((id) => id !== productId)
    );
  }
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
            <Button size='sm' className='w-[130px] h-[35px]' onClick={()=>setShowNewPurchaseSlider(true)}>New Purchase</Button>
            <Offcanvas show={showNewPurchaseSlider} onHide={() => setShowNewPurchaseSlider(false)} placement={"end"} style={{ width: "75%", backgroundColor: "rgb(243 244 246)" }} className="">
              <Offcanvas.Header closeButton >
                <Offcanvas.Title className='fs-4 text-secondary font'>New Sale</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <div className='bg-white p-3 rounded'>
                  <div>
                    <Form.Label className='fs-6 text-secondary fw-bolder'>Location</Form.Label>
                    <Form.Select aria-label="Default select example" value={showNewPurchaseSliderLocation} onChange={handlePurchaseLocation}>
                      {filteredLocationItems.map((item) => (
                        <option value={item.label}>{item.label}</option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className='mt-2'>
                    <Form.Label className='fs-6 text-secondary fw-bold'>Client</Form.Label>
                    <Row>
                      <Col xs={1} sm={1} md={1} lg={1}>
                        <div className='d-flex flex-column'>
                          <Form.Label className='text-muted fw-bold mb-0' style={{ fontSize: "13px" }}>Name:</Form.Label>
                          <Form.Label className='text-muted fw-bold mb-0' style={{ fontSize: "13px" }}>Email:</Form.Label>
                        </div>
                      </Col>
                      <Col xs={3} sm={3} md={3} lg={3}>
                        <div className='d-flex flex-column'>
                          <Form.Label className='text-muted fw-light mb-0' style={{ fontSize: "13px" }}>Testaccount</Form.Label>
                          <Form.Label className='text-muted fw-light mb-0' style={{ fontSize: "13px" }}>Testaccount@gmail.com</Form.Label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  <div className='w-100 mt-2'>
                    <Form.Label className='text-secondary fs-6 text-secondary fw-bolder'>Items</Form.Label>
                    <div>
                      <Table striped bordered hover>
                        <tbody>
                          <tr>
                            <td>
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <InputGroup className="mb-3">
                                  <InputGroup.Text id="basic-addon1"><FaRegCalendarDays /></InputGroup.Text>
                                  <Form.Control
                                    placeholder="Add a product.."
                                    onChange={handlePurchaseSearch}
                                    value={showNewPurchaseSliderProductSearch}
                                  />
                                </InputGroup>
                              </div>
                            </td>
                            <td >
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <p className='mb-0 text-dark d-flex gap-[10px]'>$9.50-botox<div className='w-[50px] h-[20px] rounded px-1 text-white fw-semibold' style={{ backgroundColor: "#fba919", fontSize: "12px" }}>Unpaid</div> </p>
                              </div>
                            </td>
                            <td >
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <p className='mb-0 cursor-pointer' style={{ color: "#00c1ca" }} onClick={() => setShowAddStaffModal(true)}>Add Staff Member</p>
                              </div>
                            </td>
                            <td >
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <Form.Control
                                  type='number'
                                  value={1}
                                />
                              </div>
                            </td>
                            <td >
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <p className='mb-0 text-dark'>$9.50</p>
                              </div>
                            </td>
                            <td >
                              <div className={"d-flex justify-content-start align-items-center"}>
                                <ButtonGroup aria-label="Basic example">
                                  <Button variant="outline-secondary" className='bg-none'><FaPencil /></Button>
                                  <Button variant="outline-secondary" className='bg-none'><X /></Button>
                                </ButtonGroup>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                    <div className='position-relative w-50'>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1"><Search size={20} color='#696977' /></InputGroup.Text>
                        <Form.Control
                          placeholder="Add a product.."
                          onChange={handlePurchaseSearch}
                          value={showNewPurchaseSliderProductSearch}
                        />
                      </InputGroup>
                      {showNewPurchaseSliderProductSearch && <div className='position-absolute z-index-10 w-100' style={{ maxHeight: "300px", overflow: "scroll" }}>
                        <ListGroup>
                          {filterProductList.map((item, index) => {
                            return <ListGroup.Item key={index} onClick={() => handleSelectProduct(item.id)}>{item.name}</ListGroup.Item>
                          })}
                        </ListGroup>
                      </div>}
                    </div>
                  </div>
                  <div className='w-100 bg-secondary h-[1px] my-1' />
                  <div className='mt-3'>
                    <Row>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div className='d-flex flex-column justify-content-end'>
                          <Form.Label className='fs-6 mb-2 fw-light text-end'>Sub Total</Form.Label>
                          <Form.Label className='fs-6 mb-2 fw-light text-end'>Tax</Form.Label>
                          <Form.Label className='fs-6 mb-2 fw-light text-end'>Grand Total</Form.Label>
                        </div>
                      </Col>
                      <Col xs={6} sm={6} md={6} lg={6}>
                        <div className='d-flex flex-column justify-content-end'>
                          <Form.Label className='fs-6 mb-2 text-muted fw-bold text-end'>$234.00</Form.Label>
                          <Form.Label className='fs-6 mb-2 text-muted fw-bold text-end'>$0.00</Form.Label>
                          <Form.Label className='fs-6 mb-2 text-muted fw-bold text-end'>$234.00</Form.Label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
            <Modal show={showAddStaffModal} onHide={() => setShowAddStaffModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Select a Staff Member</Modal.Title>
              </Modal.Header>
              <Modal.Body>
              <div className='position-relative w-100'>
                      <InputGroup className="mb-3">
                        <InputGroup.Text id="basic-addon1"><Search size={20} color='#696977' /></InputGroup.Text>
                        <Form.Control
                          placeholder="Add a product.."
                          onChange={handlePurchaseSearch}
                          value={showNewPurchaseSliderProductSearch}
                        />
                      </InputGroup>
                      {showNewPurchaseSliderProductSearch && <div className='w-100' style={{ maxHeight: "300px", overflow: "scroll" }}>
                        <ListGroup>
                          {filterProductList.map((item, index) => {
                            return <ListGroup.Item key={index} onClick={() => handleSelectProduct(item.id)}>{item.name}</ListGroup.Item>
                          })}
                        </ListGroup>
                      </div>}
                    </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAddStaffModal(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
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