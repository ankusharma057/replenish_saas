import Button from "react-bootstrap/Button";
import CustomModal from "./CustomModal";
import { useState } from "react";
import ModalWraper from "./ModalWraper";

function InvoiceListModal(props) {
  const { employeeInvoices } = props;
  const [modalShow, setModalShow] = useState(false);
  const [invoiceData, setinvoiceData] = useState(null);
  function handleClick() {
    setModalShow(!modalShow);
  }

  return (
    <>
      {modalShow && (
        <CustomModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          invoiceData={invoiceData}
        />
      )}

      <ModalWraper
        show={props.show}
        onHide={props.onHide}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        title={`${props.EmployeeName}`}
      >
        <div className="text-center flex flex-wrap gap-3 items-center justify-center">
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
        </div>
      </ModalWraper>
    </>
  );
}
export default InvoiceListModal;
