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
import { Box, } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { getFinalizeInvoiceList, getMentorFinalizeInvoiceList, payMultipleInvoices } from '../Server';
import { Pagination } from '@mui/material';
import moment from 'moment';
import { Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';

const InvoicesToPay = () => {
  const { authUserState } = useAuthContext();
  const [invoices, setInvoices] = useState();
  const { collapse } = useAsideLayoutContext();
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState("billings");
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [multipleInvoiceSelectionId,setMultipleInvoiceSelectionId]=useState([])
  const [multipleInvoiceSelectionData,setMultipleInvoiceSelectionData]=useState([])
  const itemsPerPage = 30;
  const navigate=useNavigate();
  const [loading, setLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false)

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

  const handleSelectAll = (event) => {
    let { checked } = event.target
    setMultipleInvoiceSelectionId(
      checked 
        ? invoices.invoices.filter((item) => !item.is_paid).map((invoice) => invoice.id) 
        : []
    );
  };

  const handleCheckboxChange = (id,checked) => {
    if (checked) {
      setMultipleInvoiceSelectionId((prev) => [...prev, id]);
    } else {
      setMultipleInvoiceSelectionId((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '';
  };

  const handleInvoiceClick = (invoice) => {
    navigate(`/billing-details/${invoice.id}`)
  };
  const getAllInvoices=async(page=1)=>{
    setScreenLoading(true);
    let response;
    if(authUserState.user.is_admin){
      response = await getFinalizeInvoiceList({page:page},true);
      setInvoices(response.data);
      setScreenLoading(false);
    }else if(authUserState.user.is_mentor){
      let payload={
        employee_id:authUserState.user.id,
        page:page
      }
      response = await getMentorFinalizeInvoiceList(payload);
      setInvoices(response.data)
    setScreenLoading(false);
    }else{
      response = authUserState.user.invoices.filter((invoice)=>invoice.is_finalized)
      setInvoices(response)
      setScreenLoading(false);
    }
  }
  let location = useLocation();
  
  useEffect(() => {
    setCurrentTab('bills');
    getAllInvoices();
}, [location]);

  const getStatusBadge = (invoice) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    if(invoice.payment_status ===  "initiated"){
      return <Badge bg="warning">{'Initiated'}</Badge>;
    }else if(invoice.payment_status ===  "pending"){
      return <Badge bg="warning">{'Pending'}</Badge>;
    }else if(invoice.payment_status ===  "completed"){
      return <Badge bg="success">{'Paid'}</Badge>;
    } else if(formattedDate > invoice.date_of_service) {
      return <Badge bg="warning">{'Overdue'}</Badge>;
    }if (invoice.is_paid === true) {
      return <Badge bg="success" text="light">{'Paid'}</Badge>;
    }

    return <Badge bg="secondary">{'Due Later'}</Badge>;
  };

  const checkAllIDAvailable=()=>{
    return invoices?.invoice?.filter((item) => !item.is_paid).every((item) => multipleInvoiceSelectionId.includes(item.id));
  };
  const handleCloseModal=()=>{
    if(isAllChecked===false){
      const matchedData = invoices.invoices.filter(item => multipleInvoiceSelectionId.includes(item.id));
      setMultipleInvoiceSelectionData(matchedData)
      setIsAllChecked(true);
      setLoading(false);

    }else{
      setIsAllChecked(false);
      setLoading(false);
    }
  };
  const handleMultipleInvoicePay = async () => {
    setScreenLoading(true);
    setLoading(true)
    let payload = multipleInvoiceSelectionData.filter(item => multipleInvoiceSelectionId.includes(item.id)).map(item => ({ invoice_id: item.id }));
    try {
      let response = await payMultipleInvoices(payload);
      if (response.data.success.length>0) {
        response.data.success.map((success) => toast.success(success.message));
        setScreenLoading(false);
        setLoading(false);
        handleCloseModal();
        getAllInvoices();
      } else if (response.data.errors.length>0) {
        response.data.errors.map((error) => toast.error(error.error));
        setScreenLoading(false);
        setLoading(false);
        handleCloseModal();
        getAllInvoices();
      }
      if(response.status === 200){
        setMultipleInvoiceSelectionId([])
        setMultipleInvoiceSelectionData([]);
        getAllInvoices();
      }
    } catch (error) {
    }
  };
  const handlePageChange = async(event, value) => {
    await getAllInvoices(value);
  };
  const ScreenLoading = () => {
    return <div style={{ width: "81%", height: "87vh", position: "absolute", zIndex: 9, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
        <Spinner animation="border" variant="info" />
    </div>
}
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
      {screenLoading && <ScreenLoading />}
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
                <h2 className="text-center mb-2" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Invoices To Pay</h2>
                <div className='d-flex justify-content-end align-items-end gap-[20px] pb-3 flex-column'>
                  <Pagination count={invoices?.total_pages} variant="outlined" shape="rounded" onChange={handlePageChange}/>
                  {multipleInvoiceSelectionId.length>0 && <Button onClick={handleCloseModal}style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }}>Pay Multiple Invoices</Button>}
                </div>
                <Table responsive bordered hover className="table-sm">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={checkAllIDAvailable()}
                          onChange={handleSelectAll}
                          aria-label="select all"
                          style={{ cursor: 'pointer' }}
                        />
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Client
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Invoice ID
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Creation Date
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Due Date
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Status
                      </th>
                      <th style={{ cursor: 'pointer' }}>
                        Amount
                      </th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(invoices?.invoices)&&invoices?.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="text-center">
                          <Form.Check
                            type="checkbox"
                            checked={invoice?.isChecked || multipleInvoiceSelectionId.includes(invoice.id)}
                            disabled={invoice.is_paid || invoice.payment_status==="initiated"}
                            onChange={(e) => handleCheckboxChange(invoice.id, e.target.checked)}
                          />
                        </td>
                        <td>{invoice.client_name}</td>
                        <td>{invoice.id}</td>
                        <td>{moment(invoice?.created_at).format('MM-DD-YYYY')}</td>
                        <td>{moment(invoice?.date_of_service).format('MM-DD-YYYY')}</td>
                        <td>{getStatusBadge(invoice)}</td>
                        <td>${invoice.charge}</td>
                        <td className="text-center">
                          <p className="text-[#22D3EE] cursor-pointer" onClick={() => handleInvoiceClick(invoice)}>
                            {(invoice.payment_status==="completed" && invoice.is_paid === true) && 'Review'}
                            {((invoice.payment_status===null||invoice.payment_status==="pending") && invoice.is_paid === false && authUserState.user.is_admin ) && 'Pay'}
                            {(invoice.payment_status==="initiated") && 'Details'}
                          </p>
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
      <Modal show={isAllChecked} onHide={handleCloseModal} size='xl' centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay for multiple invoices</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ height: "max-content", maxHeight: "55vh", overflow: "scroll" }}>
            <Table striped bordered>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Charge</th>
                  <th>Payment Frequency</th>
                  <th>Invoice Date</th>
                </tr>
              </thead>
              <tbody>
                {multipleInvoiceSelectionData.filter((inv) => !inv.is_paid).map((invoice, index) => {
                  return <tr key={index}>
                    <td>{invoice?.id}</td>
                    <td>{invoice?.charge}</td>
                    <td>{invoice?.instant_pay === true ? "Pay Faster" : "Default"}</td>
                    <td>{moment(invoice?.created_at).format("MM-DD-YYYY")}</td>
                  </tr>
                })}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal} disabled={screenLoading}>Close</Button>
          <Button variant="dark" disabled={loading} style={{ backgroundColor: "#22D3EE", border: "1px solid #22D3EE" }} onClick={handleMultipleInvoicePay}>
            Pay {loading && <Spinner animation="border" variant="white" style={{ width: "15px", height: "15px" }} />}
          </Button>
        </Modal.Footer>
      </Modal>
    </AsideLayout>
  );
};

export default InvoicesToPay;
