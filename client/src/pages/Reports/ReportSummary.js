import { SlidersHorizontal, MoreHorizontal, SearchIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Dropdown, Form, ListGroup, Nav, NavDropdown, Overlay, OverlayTrigger, Popover, Spinner, Table } from 'react-bootstrap'
import { GenerateExcelForInvoices, GetAllSummaryInvoices, getEmployeesList, getLocations, GenerateSingleSummaryReport } from '../../Server'
import { BiSolidDownArrow } from 'react-icons/bi'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthContext } from '../../context/AuthUserContext'
import moment from 'moment'
import { toast } from 'react-toastify'

const ReportSummary = () => {
  const [key, setKey] = useState(0);
  const { authUserState } = useAuthContext();
  const [locationSearchQuery, setLocationSearchQuery] = useState("")
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("")
  const [allLocations, setAllLocations] = useState([])
  const [selectedLocationName, setSelectedLocationsName] = useState("")
  const [allEmployees, setAllEmployees] = useState([])
  const [allEmployeesIds, setAllEmployeesIds] = useState([])
  const [selectedEmployeeName, setSelectedEmployeesName] = useState("")
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const buttonRef = useRef(null);
  const [salesByLocationData, setSalesByLocationData] = useState([]);
  const [payload, setPayload] = useState({})
  const [showOptions,setShowOptions]=useState(false);
  const [screenLoading, setScreenLoading] = useState(false)
  useEffect(() => {
      GetAllLocations();
    GetAllEmployees();
    GetAllSummaryReport()
  }, [])
  useEffect(() => {
    setPayload((prev) => ({
      ...prev,
      "employee_id": allEmployeesIds,
      "start_date": startDate,
      "end_date": endDate
    }))
    GetAllSummaryReport()
  },[allEmployeesIds,endDate])
  const handleToggle = (event) => {
    setShow(!show);
    setTarget(event.target);
  };
  const GetAllLocations = async () => {
    let response = await getLocations();
    setAllLocations(response.data);
  }
  const GetAllEmployees = async () => {
    let response = await getEmployeesList();
    setAllEmployees(response.data)
    let allIds = response.data.map((item) => { return item.id })
    setAllEmployeesIds(allIds)
    
  }
  const GetAllSummaryReport = async () => {
    let response = await GetAllSummaryInvoices(payload,true);
    setSalesByLocationData(response.data) 
    
  };
  const selectLocation = async (locationName) => {
    let location = filteredLocation.find((item) => { return item.name === locationName });
    if (location) {
      const updatedPayload = {
        ...payload,
        location_id: [location.id],
      };
      setPayload((prev) => ({
        ...prev,
        location_id: [location.id],
      }))
      setSelectedLocationsName(location.name);
      let response = await GetAllSummaryInvoices(updatedPayload, true);
      setSalesByLocationData(response.data);
    }
  };
  const selectEmployee = async (employeeName) => {
    let employee = filteredEmployee.find((item) => { return item.name === employeeName });
    if (employee) {
      setSelectedEmployeesName(employee.name)
      setAllEmployeesIds([employee.id])
      setPayload((prevPayload) => ({
        ...prevPayload,
        employee_id: [employee.id]
      }));
    }
  };
  const handleEmployeeCheckbox = async (event, employeeId) => {
    if (!allEmployeesIds.includes(employeeId)) {
      setAllEmployeesIds((prev) => {
        const updatedIds = [...prev, employeeId];
        return updatedIds;
    });
    } else {
      setAllEmployeesIds((prev) => {
        const updatedIds = prev.filter((id) => id !== employeeId);
        return updatedIds;
    });
    }
  };
  const handleExcel = async () => {
    try {
      let response = await GenerateExcelForInvoices(payload, true);
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank'); // Open the blob URL in a new tab
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000); // Revoke the blob URL after 10 seconds
      setShowOptions(false);
    } catch (error) {
      console.error('Error generating Excel file:', error);
    }
  };
  
  const handleSelectAllEmployees = async(e) => {
    e.stopPropagation();
    let allIds = allEmployees.map((item) => { return item.id })
    setAllEmployeesIds(allIds)
  };
  const areAllEmployeesSelected = () => {
    const employeeIds = allEmployees.map((employee) => employee.id);
    return employeeIds.every((id) => allEmployeesIds.includes(id));
  };
  const hasValue = Object.values(payload).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return Boolean(value);
  });
  const popover = (
    <Popover id="popover-basic">
      <ListGroup>
        <ListGroup.Item onClick={handleExcel}>Export To Excel</ListGroup.Item>
      </ListGroup>
    </Popover>
  );
  const filteredLocation = Array.isArray(allLocations) && allLocations.filter((location) =>
    location.name.toLowerCase().startsWith(locationSearchQuery.toLowerCase())
  );
  const filteredEmployee = Array.isArray(allEmployees) && allEmployees.filter((location) =>
    location.name.toLowerCase().startsWith(employeeSearchQuery.toLowerCase())
  );
  const handleStartDate = async (date) => {
    setStartDate(date);
    await setPayload((prev)=>({
      ...prev,
      "start_date": moment(date).format('YYYY-MM-DD'),
    }))
    if (endDate && date > endDate) {
      setEndDate(null);
      setPayload((prev)=>({
        ...prev,
        "end_date": ""
      }))
    }
  };

  const handleEndDate = async (date) => {
    setEndDate(date);
    await setPayload((prev)=>({
      ...prev,
      "end_date": moment(date).format('YYYY-MM-DD'),
    }))
  };

  const isInRange = (date) => {
    return startDate && endDate && date >= startDate && date <= endDate;
  };

  const getDayClassName = (date) => {
    if (!startDate) return '';
    if (moment(date).isSame(startDate, 'day')) return 'date-range-start';
    if (moment(date).isSame(endDate, 'day')) return 'date-range-end';
    if (isInRange(date)) return 'date-range-highlight';
    return '';
  };
  const generateSingleSummaryReport = async (locationId) => {
    try {
      setScreenLoading(true);
      let response = await GenerateSingleSummaryReport(locationId, true)
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      setShowOptions(false);
      setScreenLoading(false);
    } catch (error) {
      toast.error(error.message);
      setScreenLoading(false);
    }
  };
  const reloadComponent = () => {
    setLocationSearchQuery("");
    setPayload({});
    setEndDate("");
    setStartDate("");
    setSelectedLocationsName("");
    GetAllLocations();
    GetAllEmployees();
    GetAllSummaryReport()
  };
  const ScreenLoading = () => {
    return <div style={{ width: "100%", height: "87vh", position: "absolute", zIndex: 9, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
        <Spinner animation="border" variant="info" />
    </div>
}
  return (
    <div className='p-3 w-full' key={key} style={{position:"relative"}}>
      {screenLoading && <ScreenLoading />}
      <h1 className='text-black-50 font-weight-semibold mt-4'>Billing Summary Report</h1>
      <div className='p-3 bg-white px-3 w-100 rounded mt-3'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex justify-content-start align-items-center bg-gray'>
            <div className='d-flex justify-content-start align-items-center'>
              <SlidersHorizontal size={20} color='#696977' />
              <Dropdown className="d-inline mx-2" onSelect={selectLocation}>
                <Dropdown.Toggle id="dropdown-autoclose-true" variant='outline' style={{ color: "#696977" }}>
                  {selectedLocationName ? selectedLocationName : "All Locations"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <div className="relative  w-[85%] m-auto h-[30px] flex items-center">
                    <input
                      autoFocus
                      className="w-full h-[30px] border pl-9 py-2 border-2 rounded-md focus:outline-blue-500 !border-gray-400"
                      onChange={(event) => setLocationSearchQuery(event.target.value)}
                      value={locationSearchQuery}
                    />
                    <SearchIcon className="absolute left-2 pointer-events-none text-gray-400" size={15} />
                  </div>
                  <div style={{ maxHeight: "350px", overflow: "scroll",scrollbarWidth:"none" }}>
                    {Array.isArray(filteredLocation) && filteredLocation.map((item, index) => {
                      return <Dropdown.Item eventKey={item?.name}>
                        {item?.name}
                      </Dropdown.Item>
                    })}
                  </div>
                </Dropdown.Menu>
              </Dropdown>
              </div>
            <div className='d-flex justify-content-start align-items-center'>
              <Dropdown className="d-inline mx-2">
                <Dropdown.Toggle id="dropdown-autoclose-true" variant='outline' style={{ color: "#696977" }}>
                  All Staff Members
                </Dropdown.Toggle>
                <Dropdown.Menu className='w-[300px] px-3'>
                  <div className="relative  w-[100%] m-auto h-[30px] flex items-center">
                    <input
                      autoFocus
                      className="w-full h-[30px] border pl-9 py-2 border-2 rounded-md focus:outline-blue-500 !border-gray-400"
                      onChange={(event) => setEmployeeSearchQuery(event.target.value)}
                      value={employeeSearchQuery}
                    />
                    <SearchIcon className="absolute left-2 pointer-events-none text-gray-400" size={15} />
                  </div>
                  <div className='d-flex justify-content-between align-items-center' >
                    <Dropdown.Item className='d-flex justify-content-between px-0' onClick={handleSelectAllEmployees}><span>Select All</span></Dropdown.Item>
                    <Form.Check checked={areAllEmployeesSelected()} onChange={handleSelectAllEmployees} />
                  </div>
                  <hr />
            <div style={{maxHeight:"350px",overflow:"scroll",scrollbarWidth:"none"}}>
                  {Array.isArray(filteredEmployee) && filteredEmployee?.map((item, index) => {
                    return <div className='d-flex justify-content-between align-items-center' >
                      <Dropdown.Item onClick={(e) => e.stopPropagation()} className='px-0'>
                        <span onClick={() => selectEmployee(item?.name)}>{item?.name} </span>
                      </Dropdown.Item>
                      <Form.Check className='z-10' checked={allEmployeesIds.includes(item.id)} onChange={(event) => handleEmployeeCheckbox(event, item.id)} />
                    </div>
                  })}
              </div>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className='d-flex justify-content-start align-items-center'>
              <div style={{ padding: '20px' }}>
                <div className='d-flex justify-content-start align-items-center gap-[4px] cursor-pointer position-relative' ref={buttonRef} onClick={handleToggle}>
                  <p className='mb-0' style={{ color: "#696977" }}>Date Range</p>
                  <BiSolidDownArrow color="#696977" size={9} />
                </div>
                <Overlay
                  show={show}
                  target={target}
                  placement="bottom"
                  container={buttonRef.current}
                  rootClose
                  onHide={() => setShow(false)}
                  style={{ width: "auto" }}
                >
                  <Popover id="date-picker-popover">
                    <Popover.Body >
                      <div className='d-flex justify-content-between gap-[20px] align-items-center'>
                        <div>
                          <label>Start Date:</label>
                          <DatePicker
                            selected={startDate}
                            onChange={handleStartDate}
                            dateFormat="yyyy/MM/dd"
                            inline
                            dayClassName={getDayClassName}
                          />
                        </div>
                        <div>
                          <label>End Date:</label>
                          <DatePicker
                            selected={endDate}
                            onChange={handleEndDate}
                            dateFormat="yyyy/MM/dd"
                            inline
                            minDate={startDate}
                            dayClassName={getDayClassName}
                            disabled={!startDate}
                          />
                        </div>
                      </div>
                    </Popover.Body>
                  </Popover>
                </Overlay>
              </div>

            </div>
            <div className='d-flex justify-content-start align-items-center'>
              <Nav>
                <NavDropdown
                  id="nav-dropdown-dark-example"
                  title="Filter By"
                  menuVariant="light"
                  className='text-secondary report-section'
                  style={{ color: "red" }}
                >
                  <NavDropdown.Item href="#action/3.1">Purchase Date</NavDropdown.Item>
                  <NavDropdown.Item href="#action/3.2">Invoice Date</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </div>
            {
              hasValue &&
              <div className='d-flex justify-content-start align-items-center'>
                <span className='' style={{ color: "#696977", cursor: "pointer" }} onClick={async () => {
                  await setPayload(()=>({
                    location_id:[],
                    end_date:"",
                    start_date:"",
                    employee_id:allEmployeesIds
                  }))
                  setSelectedLocationsName("")
                  let response = await GetAllSummaryInvoices({end_date:"",start_date:"",employee_id:allEmployees.map((item) => { return item.id })}, true);
                  setSalesByLocationData(response.data)
                }}>Reset</span>
              </div>
            }
          </div>
          <div>
            {authUserState.user.is_admin &&
              <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover} show={showOptions} onToggle={()=>setShowOptions(false)}>
                <MoreHorizontal onClick={()=>setShowOptions(true)}/>
              </OverlayTrigger>
            }
          </div>
        </div>
        <div>
          <p className='my-2' style={{ fontSize: "0.8rem" }}>This report was generated on {moment().format('dddd MMMM D, YYYY [at] h:mma')}. <span style={{ color: "rgb(34 211 238)", cursor: "pointer" }} onClick={reloadComponent}>Load a fresh copy</span></p>
          <p className='my-2 fs-6 text-black-50 mt-3'> {startDate && endDate? moment(startDate).format('dddd MMMM D, YYYY [at] h:mma')+" to "+moment(endDate).format('dddd MMMM D, YYYY [at] h:mma'):moment().format('dddd MMMM D')}</p>
        </div>
        <hr className='w-[100%] h-[1px] bg-secondary' />
        <div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th colSpan="4" className="text-start text-black-50 fs-4">Sales by location</th>
              </tr>
              <tr>
                <th>Location</th>
                <th>% Invoiced</th>
                <th>Invoiced</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(salesByLocationData.data) && salesByLocationData.data.map((item, index) => {
                return <tr key={index} onClick={() => generateSingleSummaryReport(item.location_id)} className='cursor-pointer'>
                  <td style={{color:"#17a2b8"}}>{item.location_name}</td>
                  <td>{item.percentage_invoiced}%</td>
                  <td>${item.total_invoiced}</td>
                  <td>${item.total_applied}</td>
                </tr>
              })}
              <tr className='cursor-pointer'>
                  <td><p className='fw-bolder'>Total <span style={{fontSize:"12px",fontStyle:"italic",fontWeight:300}}>inclusive of taxes</span></p></td>
                  <td></td>
                  <td className='fw-bolder'>${salesByLocationData?.total_summary?.total_invoiced}</td>
                  <td className='fw-bolder'>${salesByLocationData?.total_summary?.total_applied}</td>
                </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ReportSummary