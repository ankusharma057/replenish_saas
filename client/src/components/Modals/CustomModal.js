import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { LOGIN } from "../../Constants/AuthConstants";
import {
  downloadInvoice,
  getUpdatedUserProfile,
  rejectInvoice,
  updateImages,
  updateInvoice,
} from "../../Server";
import { useAuthContext } from "../../context/AuthUserContext";
import BeforeAfterMediaModal from "./BeforeAfterMediaModal";
import ModalWraper from "./ModalWraper";
import RejectInvoiceModal from "./RejectInvoiceModal";
import UpdateInvoiceModal from "./UpdateInvoiceModal";
import { removeDuplicateElements } from "../../helper";
import { useLocation } from "react-router-dom";

function CustomModal({
  invoiceData,
  show,
  onHide,
  fiInvoiceList,
  userProfile,
  getInvoices,
  finalizeInvoiceSubmit
}) {

  const invoiceID = invoiceData.id;
  const employeeName = invoiceData.employee_name;
  const clientName = invoiceData?.client?.name + " " + invoiceData?.client?.last_name;
  const charge = invoiceData.charge;
  const dateOfService = invoiceData.date_of_service;
  const conciergeFeePaid = invoiceData.conciergeFeePaid;
  const providerPurchased = invoiceData.provider_purchased;
  const gfe = invoiceData.gfe;
  const paymentType = invoiceData.payment_type;
  const paidByClientCash = invoiceData.paid_by_client_cash;
  const paidByClientCredit = invoiceData.paid_by_client_credit;
  const personalDiscount = invoiceData.personal_discount;
  const tip = invoiceData.tip;
  const paidByClientProducts = invoiceData.amt_paid_for_products;
  const paidByClientRetailProducts = invoiceData.amt_paid_for_retail_products;
  const paidByClientWellnessProducts = invoiceData.amt_paid_for_wellness_products;
  const comments = invoiceData.comments;
  const overheadFeeType = invoiceData.overhead_fee_type;
  const overheadFeeValue = invoiceData.overhead_fee_value;
  const locationName = invoiceData?.location?.name
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [nestedInputModal, setNestedInputModal] = useState({
    overhead_fee_type: "",
    overhead_fee_value: "",
    charge: 0,
  });

  const { authUserDispatch,authUserState } = useAuthContext();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [textAreaInput, settextAreaInput] = useState("");
  const [editImages, setEditImages] = useState(true);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [blobsForBefore, setBlobForBefore] = useState([]);
  const [blobsForAfter, setBlobForAfter] = useState([]);
  const [deletedBeforeImages, setDeletedBeforeImages] = useState([]);
  const [deletedAfterImages, setDeletedAfterImages] = useState([]);
  // useEffect for initial assignment of before and after images
  useEffect(() => {
    if (invoiceData?.before_images) {
      setBeforeImages([...invoiceData?.before_images]);
    }
    if (invoiceData?.after_images) {
      setAfterImages([...invoiceData?.after_images]);
    }
  }, [invoiceData]);

  const handleUpdateImage = async () => {
    const {
      updatedArray1: updatedDeletedBeforeImages,
      updatedArray2: updatedBlobsForBefore,
    } = removeDuplicateElements(deletedBeforeImages, blobsForBefore);
    const {
      updatedArray1: updatedDeletedAfterImages,
      updatedArray2: updatedBlobsForAfter,
    } = removeDuplicateElements(deletedAfterImages, blobsForAfter);
    const updatedData = {
      blobsForBefore: updatedBlobsForBefore,
      blobsForAfter: updatedBlobsForAfter,
      deletedBeforeImages: updatedDeletedBeforeImages,
      deletedAfterImages: updatedDeletedAfterImages,
    };
    try {
      await updateImages(invoiceID, updatedData);
      toast.success("Images Updated successfully.");
      setDeletedAfterImages([]);
      setDeletedBeforeImages([]);
      setBlobForAfter([]);
      setBlobForBefore([]);
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
        error?.response?.statusText ||
        error.message
      );
    } finally {
      setShowImageEditModal(false);
    }
  };

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
        error?.response?.statusText ||
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
        `${invoiceData?.employee?.name}${invoiceData?.is_finalized ? "-Finalized" : "-Non-Finalized"
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
        error?.response?.statusText ||
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  function getPaymentLabel(paymentType) {
    switch (paymentType) {
      case "credit_card":
        return "Credit/Debit Card";
      case "cherry":
        return "Cherry Payments/Affirm";
      case "other":
        return "Others";
      default:
        return "Unknown";
    }
  }

  const handleCollapse = () => {
    const elements = document.querySelectorAll(`.image_collapse`);
    elements.forEach((element) => {
      element.classList.toggle("collapse");
    });
    // setEditImages(!editImages);
  };

  const handleEditImages = () => {
    setShowImageEditModal(!showImageEditModal);
  };

  const renderImages = (type, imageArray) => {
    const baseURL = window.location.origin;
    return (
      <div className="border rounded-sm p-2 mb-4 flex align-items-center flex-column w-100">
        <div className="flex flex-row justify-content-between w-100">
          <div>
            <h3>{type}</h3>
          </div>
        </div>
        <div
          className="flex flex-row collapse multi-collapse image_collapse"
          id={`image_collapse`}
        >
          {imageArray.map((image, index) => {
            return (
              <div
                key={`${type}-${index}`}
                className="m-2 flex flex-column align-items-center"
              >
                {image && typeof image === "object" ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded ${type} image ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                    }}
                  />
                ) : (
                  <img
                    className="img-thumbnail"
                    src={`${baseURL}${image}`}
                    style={{
                      width: "100px",
                      height: "100px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <ModalWraper
        show={show}
        onHide={onHide}
        title={
          <>
            <div className="flex justify-between gap-4 w-full min-[992px]:min-w-[722px]">
              <div>
                Invoice ID: {invoiceID}
              </div>
              {invoiceData.source_invoice_id &&
                <div>
                  Source Invoice ID: {invoiceData.source_invoice_id}
                </div>
              }
              {invoiceData.is_finalized && location.pathname?.includes("/myprofile") &&
                <div>
                  Finalized Invoice
                </div>
              }
            </div>
            {/* { !invoiceData?.employee?.is_mentor && ( */}
            <>
              <hr />

              <div>
                Total: {charge}
              </div>
            </>
            {/* // )} */}
          </>
        }
        size={"lg"}
        footer={
          <>
            
            {fiInvoiceList === false && (
              <>
                <Button
                  className="!bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
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
                {userProfile?.is_admin === true && fiInvoiceList === false && (
              <>
                <Button
                 className="!bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                  onClick={() => {
                   finalizeInvoiceSubmit(invoiceData)
                  }}
                >
                  Finalize
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
              </>
            )}
            {invoiceData?.is_finalized && (
              <Button onClick={downloadInvoicePdf}>Download</Button>
            )}
          </>
        }
      >
        <div className="max-w-4xl mx-auto bg-white md:p-4 rounded-md">
          {!invoiceData?.employee?.is_mentor && (
            <>
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

                <div className="flex flex-col">
                  <span className="text-gray-700">Location:</span>
                  <span>{locationName}</span>
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
                          {authUserState.user.is_admin || authUserState.user.is_inv_manager && <th className="min-w-[6rem]">Total Price</th>} 
                          
                        </tr>
                      </thead>
                      <tbody className="whitespace-normal">
                        {invoiceData?.products_hash?.products.map((product, i) => (
                          <tr key={i}>
                            <td>{product[0]}</td>
                            <td>{product[1]}</td>
                            <td>{Number(product[2] || 0).toFixed(2)}</td>
                              {authUserState.user.is_admin || authUserState.user.is_inv_manager && <td>{Number(product[1] * product[2] || 0).toFixed(2)}</td>} 
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pr-4">
                    <p className="text-lg font-semibold text-cyan-500">
                      Total Client Paid: $
                      {Number(paidByClientProducts || 0).toFixed(2)}
                    </p>
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
                          {authUserState.user.is_admin || authUserState.user.is_inv_manager &&<th className="min-w-[6rem]">Total Price</th>}
                        </tr>
                      </thead>
                      <tbody className="whitespace-normal">
                        {invoiceData?.products_hash?.retail_products.map(
                          (product, i) => (
                            <tr key={i}>
                              <td>{product[0]}</td>
                              <td>{product[1]}</td>
                              <td>{product[2]}</td>
                              {authUserState.user.is_admin || authUserState.user.is_inv_manager && <td>{+(product[1] * product[2])}</td>}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pr-4">
                    <p className="text-lg font-semibold text-cyan-500">
                      Total Client Paid: $
                      {Number(paidByClientRetailProducts || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {invoiceData?.products_hash?.wellness_products?.length > 0 && (
                <div className=" border rounded-sm p-2 mb-4 flex flex-col ">
                  <p>
                    <b>Wellness Products</b>
                  </p>

                  <div className="overflow-x-auto rounded-sm p-2 mb-4 ">
                    <table className="table-auto  w-full ">
                      <thead className="whitespace-normal">
                        <tr>
                          <th className="min-w-[6rem]">Product</th>
                          <th className="min-w-[6rem]">Quantity</th>
                          <th className="min-w-[6rem]">Price</th>
                          {authUserState.user.is_admin || authUserState.user.is_inv_manager &&<th className="min-w-[6rem]">Total Price</th>}
                        </tr>
                      </thead>
                      <tbody className="whitespace-normal">
                        {invoiceData?.products_hash?.wellness_products.map(
                          (product, i) => (
                            <tr key={i}>
                              <td>{product[0]}</td>
                              <td>{product[1]}</td>
                              <td>{product[2]}</td>
                              {authUserState.user.is_admin || authUserState.user.is_inv_manager && <td>{+(product[1] * product[2])}</td>}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pr-4">
                    <p className="text-lg font-semibold text-cyan-500">
                      Total Client Paid: $
                      {Number(paidByClientWellnessProducts || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="border rounded-lg p-4 mb-4 bg-white shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Provider Purchased</span>
                <span className={`font-semibold ${providerPurchased ? "text-green-600" : "text-red-500"}`}>
                  {providerPurchased ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Personal Discount:</span>
                <span className={`font-semibold ${personalDiscount != 0 ? "text-green-600" : "text-red-500"}`}>
                  {personalDiscount}
                </span>
              </div>

              <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Pay Faster</span>
                <span className={`font-semibold ${invoiceData?.instant_pay ? "text-green-600" : "text-red-500"}`}>
                  {invoiceData?.instant_pay ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Payment Method</span>
                <span className="text-lg font-semibold text-cyan-500">
                  {getPaymentLabel(paymentType)}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
              <span className="text-gray-600 font-medium">Comments:</span>
              <p className="font-semibold text-gray-700">{comments || "No comments available"}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t pt-6">
              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Total Owed to Provider</span>
                <span className="text-lg font-semibold text-red-500">${charge}</span>
              </div>

              <div className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                <span className="text-gray-600 font-medium">Total Client Paid</span>
                <span className="text-lg font-semibold text-green-500">
                  ${Number(paidByClientProducts + paidByClientRetailProducts + paidByClientWellnessProducts || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          {/* <div className="border rounded-sm p-2 mb-4 flex align-items-center flex-column">
            <div className="flex flex-row justify-content-between w-100 m-2">
              <div>
                <h3>Attached Media</h3>
              </div>
              <div className="flex flex-row justify-content-between">
                <Button
                  className="mx-1 !bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                  onClick={() => handleCollapse()}
                  variant="primary"
                >
                  Show Media
                </Button>
                <Button
                  disabled={!editImages}
                  className="mx-1 !bg-cyan-400 !border-cyan-500 hover:!bg-cyan-500 focus:!bg-cyan-500"
                  onClick={() => handleEditImages()}
                  variant="primary"
                >
                  Edit Media
                </Button>
              </div>
            </div>
            {beforeImages?.length > 0 &&
              renderImages("Before Images", beforeImages)}
            {afterImages?.length > 0 &&
              renderImages("After Images", afterImages)}
          </div> */}
        </div>
      </ModalWraper>
      <div className="flex gap-4 mt-2 md:mt-0">
        <BeforeAfterMediaModal
          isEditModal={true}
          showModal={showImageEditModal}
          setShowModal={setShowImageEditModal}
          beforeImages={beforeImages}
          setBeforeImages={setBeforeImages}
          afterImages={afterImages}
          setAfterImages={setAfterImages}
          setBlobForAfter={setBlobForAfter}
          setBlobForBefore={setBlobForBefore}
          setDeletedBeforeImages={setDeletedBeforeImages}
          setDeletedAfterImages={setDeletedAfterImages}
          handleSave={handleUpdateImage}
          showButton={false}
        />
      </div>
    </>
  );
}

export default CustomModal;
