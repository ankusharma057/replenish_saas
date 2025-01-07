
import React, { useState } from "react";
import { Table } from "react-bootstrap";

const FinalizeInvoicesTable = ({
  employeeName,
  clientName,
  invoiceId,
  invoice,
  multipleInvoiceData,
  addMultipleFinalize,
}) => {
  // State to track selected invoices
  const [selectedInvoices, setSelectedInvoices] = useState([]);

  // Handle selection/deselection of a checkbox
  const handleCheckboxChange = (invoiceId) => {
    setSelectedInvoices((prevSelected) => {
      if (prevSelected.includes(invoiceId)) {
        return prevSelected.filter((id) => id !== invoiceId); // Remove from selected if already selected
      } else {
        return [...prevSelected, invoiceId]; // Add to selected if not already selected
      }
    });
  };

  return (
    <Table bordered hover responsive className="text-center" style={{ marginBottom: "0", width: "100%" }}>
      <tbody>
        {/* Check if invoice exists and render it */}
        {invoice ? (
          <tr
            key={invoiceId}
            style={{
              background: invoice.isFinalized ? "#529aff" : "white", // Conditional background based on finalization status
              color: invoice.isFinalized ? "white" : "black", // Conditional text color based on finalization status
            }}
            title={
              invoice.isFinalized
                ? "Click to un-finalize this invoice"
                : "Click to finalize this invoice"
            }
            onClick={() => addMultipleFinalize(invoiceId, invoice)} // Trigger finalize or un-finalize
          >
            <td style={{ verticalAlign: 'middle' }}>
              <input
                type="checkbox"
                checked={selectedInvoices.includes(invoiceId)} // Check if this invoice is selected
                onChange={() => handleCheckboxChange(invoiceId)} // Toggle selection
              />
            </td>
            <td style={{ verticalAlign: 'middle' }}>{employeeName}</td>
            <td style={{ verticalAlign: 'middle' }}>{invoiceId}</td>
            <td style={{ verticalAlign: 'middle' }}>{clientName}</td>
            <td style={{ verticalAlign: 'middle' }}>{invoice.date_of_service || "Not Given"}</td>
          </tr>
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center' }}>No invoice data available</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default FinalizeInvoicesTable;
