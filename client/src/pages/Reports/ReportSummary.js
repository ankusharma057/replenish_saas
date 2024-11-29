import { SearchIcon, SlidersHorizontal, MoreHorizontal } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { ListGroup, Nav, NavDropdown, Overlay, OverlayTrigger, Popover, Table } from 'react-bootstrap'
import { getEmployeesList, getLocations } from '../../Server'
import { BiSolidDownArrow } from 'react-icons/bi'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthContext } from '../../context/AuthUserContext'

const ReportSummary = () => {
  const { authUserState } = useAuthContext();
  const [locationSearchQuery, setLocationSearchQuery] = useState("")
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("")
  const [allLocations, setAllLocations] = useState("")
  const [selectedLocationId, setSelectedLocationsId] = useState("")
  const [allEmployees, setAllEmployees] = useState("")
  const [selectedEmployeeId, setSelectedEmployeesId] = useState("")
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const buttonRef = useRef(null);

  useEffect(() => {
    GetAllLocations();
    GetAllEmployees();
  }, [])
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
  }
  const getNextDay = (date) => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  };
  const getEndDateMinDate = () => {
    if (startDate) {
      return getNextDay(startDate);
    }
    return null;
  };
  const selectLocation = (locationName) => {
    let location = filteredLocation.find((item) => { return item.name === locationName });
    if (location) {
      setSelectedLocationsId(location.id);
    }
  };
  const selectEmployee = (locationName) => {
    let employee = filteredEmployee.find((item) => { return item.name === locationName });
    if (employee) {
      setSelectedEmployeesId(employee.id)
    }
  };

  const popover = (
    <Popover id="popover-basic">
      <ListGroup>
        <ListGroup.Item>Export To Excel</ListGroup.Item>
      </ListGroup>
    </Popover>
  );
  const filteredLocation = Array.isArray(allLocations) && allLocations.filter((location) =>
    location.name.toLowerCase().startsWith(locationSearchQuery.toLowerCase())
  );
  const filteredEmployee = Array.isArray(allEmployees) && allEmployees.filter((location) =>
    location.name.toLowerCase().startsWith(employeeSearchQuery.toLowerCase())
  );
  return (
    <div className='p-3 w-full'>

      <h1 className='text-black-50 font-weight-semibold mt-4'>Billing Summary Report</h1>
      <div className='p-2 bg-white px-2 w-100 rounded'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex justify-content-start align-items-center bg-gray'>
            <div className='d-flex justify-content-start align-items-center'>
              <SlidersHorizontal size={20} color='#696977' />
              <Nav>
                <NavDropdown
                  id="nav-dropdown-dark-example"
                  title="All Locations"
                  menuVariant="light"
                  className='text-secondary report-section'
                  style={{ color: "red" }}
                >
                  <div className="relative  w-[90%] m-auto h-[30px] flex items-center">
                    <input
                      autoFocus
                      className="w-full h-[30px] border pl-9 py-2 border-2 rounded-md focus:outline-blue-500 !border-gray-400"
                      onChange={(event) => setLocationSearchQuery(event.target.value)}
                      value={locationSearchQuery}
                    />
                    <SearchIcon className="absolute left-2 pointer-events-none text-gray-400" size={15} />
                  </div>
                  {Array.isArray(filteredLocation) && filteredLocation?.map((item, index) => {
                    return <NavDropdown.Item key={index} onClick={()=>selectLocation(item?.name)} >{item.name}</NavDropdown.Item>
                  })}
                </NavDropdown>
              </Nav>
            </div>
            <div className='d-flex justify-content-start align-items-center'>
              <Nav>
                <NavDropdown
                  id="nav-dropdown-dark-example"
                  title="All Staff Members"
                  menuVariant="light"
                  className='text-secondary report-section'
                  style={{ color: "red" }}
                >
                  <div className="relative  w-[90%] m-auto h-[30px] flex items-center">
                    <input
                      autoFocus
                      className="w-full h-[30px] border pl-9 py-2 border-2 rounded-md focus:outline-blue-500 !border-gray-400"
                      onChange={(event) => setEmployeeSearchQuery(event.target.value)}
                      value={employeeSearchQuery}
                    />
                    <SearchIcon className="absolute left-2 pointer-events-none text-gray-400" size={15} />
                  </div>
                  {Array.isArray(filteredEmployee) && filteredEmployee?.map((item, index) => {
                    return <NavDropdown.Item key={index}  onClick={()=>selectEmployee(item?.name)}>{item?.name}</NavDropdown.Item>
                  })}
                </NavDropdown>
              </Nav>
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
                  style={{width:"auto"}}
                >
                  <Popover id="date-picker-popover">
                    <Popover.Body >
                      <div className='d-flex justify-content-between gap-[20px] align-items-center'>
                      <div>
                        <label>Start Date:</label>
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          dateFormat="yyyy/MM/dd"
                          inline
                        />
                      </div>
                      <div>
                        <label>End Date:</label>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          dateFormat="yyyy/MM/dd"
                          inline
                          minDate={getEndDateMinDate()}
                          disabled={!startDate || !endDate}
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
          </div>
          <div>
            {authUserState.user.is_admin && 
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
              <MoreHorizontal />
            </OverlayTrigger>
            }
          </div>
        </div>
        <div>
          <p className='my-2'>This report was generated on Thursday November 28, 2024 at 1:47am. Load a fresh copy</p>
          <p className='my-2 fs-5'>November 1, 2024 to November 30, 2024</p>
        </div>
        <hr className='w-[100%] h-[1px] bg-secondary' />
        <div>
          <Table>
            <thead>
              <tr>
                <th colSpan="4" className="text-start text-black-50 fs-4">Billing Summary Report</th>
              </tr>
              <tr>
                <th>Location</th>
                <th>% Invoiced</th>
                <th>Invoiced</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
                <td>@mdo</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ReportSummary