import React from "react";
import { Card } from "react-bootstrap";

const FinalizeInvoicesCard = ({
  employeeName,
  clientName,
  invoiceId,
  invoice,
  multipleInvoiceData,
  addMultipleFinalize,
}) => {
  return (
    <Card
      className={`text-center w-72 cursor-pointer max-w-[10rem]`}
      style={{
        background: multipleInvoiceData[invoiceId] ? "#529aff" : "white",
      }}
      title={
        multipleInvoiceData[invoiceId]
          ? "Click to un Finalize this invoice"
          : "Click to Finalize this invoice"
      }
      border="info"
      onClick={() => addMultipleFinalize(invoiceId, invoice)}
    >
      <Card.Header
        as="h5"
        style={{
          color: multipleInvoiceData[invoiceId] ? "white" : "black",
        }}
      >
        {employeeName}
      </Card.Header>
      <Card.Body
        className={` ${
          multipleInvoiceData[invoiceId] ? "text-white" : "text-black"
        }  mb-3`}
      >
        <Card.Title className={` mb-3`}>Invoice Id: {invoiceId}</Card.Title>
        <Card.Title className={` mb-3`}>Client: {clientName}</Card.Title>
        <Card.Title className="mb-3 ">
          <span className="block text-sm ">Date of Service:</span>
          <span className="text-sm">
            {invoice.date_of_service || "Not Given"}
          </span>
        </Card.Title>
      </Card.Body>
    </Card>
  );
};

export default FinalizeInvoicesCard;
