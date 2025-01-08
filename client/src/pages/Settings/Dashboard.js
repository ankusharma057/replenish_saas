import React, { useEffect, useRef, useState } from 'react'
import { Form, Overlay, Popover, Table } from 'react-bootstrap'
import { getEmployeesList, getLocations } from '../../Server'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import { BiSolidDownArrow } from 'react-icons/bi';
import { PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
    const [allLocations, setAllLocations] = useState([])
    const [selectedLocationName, setSelectedLocationsName] = useState("")
    const [allEmployees, setAllEmployees] = useState([])
    const [selectedEmployeeId, setSelectedEmployeeId] = useState([])
    const [selectedEmployeeName, setSelectedEmployeesName] = useState("")
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [payload, setPayload] = useState({})
    const [locationSearchQuery, setLocationSearchQuery] = useState("")
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState("")
    const [show, setShow] = useState(false);
    const [target, setTarget] = useState(null);
    const buttonRef = useRef(null);
    const [pieChart1Title, setPieChart1Title] = useState("Arrived")
    const [pieChart1Value, setPieChart1Value] = useState(33)
    const [pieChart1Active, setPieChart1Active] = useState(null)
    const [pieChart2Title, setPieChart2Title] = useState("Booked By Staff")
    const [pieChart2Value, setPieChart2Value] = useState(33)
    const [pieChart2Active, setPieChart2Active] = useState(null)
    const [pieChart3Title, setPieChart3Title] = useState("Arrived")
    const [pieChart3Value, setPieChart3Value] = useState(33)
    const [pieChart3Active, setPieChart3Active] = useState(null)
    const data1 = [
        { name: 'Arrived', value: 33, color: 'rgb(142, 197, 117)' },
        { name: 'No Show', value: 1, color: '#888888' },
        { name: 'Canceled', value: 12, color: '#D98880' },
    ];
    const data2 = [
        { name: 'Booked Online', value: 1, color: 'rgb(91, 210, 220)' },
        { name: 'Booked By Staff', value: 64, color: 'rgb(133, 197, 229)' },
    ];
    const data3 = [
        { name: 'New Clients', value: 18, color: 'rgb(0, 193, 202)' },
        { name: 'Returning Clients', value: 8, color: '#8FC77D' },
    ];

    useEffect(() => {
        GetAllLocations();
        GetAllEmployees();
    }, [])
    const GetAllLocations = async () => {
        let response = await getLocations();
        setAllLocations(response.data);
    }
    const GetAllEmployees = async () => {
        let response = await getEmployeesList();
        setAllEmployees(response.data)
        let allIds = response.data.map((item) => { return item.id })
        setSelectedEmployeeId(allIds)

    }
    const selectLocation = async (event) => {
        let location = filteredLocation.find((item) => { return item.name === event.target.value });
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
        }
    };
    const selectEmployee = async (event) => {
        let employee = filteredEmployee.find((item) => { return item.name === event.target.value });
        if (employee) {
            setSelectedEmployeesName(employee.name)
            setSelectedEmployeeId([employee.id])
            setPayload((prevPayload) => ({
                ...prevPayload,
                employee_id: [employee.id]
            }));
        }
    };
    const handleStartDate = async (date) => {
        setStartDate(date);
        await setPayload((prev) => ({
            ...prev,
            "start_date": moment(date).format('YYYY-MM-DD'),
        }))
        if (endDate && date > endDate) {
            setEndDate(null);
            setPayload((prev) => ({
                ...prev,
                "end_date": ""
            }))
        }
    };

    const handleEndDate = async (date) => {
        setEndDate(date);
        await setPayload((prev) => ({
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
    const handleToggle = (event) => {
        setShow(!show);
        setTarget(event.target);
    };
    const filteredLocation = Array.isArray(allLocations) && allLocations.filter((location) =>
        location.name.toLowerCase().startsWith(locationSearchQuery.toLowerCase())
    );
    const filteredEmployee = Array.isArray(allEmployees) && allEmployees.filter((location) =>
        location.name.toLowerCase().startsWith(employeeSearchQuery.toLowerCase())
    );
    return (
        <div>
            <p className='fw-light text-muted fs-3'>Dashboard</p>
            <div className='px-3 py-4 bg-white border rounded'>
                <div className='d-flex justify-content-start align-items-center gap-[15px]'>
                    <div className='border rounded'>
                        <Form.Select aria-label="Default select example" onChange={selectLocation} value={selectedLocationName}>
                            <option>All Locations</option>
                            {Array.isArray(allLocations) && allLocations.map((item, index) => {
                                return <option value={item?.name} key={index}>
                                    {item?.name}
                                </option>
                            })}
                        </Form.Select>
                    </div>
                    <div className='border rounded'>
                        <Form.Select aria-label="Default select example" onChange={selectEmployee} value={selectedEmployeeName}>
                            <option>All Staff</option>
                            {Array.isArray(allEmployees) && allEmployees.map((item, index) => {
                                return <option value={item?.name} key={index}>
                                    {item?.name}
                                </option>
                            })}
                        </Form.Select>
                    </div>
                    <div className='d-flex justify-content-start align-items-center border px-3 py-2 rounded'>
                        <div>
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
                    <div>
                        <p className='text-black-50 mb-0 fs-2 fw-light'>{moment(startDate, 'dddd MMMM D, YYYY').format('YYYY-MM-DD')} to {moment(endDate, 'dddd MMMM D, YYYY').format('YYYY-MM-DD')}</p>
                    </div>
                </div>
                <div className='d-flex justify-content-between align-items-start gap-[30px] mt-3'>
                    <div className='d-flex flex-column'>
                        <div style={{ position: 'relative', width: 300, height: 300 }}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={data1}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={140}
                                    activeOuterRadius={150}
                                    activeIndex={pieChart1Active}
                                    onMouseEnter={(data, index) => { setPieChart1Title(data.name); setPieChart1Value(data.value); setPieChart1Active(index) }}
                                    onMouseLeave={() => { setPieChart1Title('Arrived'); setPieChart1Value(33); setPieChart1Active(null) }}
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {data1.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            onMouseEnter={() => setPieChart1Active(index)}
                                            onMouseLeave={() => setPieChart1Active(null)}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                }}
                            >
                                <h1 style={{ margin: 0, fontSize: '21px', fontWeight: 'bold' }}>
                                    {pieChart1Title}
                                </h1>
                                <p style={{ margin: 0, fontSize: '21px', fontWeight: 'bold' }}>
                                    {pieChart1Value}
                                </p>
                            </div>
                            <p style={{ textAlign: 'center' }}>Booking</p>
                        </div>
                        <div className='mt-5'>
                            <Table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>
                                            Dec 1 2024<br />
                                            to<br />
                                            Dec 31 2024</th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>
                                            Oct 31 2024<br />
                                            to<br />
                                            Nov 30 2024</th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>% Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Arrived</td>
                                        <td>33</td>
                                        <td>45</td>
                                        <td>-27%</td>
                                    </tr>
                                    <tr>
                                        <td>Cancelled</td>
                                        <td>12</td>
                                        <td>7</td>
                                        <td>71%</td>
                                    </tr>
                                    <tr>
                                        <td>No Show</td>
                                        <td>1</td>
                                        <td>4</td>
                                        <td>-75%</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        <div style={{ position: 'relative', width: 300, height: 300 }}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={data2}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={140}
                                    activeOuterRadius={150}
                                    activeIndex={pieChart2Active}
                                    onMouseEnter={(data, index) => { setPieChart2Title(data.name); setPieChart2Value(data.value); setPieChart2Active(index) }}
                                    onMouseLeave={() => { setPieChart2Title('Arrived'); setPieChart2Value(33); setPieChart2Active(null) }}
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {data2.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            onMouseEnter={() => setPieChart2Active(index)}
                                            onMouseLeave={() => setPieChart2Active(null)}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                }}
                            >
                                <h1 style={{ margin: 0, fontSize: '21px', fontWeight: 'bold' }}>
                                    {pieChart2Title}
                                </h1>
                                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                                    {pieChart2Value}
                                </p>
                            </div>
                            <p style={{ textAlign: 'center' }}>Online Booked vs. Booked by Staff</p>
                        </div>
                        <div className='mt-5'>
                            <Table>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>
                                            Dec 1 2024 <br />
                                            to <br />
                                            Dec 31 2024</th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>
                                            Oct 31 2024<br />
                                            to<br />
                                            Nov 30 2024
                                        </th>
                                        <th style={{ fontSize: "14px", color: "#555555" }}>% Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ fontSize: "14px", fontWeight: 800, color: "#555555" }}>Booked Online</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0%</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: "14px", fontWeight: 800, color: "#555555" }}>Booked by Staff</td>
                                        <td>64</td>
                                        <td>74</td>
                                        <td>-14%</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        <div style={{ position: 'relative', width: 300, height: 300 }}>
                            <PieChart width={300} height={300}>
                                <Pie
                                    data={data3}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={100}
                                    outerRadius={140}
                                    activeOuterRadius={150}
                                    activeIndex={pieChart3Active}
                                    onMouseEnter={(data, index) => { setPieChart3Title(data.name); setPieChart3Value(data.value); setPieChart3Active(index) }}
                                    onMouseLeave={() => { setPieChart3Title('Arrived'); setPieChart3Value(33); setPieChart3Active(null) }}
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {data3.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            onMouseEnter={() => setPieChart3Active(index)}
                                            onMouseLeave={() => setPieChart3Active(null)}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    textAlign: 'center',
                                }}
                            >
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                                    {pieChart3Title}
                                </h1>
                                <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                                    {pieChart3Value}
                                </p>
                            </div>
                            <p style={{ textAlign: 'center' }}>New vs. Returning</p>
                        </div>
                        <div className='mt-5'>
                            <Table>
                                <tbody>
                                    <tr>
                                        <td style={{ fontSize: "14px", fontWeight: 800, color: "#555555" }}>New Clients</td>
                                        <td>8</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: "14px", fontWeight: 800, color: "#555555" }}>Returning Clients</td>
                                        <td>18</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontSize: "14px", fontWeight: 800, color: "#555555" }}>Total Clients</td>
                                        <td>26</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard