import React, { useEffect, useState } from 'react'
import { Button, ButtonGroup, Dropdown, DropdownButton, ListGroup, Modal } from 'react-bootstrap'
import { PlusCircle, HelpCircle, GripVertical } from 'lucide-react';
import { getLocations } from '../../Server';
import { useNavigate } from 'react-router-dom';
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
const Locations = () => {
    const [allLocations, setAllLocations] = useState([])
    const [reorderAllLocations, setReorderAllLocations] = useState([])
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
        setReorderAllLocations(allLocations)
        setShowOrder(!showReorder)
    }
    const handleNavigation = (path) => {
        navigate(path)
    }
    const SortableItem = SortableElement(({ item }) => (
        <ListGroup.Item className="p-2">
            <div className="d-flex align-items-center">
                <GripVertical className="text-secondary me-2" />
                <p className="mb-0" style={{ fontSize: "14px" }}>
                    {item.name}
                </p>
            </div>
        </ListGroup.Item>
    ));
    const SortableList = SortableContainer(({ items }) => (
        <ListGroup>
            {items.map((item, index) => (
                <SortableItem key={item.id} index={index} item={item} />
            ))}
        </ListGroup>
    ));
    const onSortEnd = ({ oldIndex, newIndex }) => {
        setReorderAllLocations((prev) => arrayMoveImmutable(prev, oldIndex, newIndex));
    };
    const ReorderLocations = () => {
        return <div>
            <Modal show={showReorder} onHide={handleReorderModal}>
                <Modal.Header closeButton>
                    <Modal.Title className='text-muted fw-light'>Online Booking Location Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SortableList items={reorderAllLocations} onSortEnd={onSortEnd} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={handleReorderModal}>
                        Close
                    </Button>
                    <Button variant="outline-secondary" onClick={handleReorderModal} style={{ backgroundColor: "rgb(0, 193, 202)", color: "#fff", border: "1px solid rgb(0, 193, 202)" }}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    }
    return (
        <div style={{ height: "86vh", overflow: "scroll" }}>
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
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>&nbsp;{item.apartment!==null&&item.apartment+","}{item.street_address!==null&&item.street_address+","}{item.city!==null&&item.city+","}{item.city!==null&&item.city+","}{item.country!==null&&item.country}</p>
                                <p style={{ fontSize: "14px" }} className='text-muted text-selectable text-body'>&nbsp;{item.short_description!==null&&item.short_description}</p>
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