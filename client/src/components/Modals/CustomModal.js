import React, { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { saveAs } from "file-saver";
import ModalWraper from "./ModalWraper";
import UpdateInvoiceModal from "./UpdateInvoiceModal";
import RejectInvoiceModal from "./RejectInvoiceModal";
import {
  downloadInvoice,
  getUpdatedUserProfile,
  rejectInvoice,
  updateInvoice,
} from "../../Server";
import { useAuthContext } from "../../context/AuthUserContext";
import { LOGIN } from "../../Constants/AuthConstants";

function CustomModal({
  invoiceData,
  show,
  onHide,
  fiInvoiceList,
  userProfile,
  getInvoices,
}) {
  const invoiceID = invoiceData.id;
  const employeeName = invoiceData.employee_name;
  const clientName = invoiceData.client_name;
  const charge = invoiceData.charge;
  const dateOfService = invoiceData.date_of_service;
  const conciergeFeePaid = invoiceData.conciergeFeePaid;
  const gfe = invoiceData.gfe;
  const paidByClientCash = invoiceData.paid_by_client_cash;
  const paidByClientCredit = invoiceData.paid_by_client_credit;
  const personalDiscount = invoiceData.personal_discount;
  const tip = invoiceData.tip;
  const comments = invoiceData.comments;
  const overheadFeeType = invoiceData.overhead_fee_type;
  const overheadFeeValue = invoiceData.overhead_fee_value;

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [nestedInputModal, setNestedInputModal] = useState({
    overhead_fee_type: "",
    overhead_fee_value: "",
    charge: 0,
  });

  const { authUserDispatch } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [textAreaInput, settextAreaInput] = useState("");

  // this will close or open the nested updated modal
  function handleNestedClick() {
    setShowUpdateModal(!showUpdateModal);
  }

  // refectored
  const updateSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        overhead_fee_type:
          // if nestedInputModal.overhead_fee_type is not empty then use it else use previously
          nestedInputModal.overhead_fee_type || invoiceData.overhead_fee_type,
        overhead_fee_value:
          nestedInputModal.overhead_fee_value || invoiceData.overhead_fee_value,
        charge: nestedInputModal.charge || invoiceData.charge,
      };
      setLoading(true);
      await updateInvoice(invoiceID, updateData);
      toast.success("Invoice Updated successfully.");
      const { data: useData } = await getUpdatedUserProfile(true);
      authUserDispatch({ type: LOGIN, payload: useData });
      if (getInvoices) {
        await getInvoices();
      }

      if (getInvoices !== null && getInvoices !== undefined) {
        await getInvoices(true);
      }
      handleNestedClick();
      onHide();
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoicePdf = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await downloadInvoice(invoiceID);
      saveAs(
        data,
        `${invoiceData?.employee?.name}${
          invoiceData?.is_finalized ? "-Finalized" : "-Non-Finalized"
        }-Invoice-${invoiceID}.pdf`
      );
      toast.success("Invoice Downloaded successfully.");
    } catch (error) {
      toast.error(
        error.response?.statusText ||
          error?.message ||
          "Failed to Download the Invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const rejectSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await rejectInvoice(invoiceID, {
        feedback: textAreaInput,
      });
      toast.success("Invoice Rejected successfully.");
      const { data: useData } = await getUpdatedUserProfile(true);
      authUserDispatch({ type: LOGIN, payload: useData });
      if (getInvoices !== null && getInvoices !== undefined) {
        await getInvoices(true);
      }
      setShowRejectModal(false);
      onHide();
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ModalWraper
        show={show}
        onHide={onHide}
        title={
          <>
            InvoiceID: {invoiceID}
            <hr />
            Total: {charge}
          </>
        }
        footer={
          <>
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
                  loading={loading}
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
                  charge={invoiceData?.charge}
                  nestedInputModal={nestedInputModal}
                  updateSubmit={updateSubmit}
                  setNestedInputModal={setNestedInputModal}
                  loading={loading}
                  invoiceData={invoiceData}
                />
              </>
            )}
            {invoiceData?.is_finalized && (
              <Button onClick={downloadInvoicePdf}>Download</Button>
            )}
          </>
        }
      >
        <div className="max-w-4xl mx-auto bg-white md:p-4 rounded-md">
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
                    {invoiceData?.products_hash?.products.map((product, i) => (
                      <tr key={i}>
                        <td>{product[0]}</td>
                        <td>{product[1]}</td>
                        <td>{Number(product[2] || 0).toFixed(2)}</td>
                        <td>
                          {Number(product[1] * product[2] || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
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
        </div>
      </ModalWraper>
    </>
  );
}

export default CustomModal;
