import { Button } from "react-bootstrap";

import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
const EditProfileModal = (props) => {
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
                        <Form.Control type="test" placeholder="Enter Full Name" value={props.editProfileData?.name} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control type="number" placeholder="Enter Phone Number" value={props.editProfileData?.phone} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter Email Address" value={props.editProfileData?.email} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control as="textarea" rows={3} value={props.editProfileData?.address} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default EditProfileModal