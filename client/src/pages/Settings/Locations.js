import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Dropdown, DropdownButton, ListGroup, Modal } from 'react-bootstrap'
import { PlusCircle, HelpCircle, GripVertical } from 'lucide-react';
import { getLocations } from '../../Server';
import { Draggable, Droppable } from 'react-drag-and-drop'
import { useNavigate } from 'react-router-dom';
const Locations = () => {
    const [allLocations, setAllLocations] = useState([])
    const [showReorder, setShowOrder] = useState(false);
    const navigate=useNavigate()
    useEffect(() => {
        getAllLocations();
    }, [])
    const getAllLocations = async () => {
        let response = await getLocations(true)
        setAllLocations(response.data)
    }
    const handleReorderModal = () => {
        setShowOrder(!showReorder)
    }
    const onDrop = (data) => {
        console.log(data);
        // => banana 
    };
    const handleNavigation=(path)=>{
        navigate(path)
    }
    const ReorderLocations = () => {
        return <div>
            <Modal show={showReorder} onHide={handleReorderModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <h2 style={{fontWeight:300,fontSize:"13px",marginBottom:"20px"}}>Click and drag to set the order of your locations for online booking.</h2>
                        <div style={{maxHeight:"500px",overflow:"scroll"}}>
                        <ListGroup>
                            {allLocations.map((item, index) => {
                                return <Draggable type="location" data={item?.name}  key={index}><ListGroup.Item className='p-2'>
                                    <div className='d-flex justify-content-between align-items-center py-1'>
                                        <div className='d-flex justify-content-start align-items-center'>
                                            <GripVertical className='text-secondary'/>
                                            <p className='fw-light text-dark mb-0' style={{fontSize:"14px"}}>{item?.name}</p>
                                        </div>
                                    </div>
                                </ListGroup.Item></Draggable>
                            })}
                        </ListGroup>
                        </div>
                        <Droppable
                            types={['location']}
                            onDrop={onDrop}>
                            <ul className="Smoothie"></ul>
                        </Droppable>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleReorderModal}>
                        Close
                    </Button>
                    <Button variant="outline-secondary" onClick={handleReorderModal} style={{backgroundColor:"rgb(0, 193, 202)",color:"#fff",border:"1px solid rgb(0, 193, 202)"}}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    }
    return (
        <div style={{height:"86vh",overflow:"scroll"}}>
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
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>1818 Washington Ave, Houston, United States</p>
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>This location is listed in online booking, but the address is hidden online and in emails.</p>
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