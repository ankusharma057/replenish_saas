import { Button } from "react-bootstrap";

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const EditProfileModal = (props) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    useEffect(() => {
        if (props.editProfileData) {
            setName(props.editProfileData.name);
            setPhone(props.editProfileData.phone_number);
            setEmail(props.editProfileData.email);
            setAddress(props.editProfileData.address);
        }
    }, [props.editProfileData]);
    const handleNameChange = (event) => {
        setName(event.target.value)
    };
    const handlePhoneChange = (event) => {
        setPhone(event.target.value)
    };
    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    };
    const handleAddressChange = (event) => {
        setAddress(event.target.value)
    };

    const handleSave = () => {
        props.handleEditClientProfile(handlePayload());
    };

    const handlePayload = () => {
        const updatedProfileData = {
            client: {}
        };
        if (props.editProfileData.name !== name) {
            updatedProfileData.client["name"] = name
        }
        if (props.editProfileData.phone_number !== phone) {
            updatedProfileData.client["phone_number"] = phone
        }
        if (props.editProfileData.email !== email) {
            updatedProfileData.client["email"] = email
        }
        if (props.editProfileData.address !== address) {
            updatedProfileData.client["address"] = address
        }
        return updatedProfileData
    }
    const handleDisableBtn = () => {
        if (props.editProfileData.name !== name ||
            props.editProfileData.email !== email ||
            props.editProfileData.phone_number !== phone ||
            props.editProfileData.address !== address) {
            return false
        } else {
            return true
        }
    }
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit Client Profile
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="test" placeholder="Enter Full Name" value={name} onChange={handleNameChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control type="number" placeholder="Enter Phone Number" value={phone} onChange={handlePhoneChange}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter Email Address" value={email} onChange={handleEmailChange}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control as="textarea" rows={3} value={address} onChange={handleAddressChange}/>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSave} disabled={handleDisableBtn()}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default EditProfileModal