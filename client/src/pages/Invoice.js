import React, { useEffect, useState } from "react";
import {
  getInvoiceList,
  invoiceFinalize,
  multipleInvoiceFinalize,
} from "../Server";
import InvoiceCard from "../components/Cards/InvoiceCard";
import DataFilterService from "../services/DataFilterService";
import { Button, ButtonGroup, ToggleButton } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import CustomModal from "../components/Modals/CustomModal";
import { useAuthContext } from "../context/AuthUserContext";
import ModalWraper from "../components/Modals/ModalWraper";
import FinalizeInvoicesCard from "../components/Cards/FinalizeInvoicesCard";
import Loadingbutton from "../components/Buttons/Loadingbutton";

const Invoice = () => {
  const [radioValue, setRadioValue] = useState("1");
  const [invoiceList, setInvoiceList] = useState({
    finalized: [],
    "non-finalized": [],
  });
  const [loading, setLoading] = useState(false);
  const { authUserState } = useAuthContext();
  const [setselectList, setSetselectList] = useState("non-finalized");
  const [modalShow, setModalShow] = useState(false);
  const [singleInvoice, setSingleInvoice] = useState({});
  const [showMultipleFinaliseModal, setShowMultipleFinaliseModal] =
    useState(false);
  const [multipleInvoiceData, setMultipleInvoiceData] = useState({});

  const getInvoices = async (refetch = false) => {
    const { data } = await getInvoiceList(refetch);
    setInvoiceList(DataFilterService.invoiceGroupByFinalized(data));
  };

  useEffect(() => {
    getInvoices();
    return () => {};
  }, []);

  const finalizeInvoiceSubmit = (invoice) => {
    confirmAlert({
      title: "Confirm to finalize",
      message:
        "Are you sure you want to finalize, this will send this invoice as a mail to the provider",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await invoiceFinalize(invoice.id, invoice);
              toast.success(
                "Invoice finalized successfully and the mail has been sent on the email id"
              );
              await getInvoices(true);
            } catch (error) {
              console.log(error);
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Finalize Invoices."
              );

              if (error.response.status === 422) {
                toast.warning(
                  "Finalize Other Invoices:" +
                    invoice?.fellow_non_finalized_invoices +
                    " to get the mail please."
                );
              }
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  const radios = [
    { name: "Non Finalized Invoices", value: "1" },
    { name: "Finalized Invoices", value: "2" },
  ];

  const seeMore = (invoice) => {
    setSingleInvoice(invoice);
    setModalShow(true);
  };

  const addMultipleFinalize = (invoiceId, invoice) => {
    setMultipleInvoiceData((prevData) => {
      if (prevData[invoiceId]) {
        // If the invoice is already selected, remove it
        const newData = { ...prevData };
        delete newData[invoiceId];
        return newData;
      } else {
        // If the invoice is not selected, add it
        return { ...prevData, [invoiceId]: invoice };
      }
    });
  };

  const finalizeMultipeInvoiceSubmit = () => {
    setShowMultipleFinaliseModal(false);
    setLoading(false);
    confirmAlert({
      title: "Confirm to finalize",
      message: `  Are you sure you want to finalize ${
        Object.keys(multipleInvoiceData).length
      } invoice(s), this will send this invoice as a mail to the provider(s).`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setShowMultipleFinaliseModal(true);
            try {
              await multipleInvoiceFinalize(Object.values(multipleInvoiceData));
              toast.success(
                "Invoices finalized successfully and the mail has been sent on the email id"
              );
              await getInvoices(true);
              setMultipleInvoiceData({});
            } catch (error) {
              console.log(error);
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to Finalize Invoices."
              );
              if (error.response.status === 422) {
                toast.warning(
                  "Finalize Other Invoices, to get the mail please."
                );
              }
            } finally {
              setShowMultipleFinaliseModal(false);
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  return (
    <>
      <br />
      <div className="flex  flex-col lg:flex-row items-center relative">
        <div className="w-full flex justify-center">
          <ButtonGroup className="mb-2 gap-2 border w-full md:w-auto border-gray-200 p-3 ">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                className={`custom-toggle-btn ${
                  radioValue === radio.value ? "btn-blue" : "btn-white"
                } toggle-button `}
                name="radio"
                style={{
                  borderTopLeftRadius:
                    idx === 0 && radioValue === radio.value ? "0" : "1rem",
                  borderBottomLeftRadius:
                    idx === 0 && radioValue === radio.value ? "0" : "1rem",
                  borderTopRightRadius:
                    idx === radios.length - 1 && radioValue === radio.value
                      ? "0"
                      : "1rem",
                  borderBottomRightRadius:
                    idx === radios.length - 1 && radioValue === radio.value
                      ? "0"
                      : "1rem",
                }}
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => {
                  setSetselectList(
                    String(e.currentTarget.value) === "1"
                      ? "non-finalized"
                      : "finalized"
                  );
                  setRadioValue(e.currentTarget.value);
                }}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </div>
        <div className="static lg:absolute right-4 ">
          <Button
            type="button"
            style={{ background: "#0A59CA" }}
            onClick={() => setShowMultipleFinaliseModal(true)}
            className=" whitespace-nowrap px-4"
          >
            Finalize Multiple
          </Button>
        </div>
      </div>
      <hr />
      <ModalWraper
        show={showMultipleFinaliseModal}
        onHide={() => setShowMultipleFinaliseModal(false)}
        footer={
          <>
            {Object.keys(multipleInvoiceData).length > 0 && (
              <Loadingbutton
                title={`Finalize`}
                isLoading={loading}
                loadingText={`Finalizing ${
                  Object.keys(multipleInvoiceData).length
                } invoices...`}
                onClick={finalizeMultipeInvoiceSubmit}
              />
            )}
          </>
        }
      >
        <div className="justify-center flex flex-wrap gap-3 max-h-[35rem] overflow-y-auto">
          {invoiceList[setselectList]?.map((invoice) => {
            console.log(invoice);
            return (
              <FinalizeInvoicesCard
                key={invoice.id}
                clientName={invoice.client?.name}
                invoiceId={invoice.id}
                invoice={invoice}
                finalizeInvoiceSubmit={finalizeInvoiceSubmit}
                addMultipleFinalize={addMultipleFinalize}
                multipleInvoiceData={multipleInvoiceData}
              />
            );
          })}
        </div>
      </ModalWraper>
      <div className="p-4">
        <CustomModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          userProfile={authUserState.user}
          invoiceData={singleInvoice}
          fiInvoiceList={singleInvoice.is_finalized}
        />
        <div className="justify-center flex flex-wrap gap-3">
          {invoiceList[setselectList]?.map((invoice) => {
            return (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                finalizeInvoiceSubmit={finalizeInvoiceSubmit}
                seeMore={seeMore}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Invoice;
