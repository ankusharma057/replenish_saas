import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import { useAuthContext } from "../context/AuthUserContext";
import InvoiceDetails from './InvoiceDetails';
import Vendors from './Vendors';
import Payments from './Payments'; 
import Approvals from './Approvals';
import { Box, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { getFinalizeInvoiceList } from '../Server';
import { Pagination } from '@mui/material';

const InvoicesToPay = () => {
  const { authUserState } = useAuthContext();
  const [invoices, setInvoices] = useState();
  const { collapse } = useAsideLayoutContext();
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState("billings");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const itemsPerPage = 30;
  const navigate=useNavigate()
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const sortTable = (key) => {
    let sortedInvoices = [...invoices];
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
  
    sortedInvoices.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  
    setSortConfig({ key, direction });
    setInvoices(sortedInvoices);
  };  

  const handleSelectAll = () => {
    const updatedInvoices = invoices.map((invoice) => ({
      ...invoice,
      isChecked: !isAllChecked,
    }));
    setIsAllChecked(!isAllChecked);
    // setInvoices(updatedInvoices);
  };

  const handleCheckboxChange = (id) => {
    const updatedInvoices = invoices.map((invoice) => {
      if (invoice.id === id) {
        return { ...invoice, isChecked: !invoice.isChecked };
      }
      return invoice;
    });

    const allSelected = updatedInvoices.every((invoice) => invoice.isChecked);
    setIsAllChecked(allSelected);
    setInvoices(updatedInvoices);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
  };

  const handleInvoiceClick = (invoice) => {
    // setSelectedInvoice(invoice);
    navigate(`/billing-details/${invoice.id}`)
  };
  const getAllInvoices=async()=>{
    let response = await getFinalizeInvoiceList();
    console.log("response",response);
    setInvoices(response.data)
    
  }

  useEffect(() => {
    setCurrentTab('bills');
    getAllInvoices();
}, []);

  const getStatusBadge = (invoice) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    if (invoice.is_paid === true) {
      return <Badge bg="success" text="light">{'Paid'}</Badge>;
    } else if(formattedDate > invoice.date_of_service) {
      return <Badge bg="warning">{'Overdue'}</Badge>;
    }

    return <Badge bg="secondary">{'Due Later'}</Badge>;
  };

  return (
    <AsideLayout
      asideContent={
        <div className="bg-white p-2 min-h-[90%] flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-center text-cyan-600">Invoices To Pay</h1>
          {['Vendors', 'Bills', 'Approvals', 'Payments'].map((item, index) => (
            <div
              key={index}
              role="button"
              onClick={() => {
                setCurrentTab(item.toLowerCase());
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === item.toLowerCase() && 'bg-gray-200'
              }`}
            >
              <Box />
              {item}
            </div>
          ))}
        </div>
      }
    >
      <div className="container mt-4">
        {selectedInvoice ? (
          <InvoiceDetails 
            invoice={selectedInvoice} 
            onBack={() => setSelectedInvoice(null)}
          />
        ) : (
          <>
            {currentTab === "vendors" && <Vendors />}
            {currentTab === "bills" && (
              <>
                <div className="flex gap-x-4 w-full justify-end my-4">
                  {/* <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="info"
                    className="text-white"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="info"
                    className="text-white"
                  >
                    <ChevronRight />
                  </Button> */}
                  
                </div>
                <h2 className="text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Invoices To Pay</h2>
                <div className='d-flex justify-content-end align-items-center pb-3'><Pagination count={invoices?.total_pages} variant="outlined" shape="rounded" /></div>
                <Table responsive bordered hover className="table-sm">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={handleSelectAll}
                          aria-label="select all"
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th onClick={() => sortTable('client_name')} style={{ cursor: 'pointer' }}>
                        Vendor {getSortIcon('client_name')}
                      </th>
                      <th onClick={() => sortTable('id')} style={{ cursor: 'pointer' }}>
                        Bill {getSortIcon('id')}
                      </th>
                      <th onClick={() => sortTable('created_at')} style={{ cursor: 'pointer' }}>
                        Creation Date {getSortIcon('created_at')}
                      </th>
                      <th onClick={() => sortTable('date_of_service')} style={{ cursor: 'pointer' }}>
                        Due Date {getSortIcon('date_of_service')}
                      </th>
                      <th onClick={() => sortTable('status')} style={{ cursor: 'pointer' }}>
                        Status {getSortIcon('status')}
                      </th>
                      <th onClick={() => sortTable('charge')} style={{ cursor: 'pointer' }}>
                        Amount {getSortIcon('charge')}
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices?.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={invoice.isChecked || false}
                            onChange={() => handleCheckboxChange(invoice.id)}
                          />
                        </td>
                        <td>{invoice.client_name}</td>
                        <td>{invoice.id}</td>
                        <td>{invoice.created_at}</td>
                        <td>{invoice.date_of_service}</td>
                        <td>{getStatusBadge(invoice)}</td>
                        <td>${invoice.charge}</td>
                        <td className="text-center">
                          <a
                            href="#"
                            className="text-[#22D3EE]"
                            onClick={() => handleInvoiceClick(invoice)}
                          >
                            {invoice.is_paid === true ? 'Review' : 'Pay'}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <style jsx>{`
                  .table th, .table td {
                    padding: 8px;
                  }
                  .table th {
                    position: relative;
                  }
                  .table th:hover {
                    background-color: #e9ecef;
                  }
                `}</style>
              </>
            )}
            {currentTab === "approvals" && <Approvals />}
            {currentTab === "payments" && <Payments />}
          </>
        )}
      </div>
    </AsideLayout>
  );
};

export default InvoicesToPay;
