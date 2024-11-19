import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';

const MentorshipInvoiceModal = ({ invoice, showModal, handleCloseModal }) => {
  return (
    <div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        size='lg'
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <Modal.Header closeButton className="bg-cyan-500 text-white">
          <Modal.Title className="text-lg font-bold">Invoice Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-gray-50 px-6 py-8">
          <p className="font-semibold text-xl text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-cyan-500">Mentor Name:</span>
            <span className="font-medium text-gray-700">{invoice?.mentor ? invoice?.mentor?.name : 'N/A'}</span>
          </p>


          <div className="border rounded-md p-4 mb-6 shadow-sm bg-white flex justify-between md:space-x-4">
            <div className="flex flex-col mb-4 md:mb-0">
              <span className="text-gray-700 font-medium">Provider:</span>
              <span>{invoice?.employee?.name || 'N/A'}</span>
            </div>
            <div className="flex flex-col mb-4 md:mb-0">
              <span className="text-gray-700 font-medium">Client Name:</span>
              <span>{invoice?.client?.name || 'N/A'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-700 font-medium">Date of Service:</span>
              <span>{invoice?.date_of_service || 'N/A'}</span>
            </div>
          </div>

          {invoice?.products_hash?.mp_products?.length > 0 && (
            <div className="border rounded-md p-4 mb-6 bg-white shadow-sm">
              <p className="font-bold text-gray-800 text-lg mb-4">Products</p>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    {invoice.products_hash.mp_products.map((product, i) => (
                      <tr key={i} className="border-b">
                        <td className="px-4 py-2">{product[0]}</td>
                        <td className="px-4 py-2">{product[1]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex flex-col border rounded-md p-6 mb-6 bg-white shadow-sm gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Did the mentor provide value?</span>
                <span className="text-cyan-500 font-semibold">{invoice?.mentor_value_provided ? "Yes" : "No"}</span>
                {invoice?.mentor_value_provided === false && (
                  <span className="text-gray-700 font-medium">Reason: {invoice?.mentor_value_provided_reason}</span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Do you feel comfortable with the modality?</span>
                <span className="text-cyan-500 font-semibold">{invoice?.comfort_with_modality ? "Yes" : "No"}</span>
                {!invoice?.comfort_with_modality_reason === false && (
                  <span className="text-gray-700 font-medium">Reason: {invoice?.comfort_with_modality_reason}</span>
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Did your mentor provide value?</span>
                <span className="text-cyan-500 font-semibold">{invoice?.service_experience ? "Yes" : "No"}</span>
                {!invoice?.service_experience_reason === false && (
                  <span className="text-gray-700 font-medium">Reason: {invoice?.service_experience_reason}</span>
                )}
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Concierge Fee Paid:</span>
                <span className="text-cyan-500 font-semibold">{invoice?.conciergeFeePaid ? "Yes" : "No"}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">GFE:</span>
                <span className="text-cyan-500 font-semibold">{invoice?.gfe ? "Yes" : "No"}</span>
              </div>
            </div>
            <hr />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Paid By Client Cash:</span>
                <span className="text-green-600 font-semibold">${invoice?.paid_by_client_cash}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium">Paid By Client Credit:</span>
                <span className="text-green-600 font-semibold">${((invoice?.paid_by_client_credit || 0) * (1 + 0.03))}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-gray-700 font-medium text-lg">Total Paid by Client:</span>
                <span className="text-green-700 text-xl font-semibold">
                  ${Number((invoice?.paid_by_client_cash || 0) + ((invoice?.paid_by_client_credit || 0) * (1 + 0.03))).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </Modal.Body>
        <Modal.Footer className="bg-gray-50">
          <Button onClick={handleCloseModal} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-cyan-500 rounded-md hover:bg-cyan-500">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default MentorshipInvoiceModal
