import React from 'react';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { markInvoiceAsPaid } from '../Server';

const InvoiceDetails = ({ invoice, onBack }) => {
  const getStatusBadge = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (invoice.is_paid) {
      return <Badge bg="success" text="light">Paid</Badge>;
    } else if (formattedDate > invoice.date_of_service) {
      return <Badge bg="warning">Overdue</Badge>;
    }
    return <Badge bg="secondary">Due Later</Badge>;
  };

  const renderProducts = () => {
    return (
      invoice?.products_hash?.products?.length > 0 && (
        <div className="border rounded-sm p-2 mb-4 flex flex-col">
          <p>
            <b>Products</b>
          </p>
          <div className="overflow-x-auto rounded-sm p-2 mb-4">
            <table className="table-auto w-full">
              <thead className="whitespace-normal">
                <tr>
                  <th className="min-w-[6rem]">Product</th>
                  <th className="min-w-[6rem]">Quantity</th>
                  <th className="min-w-[6rem]">Price</th>
                  <th className="min-w-[6rem]">Total Price</th>
                </tr>
              </thead>
              <tbody className="whitespace-normal">
                {invoice.products_hash.products.map((product, i) => (
                  <tr key={i}>
                    <td>{product[0]}</td>
                    <td>{product[1]}</td>
                    <td>{Number(product[2] || 0).toFixed(2)}</td>
                    <td>{Number(product[1] * product[2] || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    );
  };

  const renderRetailProducts = () => {
    return (
      invoice?.products_hash?.retail_products?.length > 0 && (
        <div className="border rounded-sm p-2 mb-4 flex flex-col">
          <p>
            <b>Retail Products</b>
          </p>
          <div className="overflow-x-auto rounded-sm p-2 mb-4">
            <table className="table-auto w-full">
              <thead className="whitespace-normal">
                <tr>
                  <th className="min-w-[6rem]">Product</th>
                  <th className="min-w-[6rem]">Quantity</th>
                  <th className="min-w-[6rem]">Price</th>
                  <th className="min-w-[6rem]">Total Price</th>
                </tr>
              </thead>
              <tbody className="whitespace-normal">
                {invoice.products_hash.retail_products.map((product, i) => (
                  <tr key={i}>
                    <td>{product[0]}</td>
                    <td>{product[1]}</td>
                    <td>{Number(product[2] || 0).toFixed(2)}</td>
                    <td>{(Number(product[1]) * Number(product[2] || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    );
  };

  const handleMarkInvoiceAsPaid = async (id) => {
    try {
      const response = await markInvoiceAsPaid(id, true);
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };


  return (
    <div className="invoice-details">
      <h2 className="text-center mb-4">Bill Details</h2>

      <div className="mb-3">
        <label><strong>Provider:</strong></label>
        <Form.Control
          type="text"
          value={invoice.employee_name}
          readOnly
          className="form-control-lg"
        />
      </div>

      <div className="mb-3">
        <label><strong>Client Name:</strong></label>
        <Form.Control
          type="text"
          value={invoice.client_name}
          readOnly
          className="form-control-lg"
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <label><strong>Creation Date:</strong></label>
          <Form.Control
            type="text"
            value={invoice.created_at}
            readOnly
            className="form-control-lg"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label><strong>Due Date:</strong></label>
          <Form.Control
            type="text"
            value={invoice.date_of_service}
            readOnly
            className="form-control-lg"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <label><strong>Paid by Client Cash:</strong></label>
          <Form.Control
            type="text"
            value={`$${invoice.paid_by_client_cash}`}
            readOnly
            className="form-control-lg"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label><strong>Paid by Client Credit:</strong></label>
          <Form.Control
            type="text"
            value={invoice.paid_by_client_credit}
            readOnly
            className="form-control-lg"
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <label><strong>Amount:</strong></label>
          <Form.Control
            type="text"
            value={`$${invoice.charge}`}
            readOnly
            className="form-control-lg"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label><strong>Invoice Number:</strong></label>
          <Form.Control
            type="text"
            value={invoice.id}
            readOnly
            className="form-control-lg"
          />
        </div>
      </div>

      <p className="lead"><strong>Status:</strong> {getStatusBadge()}</p>

      <div className="products mb-4">
        {renderProducts()}
      </div>
      <div className="products mb-4">
        {renderRetailProducts()}
      </div>

      <div className="actions mt-4 text-center">
        <Button variant="success" size="lg" className="me-2" onClick={() => handleMarkInvoiceAsPaid(invoice.id)}>Mark as Paid Manually</Button>
        <Button variant="success" size="lg" className="me-2">Pay Now</Button>
        <Button variant="secondary" size="lg" onClick={onBack}>Back to Invoices</Button>
      </div>

      <style jsx>{`
        .invoice-details {
          background: #FFFF;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
          margin: auto;
        }
        .invoice-details h2 {
          font-weight: 600;
          color: #333;
        }
        .invoice-details p {
          font-size: 1.1rem;
        }
        .product-item {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        .actions {
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetails;
