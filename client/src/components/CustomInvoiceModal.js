import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function CustomInvoiceModal(props) {
  let invoiceData = props.invoiceData;
  let invoiceID = invoiceData.id;
  let employeeName = invoiceData.employee_name;
  let products_hash = invoiceData.products_hash;
  let productName = invoiceData.product_name;
  let clientName = invoiceData.client_name;
  let charge = invoiceData.charge;
  let dateOfService = invoiceData.date_of_service;
  let conciergeFeePaid = invoiceData.concierge_fee_paid;
  let gfe = invoiceData.gfe;
  let paidByClientCash = invoiceData.paid_by_client_cash;
  let paidByClientCredit = invoiceData.paid_by_client_credit;
  let personalDiscount = invoiceData.personal_discount;
  let tip = invoiceData.tip;
  let comments = invoiceData.comments;
  let overheadFeeType = invoiceData.overhead_fee_type;
  let overheadFeeValue = invoiceData.overhead_fee_value;


  return (
    <Modal
      // {...props}
      show={props.show}
      onHide={props.onHide}
      dialogClassName="addwidth px-0 sm:px-2"
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <div className="my-invoice-modal">
        <Modal.Header className="modal-header-padding" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            InvoiceID: {invoiceID}
            <hr />
            Total: {charge}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center px-2 ">
          <form className="max-w-4xl mx-auto bg-white md:p-4 rounded-md">
            <div className=" border rounded-sm p-2 mb-4 gap-4 flex justify-around md:flex-row flex-wrap">
              <div className="flex flex-col">
                <span className="text-gray-700">Provider:</span>
                <span>{employeeName}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Client Name:</span>
                <span>{clientName}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Date of Service:</span>
                <span>{dateOfService}</span>
              </div>
            </div>

            {invoiceData?.products_hash?.products?.length > 0 && (
              <div className=" border rounded-sm p-2 mb-4 flex flex-col ">
                <p>
                  <b>Products</b>
                </p>

                <div className="overflow-x-auto rounded-sm p-2 mb-4 ">
                  <table className="table-auto  w-full ">
                    <thead className="whitespace-normal">
                      <tr>
                        <th className="min-w-[6rem]">Product</th>
                        <th className="min-w-[6rem]">Quantity</th>
                        <th className="min-w-[6rem]">Price</th>
                        <th className="min-w-[6rem]">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="whitespace-normal">
                      {invoiceData?.products_hash?.products.map(
                        (product, i) => (
                          <tr key={i}>
                            <td>{product[0]}</td>
                            <td>{product[1]}</td>
                            <td>{Number(product[2] || 0).toFixed(2)}</td>
                            <td>
                              {Number(product[1] * product[2] || 0).toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invoiceData?.products_hash?.retail_products?.length > 0 && (
              <div className=" border rounded-sm p-2 mb-4 flex flex-col ">
                <p>
                  <b>Retali Products</b>
                </p>

                <div className="overflow-x-auto rounded-sm p-2 mb-4 ">
                  <table className="table-auto  w-full ">
                    <thead className="whitespace-normal">
                      <tr>
                        <th className="min-w-[6rem]">Product</th>
                        <th className="min-w-[6rem]">Quantity</th>
                        <th className="min-w-[6rem]">Price</th>
                        <th className="min-w-[6rem]">Total Price</th>
                      </tr>
                    </thead>
                    <tbody className="whitespace-normal">
                      {invoiceData?.products_hash?.products.map(
                        (product, i) => (
                          <tr key={i}>
                            <td>{product[0]}</td>
                            <td>{product[1]}</td>
                            <td>{product[2]}</td>
                            <td>{+(product[1] * product[2])}</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className=" border rounded-sm p-2 mb-4 gap-4 flex justify-around md:flex-row flex-wrap">
              <div className="flex flex-col">
                <span className="text-gray-700">Concierge Fee Paid:</span>
                <span>{conciergeFeePaid ? "Yes" : "No"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">GFE:</span>
                <span>{gfe ? "Yes" : "No"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Paid By Client Cash:</span>
                <span>{paidByClientCash}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Paid By Client Credit:</span>
                <span>{paidByClientCredit}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Total Paid by Client:</span>
                <span>
                  {Number(
                    paidByClientCredit + paidByClientCash || 0
                  )?.toFixed() || paidByClientCredit + paidByClientCash}
                </span>
              </div>
            </div>

            <div className="border rounded-sm p-2 mb-4 gap-4 flex justify-around md:flex-row flex-wrap">
              <div className="flex flex-col">
                <span className="text-gray-700">Personal Discount:</span>
                <span>{personalDiscount}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Tip:</span>
                <span>{tip}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Comments:</span>
                <span>{comments}</span>
              </div>
            </div>

            <div className=" border rounded-sm p-2 mb-4 flex justify-content-around">
              <div className="flex flex-col">
                <span className="text-gray-700">Overhead Fee Type:</span>
                <span>{overheadFeeType || "Not given"}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-700">Overhead Fee Value:</span>
                <span>{overheadFeeValue || "Not given"}</span>
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
}

export default CustomInvoiceModal;
