import React, { memo } from "react";
import { Button, Card } from "react-bootstrap";

const InvoiceCard = ({ invoice, seeMore, finalizeInvoiceSubmit }) => {
  return (
    <Card className="text-center" border="info" style={{ width: "18rem" }}>
      <Card.Header as="h5">Invoice Id {invoice.id}</Card.Header>
      <Card.Body className="">
        <Card.Title className="mb-3">
          Employee: {invoice.employee?.name}
        </Card.Title>
        <Button
          onClick={() => seeMore(invoice)}
          className="mb-3 text-white"
          variant="info"
        >
          See More Details
        </Button>
        <br />

        <Button
          style={{ display: invoice.is_finalized ? "none" : "inline" }}
          onClick={() => finalizeInvoiceSubmit(invoice)}
          variant="info"
          className="text-white"
        >
          Finalize Invoice
        </Button>
      </Card.Body>
    </Card>
  );
};

export default memo(InvoiceCard);
