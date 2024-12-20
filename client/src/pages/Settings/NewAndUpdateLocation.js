import React, { useEffect, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { Button, Col, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import { createNewLocation, getEmployeesList, GetLocationDetails, UpdateLocation } from '../../Server'
import { toast } from 'react-toastify'
import {getData} from 'country-list';
const NewAndUpdateLocation = () => {
    const [formType, setFormType] = useState("new")
    const [locationId, setLocationId] = useState([])
    const [employeeList, setEmployeeList] = useState([])
    const params = useParams()
    const navigate = useNavigate()
    const [countries, setCountries] = useState([]);
    const [formData, setFormData] = useState({
        "name": "",
        "short_description": "",
        "long_description": "",
        "email": "",
        "phone_number": "",
        "fax": "",
        "street_address": "",
        "apartment": "",
        "city": "",
        "country": "",
        "province": "",
        "postal_code": "",
        "display_location_address": false,
        "display_map_in_emails": false,
        "legal_name": "",
        "business_number": "",
        "use_location_for_billing": false,
        "online_booking_available": false,
        "employee_ids": []
    })
    useEffect(() => {
        getAllEmployees();
        countryList();
        if (params.newOrUpdate !== "new") {
            setFormType("update");
            getLocationDetails();
        } else {
            const updatedFormData = {
                ...formData,
                location: ""
            };
            delete updatedFormData.name;
            setFormData(updatedFormData)
        }
    }, []);
    const countryList=()=>{
        const countriesArray = getData();
        const sortedCountries = countriesArray.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedCountries);
    };
    const getLocationDetails = async () => {
        try {
            const response = await GetLocationDetails(params.newOrUpdate, true);
            const newData = {
                ...response?.data,
                employee_ids: response?.data?.employees?.map(emp => emp?.id) || [],
            };
            setFormData(prevState => ({
                ...prevState,
                ...newData,
            }));
            setLocationId(response.data.id)
        } catch (error) {
            console.error("Error fetching location details:", error);
        }
    };
    
    const getAllEmployees = async () => {
        let response = await getEmployeesList();
        setEmployeeList(response.data)
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        let response;
        if(params.newOrUpdate==="new"){
        response = await createNewLocation(formData)
        }else{
            response = await UpdateLocation(locationId,formData)
        }
        if(response.status===200 || response.status===201){
            toast.success(params.newOrUpdate === "new"?"Location created":"Location updated");
            navigate("/settings/locations")
        }else{
            toast.error(response.data.error)
        }
        console.log("Form Data Submitted:", response);
    };
    const handleEmployeeSelection = (event,employeeId) => {
        event.stopPropagation();
        if (formData.employee_ids.includes(employeeId)) {
            setFormData((prev) => ({
                ...prev,
                employee_ids: formData.employee_ids.filter((id) => id !== employeeId)
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                employee_ids: [...formData.employee_ids, employeeId]
            }))
        }
    };
    return (
        <div style={{ height: "86vh", overflow: "scroll" }}>
            <h2 className='text-muted fw-light'>{formType === "update" ? `Edit Location ${formData?.name}` : "Create Location"}</h2>
            <Form onSubmit={handleSubmit}>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <Form.Label className={"text-secondary fw-bolder mb-4"}>Name</Form.Label>
                    <Form.Group className="mb-3">
                        <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Location Name - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                        <Form.Control type="text" required name={params.newOrUpdate === "new"?'location':"name"}value={params.newOrUpdate === "new"?formData.location:formData.name} onChange={handleChange} />
                    </Form.Group>
                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='mb-3'>
                        <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Employee - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                        <DropdownButton variant='outline-secondary' id="dropdown-basic-button" title="Select Employee" className='w-100'>
                            {Array.isArray(employeeList) && employeeList.map((employee, index) => {
                                return <Dropdown.Item key={index} className='d-flex justify-content-between align-items-center w-100 gap-[20px]' onClick={(e) => handleEmployeeSelection(e, employee?.id)}>{employee?.name}<Form.Check type='checkbox' checked={formData?.employee_ids.includes(employee?.id)} /></Dropdown.Item>
                            })}
                        </DropdownButton>
                    </div>
                    <div className='mb-3'>
                        <Form.Label className={"text-secondary fw-bolder mb-4"}>Client Communication</Form.Label>
                        <Form.Group className="mb-3">
                            <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Short Description - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                            <Form.Control type="text" name='short_description' value={formData.short_description} onChange={handleChange} />
                            <Form.Text className="text-muted">Appears with the location name on your online booking site and emails—e.g., a neighborhoods name or cross street.</Form.Text>
                        </Form.Group>
                    </div>
                    <div className='mb-3'>
                        <Form.Group className="mb-3">
                            <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Long Description - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                            <Form.Control as="textarea" rows={2} name='long_description' value={formData.long_description} onChange={handleChange} />
                            <Form.Text className="text-muted">Appears on the location information page of your online booking site and in appointment related emails—e.g., directions, parking instructions, etc.</Form.Text>
                        </Form.Group>
                    </div>

                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='mb-3'>
                        <Form.Label className={"text-secondary fw-bolder mb-4"}>Contact Info</Form.Label>
                        <Row>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Email</Form.Label>
                                    <Form.Control type="text" name='email' value={formData.email} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={6} sm={6} md={6} kg={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Phone Number</Form.Label>
                                    <Form.Control type="text" name='phone_number' value={formData.phone_number} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={6} sm={6} md={6} kg={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Fax</Form.Label>
                                    <Form.Control type="text" name='fax' value={formData.fax} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='mb-3'>
                        <div className='d-flex flex-column'>
                            <Form.Label className={"text-secondary fw-bolder"}>Location Address & Map</Form.Label>
                            <Form.Text className="text-muted" style={{ fontSize: "13px" }}>Enter your location's address for directions and maps.</Form.Text>
                        </div>
                        <Row className='mt-3'>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Street Address - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                    <Form.Control type="text" name='street_address' value={formData.street_address} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Apartment,Suite,etc.</Form.Label>
                                    <Form.Control type="text" name='apartment' value={formData.apartment} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>City - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                    <Form.Control type="text" name='city' value={formData.city} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Country - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                <Form.Select name='country' value={formData.country} onChange={handleChange}   style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <option>Select Country</option>
                                    {countries.map((country,index)=>{
                                        return <option value={country.name} key={index}>{country?.name}</option>
                                    })}
                                </Form.Select>
                            </Col>
                            <Col xs={6} sm={6} md={6} kg={6} className='mt-2'>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Province - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                    <Form.Control type="text" name='province' value={formData.province} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={6} sm={6} md={6} kg={6} className='mt-2'>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Postal / Zip - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                    <Form.Control type="text" name='postal_code' value={formData.postal_code} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <hr style={{ width: "100%", backgroundColor: "#eeeeee" }} className='my-3' />
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type={"checkbox"}
                                        label={`Display location address on your online booking site and emails`}
                                        name='display_location_address'
                                        checked={formData.display_location_address}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type={"checkbox"}
                                        label={`Display location address on your online booking site and emails`}
                                        name='display_map_in_emails'
                                        checked={formData.display_map_in_emails}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6} sm={6} md={6} kg={6}>
                                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.8999029001293!2d75.86491477563062!3d22.694769879404863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fce47dec0805%3A0x331b298a7dc1d08e!2sVijay%20Nagar%2C%20Indore%2C%20Madhya%20Pradesh%20452001!5e0!3m2!1sen!2sin!4v1734584599226!5m2!1sen!2sin" style={{ border: "none", width: "100%", height: "450px" }} allowFullScreen={true} loading="lazy"></iframe>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='mb-3'>
                        <div className='d-flex flex-column'>
                            <Form.Label className={"text-secondary fw-bolder"}>Billing Information</Form.Label>
                            <Form.Text className="text-muted" style={{ fontSize: "13px" }}>Information that appears on your invoices, receipts and statements.</Form.Text>
                        </div>
                        <Row className='mt-3'>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Legal Name - <span className='d-flex gap-[10px] align-items-center' style={{ fontSize: "10px", fontStyle: "italic" }}>Required <HelpCircle size={10} /></span></Form.Label>
                                    <Form.Control type="text" name='legal_name' value={formData.legal_name} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className={"text-secondary fw-light d-flex align-items-center"}>Business Numbers / Tax Numbers</Form.Label>
                                    <Form.Control type="text" name='business_number' value={formData.business_number} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <hr style={{ width: "100%", backgroundColor: "#eeeeee" }} className='my-3' />
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type={"checkbox"}
                                        label={`Use my location address for billing`}
                                        name='use_location_for_billing'
                                        checked={formData.use_location_for_billing}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='mb-3'>
                        <div className='d-flex flex-column'>
                            <Form.Label className={"text-secondary fw-bolder"}>Online Booking</Form.Label>
                        </div>
                        <Row className='mt-3'>
                            <Col xs={12} sm={12} md={12} kg={12}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type={"checkbox"}
                                        label={`Location available to be booked online`}
                                        name='online_booking_available'
                                        checked={formData.online_booking_available}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className='mt-4 bg-white p-3 rounded border'>
                    <div className='d-flex justify-content-end align-items-center gap-[20px]'>
                        <Button variant='outline-secondary' onClick={()=>navigate("/settings/locations")}>Cancel</Button>
                        <Button variant='outline-secondary' type='submit' style={{ backgroundColor: "#00c1ca", border: "1px solid #00c1ca", color: "#fff" }}>Save</Button>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default NewAndUpdateLocation