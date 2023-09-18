import { Form } from "react-bootstrap";
import Loadingbutton from "../Buttons/Loadingbutton";
import ModalWraper from "./ModalWraper";

const RejectInvoiceModal = ({
  setShowRejectModal,
  showRejectModal,
  invoiceID,
  rejectSubmit,
  settextAreaInput,
  loading,
}) => {
  return (
    <>
      <ModalWraper
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        title={"Reject Invoice"}
        footer={
          <>
            <Loadingbutton
              isLoading={loading}
              form="rejectForm"
              title="Submit"
              loadingText="Rejecting Invoice..."
              type="submit"
              variant="danger"
            >
              Submit
            </Loadingbutton>
          </>
        }
      >
        <Form onSubmit={rejectSubmit} id="rejectForm">
          <div className="text-2xl text-gray-700">InvoiceID: {invoiceID}</div>
          <br />
          <Form.Control
            as="textarea"
            placeholder="Please give your feedback while this invoice is being rejected. This invoice will be deleted after you submit your feedback."
            className="h-[100px]"
            onChange={(e) => settextAreaInput(e.target.value)}
          />
        </Form>
      </ModalWraper>
      {/* <Modal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="my-invoice-modal">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Reject Invoice
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-left">
            <div className="text-2xl text-gray-700">InvoiceID: {invoiceID}</div>
            <br />
            <Form.Control
              as="textarea"
              placeholder="Please give your feedback while this invoice is being rejected. This invoice will be deleted after you submit your feedback."
              className="h-[100px]"
              onChange={(e) => settextAreaInput(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={rejectSubmit}>
              Reject Invoice
            </Button>
          </Modal.Footer>
        </div>
      </Modal> */}
    </>
  );
};



export default RejectInvoiceModal;