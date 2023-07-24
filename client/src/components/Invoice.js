import React, { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import CustomModal from "./CustomModal";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css

export default function Invoice({ invoice, fiInvoiceList, userProfile }) {
  const [modalShow, setModalShow] = useState(false);

  function handleClick() {
    setModalShow(!modalShow);
  }

  const finalizeInvoice = () => {
    confirmAlert({
      title: "Confirm to finalize",
      message:
        "Are you sure you want to finalize, this will send this invoice as a mail to the client",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            fetch("/api/invoices/" + invoice.id + "/finalize", {
              method: "POST",
            })
              .then((res) => {
                if (res.ok) {
                  toast.success(
                    "Invoice finalized successfully and the mail has been sent on the email id"
                  );
                  window.location.reload();
                } else if (res.status === 422){
                  toast.success(
                    "Finalize Other Invoices:"+ invoice?.fellow_non_finalized_invoices + " to get the mail please."
                  );
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                } else {
                  res.json().then((json) => {
                    toast.error("Failed to finalize the Invoice");
                  });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("An error occured.");
              }),
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  
  const tailwindInvoiceCard = (
    <Card className="text-center" border="info" style={{ width: "18rem" }}>
      <Card.Header as="h5">Invoice Id {invoice.id}</Card.Header>
      <Card.Body className="">
        <Card.Title className="mb-3">
          Employee: {invoice.employee?.name}
        </Card.Title>
        <Button onClick={handleClick} className="mb-3" variant="info">
          See More Details
        </Button>
        <br />

        <Button
          style={{ display: invoice.is_finalized ? "none" : "inline" }}
          onClick={finalizeInvoice}
          variant="info"
        >
          Finalize Invoice
        </Button>
      </Card.Body>
    </Card>
  );
  return (
    <>
      <div className="p-4">
        {tailwindInvoiceCard}
        <CustomModal
          show={modalShow}
          onHide={handleClick}
          userProfile={userProfile}
          invoiceData={invoice}
          fiInvoiceList={fiInvoiceList}
        />
      </div>
    </>
  );
}
