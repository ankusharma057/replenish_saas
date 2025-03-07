import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Dropdown, DropdownButton, ListGroup, Modal } from 'react-bootstrap'
import { PlusCircle, HelpCircle, GripVertical } from 'lucide-react';
import { GetAllEmployeesLocations, ReorderLocation } from '../../Server';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthUserContext';
import { toast } from 'react-toastify';
const Locations = () => {
    const [allLocations, setAllLocations] = useState([])
    const [reorderAllLocations, setReorderAllLocations] = useState([])
    const [showReorder, setShowOrder] = useState(false);
    const navigate=useNavigate()
    const { authUserState } = useAuthContext();
    useEffect(() => {
        getAllLocations();
    }, [])
    const getAllLocations = async () => {
        let response = await GetAllEmployeesLocations({employee_id:authUserState.user.id},true)
        setAllLocations(response.data)
    }
    const handleReorderModal = () => {
        setReorderAllLocations(allLocations)
        setShowOrder(!showReorder)
    }
    const handleNavigation = (path) => {
        navigate(path)
    }
    const handleReorder = async () => {
        let locationIds = await reorderAllLocations.map((item) => { return item.id })
        let payload={
            employee_id:authUserState.user.id,
            location_ids:locationIds
        }
        let response = await ReorderLocation(payload);
        if (response.status === 200 || response.status === 201) {
            toast.success(response.data.success);
            await getAllLocations();
            handleReorderModal()
        } else {
            toast.error(response.data.success)
        }
    };
    const checkNullValue=(value)=>{
        return value === null || value === "" ? "": value+", "
    };
    const ReorderLocations = () => {
        return <div>
            <Modal show={showReorder} onHide={handleReorderModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='text-muted fw-light'>Online Booking Location Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        {allLocations.map((item, index) => {
                            return <ListGroup.Item className="p-2" key={index}>
                                <div className="d-flex align-items-center">
                                    <GripVertical className="text-secondary me-2" />
                                    <p className="mb-0" style={{ fontSize: "14px" }}>
                                        {item.name}
                                    </p>
                                </div>
                            </ListGroup.Item>
                        })}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleReorderModal}>
                        Close
                    </Button>
                    <Button variant="outline-secondary" onClick={handleReorder} style={{ backgroundColor: "rgb(0, 193, 202)", color: "#fff", border: "1px solid rgb(0, 193, 202)" }}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    }
    return (
        <div>
            <ReorderLocations />
            <div className='d-flex justify-content-between align-items-center w-100'>
                <h2 className='text-secondary fw-light'>Locations</h2>
                <Button className='d-flex gap-[10px] justify-content-center align-items-center' variant='outline-secondary' style={{ backgroundColor: "#00c1ca", color: "#fff", border: "none" }} onClick={()=>handleNavigation(`/settings/locations/new`)}><PlusCircle color='#fff' size={20} />Create Location</Button>
            </div>
            <div className='my-2'>
                <p className='text-muted fw-light mb-4' style={{ fontSize: "13px" }}>If your clinic has multiple locations and operates as a single business, you can set up each of your locations here. You can then schedule your shifts and appointments at each location and Clients  can choose a location when booking online. If your locations each operate as individual businesses with separate financials, we recommend you use multiple Jane accounts. Please contact us to set this up. <span style={{ color: "#00c1ca" }}>Learn more about Locations</span></p>
                <p className='d-flex text-muted fw-light mb-4' style={{ fontSize: "13px" }}>Reorder Locations in the list to set the order for online booking. The first location in the list is your<span className='d-flex gap-[10px] justify-content-center align-items-center text-muted'> Primary location<HelpCircle size={15} /></span></p>
            </div>
            <ListGroup>
                <ListGroup.Item>
                    <div className='d-flex justify-content-between align-items-center py-1'>
                        <DropdownButton as={ButtonGroup} title={"Action"} variant='outline-secondary'>
                            <Dropdown.Item eventKey="1">Active</Dropdown.Item>
                            <Dropdown.Item eventKey="2">All</Dropdown.Item>
                            <Dropdown.Item eventKey="3" active>Archived</Dropdown.Item>
                        </DropdownButton>
                        <Button variant='outline-secondary' size='md' onClick={handleReorderModal}>Reorder Locations</Button>
                    </div>
                </ListGroup.Item>
                {allLocations.map((item, index) => {
                    return <ListGroup.Item key={index}>
                        <div className='d-flex justify-content-between align-items-center py-1'>
                            <div>
                                <p className='fw-bolder'>{item?.name}</p>
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>
                                    &nbsp;
                                    {checkNullValue(item.street_address)}
                                    {checkNullValue(item.apartment)}
                                    {checkNullValue(item.city)}
                                    {checkNullValue(item.country)}
                                </p>
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>
                                    &nbsp;
                                    {item.short_description!==null&&item.short_description}
                                </p>
                            </div>
                            <div>
                                <Button variant='outline-secondary' size='md'  onClick={()=>handleNavigation(`/settings/locations/${item.id}`)}>Edit</Button>
                            </div>
                        </div>
                    </ListGroup.Item>
                })}
                <ListGroup.Item>
                    <p className='text-muted text-center mt-3' style={{ fontSize: "12px" }}>Showing all active locations</p>
                </ListGroup.Item>
            </ListGroup>
        </div>
    )
}

export default Locations