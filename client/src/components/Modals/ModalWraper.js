import React from "react";
import { Button, Modal } from "react-bootstrap";

const ModalWraper = ({ show, onHide, children, title, footer, size,customClose }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      size={size || "md"}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="flex justify-between flex-col items-center gap-2">
        <div className="w-full">{children}</div>
      </Modal.Body>
      <Modal.Footer>
        {footer}
        {!customClose && <Button onClick={onHide}>Close</Button> }
      </Modal.Footer>
    </Modal>
  );
};

export default ModalWraper;
