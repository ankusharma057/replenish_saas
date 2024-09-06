import React, { memo } from "react";
import { Button, Card } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { deleteInvoice } from "../../Server";

const InvoiceCard = ({ invoice, seeMore, finalizeInvoiceSubmit, getInvoices }) => {
  return (
    <Card className="text-center" border="info" style={{ width: "18rem" }}>
      <Card.Header as="h5">{invoice.source_invoice_id ? "Mentor " : ""}Invoice Id {invoice.id}</Card.Header>
      <Card.Body className="">
        <Card.Title className="mb-3">
          {invoice.source_invoice_id ? "Mentor:" : "Employee:"} {invoice.employee?.name}
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
        <Button
          style={{ display: invoice.is_finalized ? "inline" : "none" }}
          onClick={async () => {
            confirmAlert({
              title: "Confirm to delete",
              message: "Are you sure you want to delete this invoice?",
              buttons: [
                {
                  label: "Yes",
                  onClick: async () => {
                    try {
                      const {data} = await deleteInvoice(invoice?.id)
                      if(data){
                        toast.success(`Invoice Deleted Successfully.`);
                        getInvoices(true);
                      }else{
                        toast.error("Something went wrong")
                      }
                    } catch (error) {
                      toast.error("Something went wrong")
                    }
                  },
                },
                {
                  label: "No",
                  onClick: () => console.log("Click No"),
                },
              ],
            });
          }}
          variant="danger"
          className="text-white"
        >
        Delete
        </Button>
      </Card.Body>
    </Card>
  );
};

export default memo(InvoiceCard);
