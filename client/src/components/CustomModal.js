import Modal from "react-bootstrap/Modal";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";
import { saveAs } from "file-saver";

const UpdateInvoiceModal = ({
  showUpdateModal,
  handleNestedClick,
  invoiceID,
  nestedInputModal,
  updateSubmit,
  setNestedInputModal,
}) => {
  console.log(nestedInputModal);
  return (
    <Modal
      show={showUpdateModal}
      onHide={handleNestedClick}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <div className="my-invoice-modal">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Update Invoice
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-left">
          <div className="text-2xl text-gray-700">InvoiceID: {invoiceID}</div>
          <form className="max-w-4xl mx-auto bg-white p-4 rounded-md">
            <div className=" border rounded-sm p-2 mb-4 flex-col gap-2 flex justify-content-around">
              <div>
                Overhead Fee Type:
                <select
                  name="overheadFeeType"
                  value={nestedInputModal.overheadFeeType}
                  onChange={(event) =>
                    setNestedInputModal({
                      ...nestedInputModal,
                      overheadFeeType: event.target.value,
                    })
                  }
                  className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              <div>
                Overhead Fee Value:
                <input
                  type="number"
                  name="overheadFeeValue"
                  value={nestedInputModal.overheadFeeValue}
                  min="0"
                  onChange={(event) =>
                    setNestedInputModal({
                      ...nestedInputModal,
                      overheadFeeValue: event.target.value,
                    })
                  }
                  className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                />
              </div>

              <div>
                Total
                <input
                  type="number"
                  name="overheadFeeValue"
                  value={nestedInputModal.charge}
                  min="0"
                  onChange={(event) =>
                    setNestedInputModal({
                      ...nestedInputModal,
                      charge: event.target.value,
                    })
                  }
                  className="w-full mt-1 p-1 border-gray-300 border rounded-md"
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={updateSubmit}>Submit</Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

const RejectInvoiceModal = ({
  setShowRejectModal,
  showRejectModal,
  invoiceID,
  rejectSubmit,
  settextAreaInput,
  u,
}) => {
  return (
    <Modal
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
          {/* <form className="max-w-4xl mx-auto bg-white p-4 rounded-md"> */}
          <Form.Control
            as="textarea"
            placeholder="Please give your feedback while this invoice is being rejected. This invoice will be deleted after you submit your feedback."
            className="h-[100px]"
            onChange={(e) => settextAreaInput(e.target.value)}
          />
          {/* </form> */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={rejectSubmit}>
            Reject Invoice
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

function CustomModal(props) {
  var invoiceData = props.invoiceData;
  var invoiceID = invoiceData.id;
  var employeeName = invoiceData.employee_name;
  var clientName = invoiceData.client_name;
  var charge = invoiceData.charge;
  var dateOfService = invoiceData.date_of_service;
  var conciergeFeePaid = invoiceData.conciergeFeePaid;
  var gfe = invoiceData.gfe;
  var paidByClientCash = invoiceData.paid_by_client_cash;
  var paidByClientCredit = invoiceData.paid_by_client_credit;
  var personalDiscount = invoiceData.personal_discount;
  var tip = invoiceData.tip;
  var comments = invoiceData.comments;
  var overheadFeeType = invoiceData.overhead_fee_type;
  var overheadFeeValue = invoiceData.overhead_fee_value;
  let show = props.show;
  let onHide = props.onHide;
  let fiInvoiceList = props.fiInvoiceList;
  let userProfile = props.userProfile;
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [nestedInputModal, setNestedInputModal] = useState({
    overheadFeeType,
    overheadFeeValue,
    charge,
  });

  const [textAreaInput, settextAreaInput] = useState("");
  useEffect(() => {
    setNestedInputModal({
      overheadFeeType,
      overheadFeeValue,
      charge,
    });
    return () => {};
  }, [charge, overheadFeeType, overheadFeeValue]);

  function handleNestedClick() {
    setShowUpdateModal(!showUpdateModal);
  }

  const updateSubmit = () => {
    fetch(`/api/invoices/${invoiceID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        overhead_fee_type: nestedInputModal.overheadFeeType,
        overhead_fee_value: nestedInputModal.overheadFeeValue,
        charge: nestedInputModal.charge,
      }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Invoice Updated successfully.");

          window.location.reload();
        } else if (res.status === 404) {
          res.json().then((json) => {
            toast.error("Please provide a client.");
          });
        } else {
          res.json().then((json) => {
            toast.error("Failed to Update Invoice");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  const downloadInvoice = () => {
    fetch(`/api/invoices/${invoiceID}/download_attachment`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        if (res.status === 404) {
          res.json().then((json) => {
            toast.error("Failed to Download the Invoice");
          });
        } else {
          toast.success("Invoice Downloaded successfully.");
          const blob = await res.blob();
          saveAs(
            blob,
            `${invoiceData?.employee?.name}${
              invoiceData?.is_finalized ? "-Finalized" : "-Non-Finalized"
            }-Invoice-${invoiceID}.pdf`
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  const rejectSubmit = () => {
    // console.log({ textAreaInput });
    fetch(`/api/invoices/${invoiceID}/send_reject_mail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback: textAreaInput }),
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Invoice Rejected successfully.");

          window.location.reload();
        } else if (res.status === 404) {
          res.json().then((json) => {
            toast.error("Please provide a client.");
          });
        } else {
          res.json().then((json) => {
            toast.error("Failed to Reject Invoice");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div className="my-invoice-modal">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              InvoiceID: {invoiceID}
              <hr />
              Total: {charge}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
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
                                {Number(product[1] * product[2] || 0).toFixed(
                                  2
                                )}
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
                    <b>Retail Products</b>
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
                        {invoiceData?.products_hash?.retail_products.map(
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
                  <span>{overheadFeeType}</span>
                </div>

                <div className="flex flex-col">
                  <span className="text-gray-700">Overhead Fee Value:</span>
                  <span>{overheadFeeValue}</span>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            {userProfile?.is_admin === true && fiInvoiceList === false && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowRejectModal(true);
                    // onHide();
                  }}
                >
                  Reject
                </Button>
                <RejectInvoiceModal
                  setShowRejectModal={setShowRejectModal}
                  showRejectModal={showRejectModal}
                  invoiceID={invoiceID}
                  rejectSubmit={rejectSubmit}
                  settextAreaInput={settextAreaInput}
                  textAreaInput={textAreaInput}
                />
              </>
            )}
            {fiInvoiceList === false && (
              <>
                <Button
                  onClick={() => {
                    setShowUpdateModal(true);
                    // onHide();
                  }}
                >
                  Update
                </Button>
                <UpdateInvoiceModal
                  showUpdateModal={showUpdateModal}
                  handleNestedClick={handleNestedClick}
                  invoiceID={invoiceID}
                  nestedInputModal={nestedInputModal}
                  updateSubmit={updateSubmit}
                  setNestedInputModal={setNestedInputModal}
                />
              </>
            )}
            {invoiceData?.is_finalized && (
              <Button onClick={downloadInvoice}>Download</Button>
            )}
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </div>
      </Modal>
    </>
  );
}

export default CustomModal;
