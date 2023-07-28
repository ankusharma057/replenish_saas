import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import CustomInvoiceModal from "./CustomInvoiceModal";
import { useState } from "react";

function CustomEmployeeModal(props) {
  const { employeeInvoices } = props;
  const [modalShow, setModalShow] = useState(false);
  const [invoiceData, setinvoiceData] = useState(null);
  function handleClick() {
    setModalShow(!modalShow);
  }
  return (
    <>
      {modalShow && (
        <CustomInvoiceModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          invoiceData={invoiceData}
        />
      )}
      <Modal
        show={props.show}
        onHide={props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            EmployeeId: {props.EmployeeId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center flex  flex-col gap-4">
          {employeeInvoices.map((data) => {
            return (
              <div key={data.id}>
                <Button
                  onClick={async () => {
                    await setinvoiceData(data);
                    handleClick();
                  }}
                  variant="info"
                >
                  Invoice ID: {data.id}
                </Button>
              </div>
            );
          })}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default CustomEmployeeModal;
