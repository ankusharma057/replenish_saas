import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getEmployeeMentorshipInvoicesOnly } from "../Server";
import MentorshipInvoiceModal from './MentorshipInvoiceModal';
import { toast } from 'react-toastify';

const Mentorship = ({employee}) => {
  const [invoices, setInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchMentorshipInvoices = async () => {
      try {
        const result = await getEmployeeMentorshipInvoicesOnly(employee, true);
        setInvoices(result);
      } catch (error) {
        toast.error('Error fetching mentorship invoices:', error);
      }
    };

    fetchMentorshipInvoices();
  }, []);

  const sortData = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  
    const sortedInvoices = [...invoices].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
  
      const isDate = !isNaN(Date.parse(aValue)) && !isNaN(Date.parse(bValue));
  
      if (isDate) {
        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        if (aValue < bValue) {
          return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  
    setInvoices(sortedInvoices);
  };
  

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const mpProductMatch = invoice?.products_hash?.mp_products?.some(
      (mp_product) => mp_product[0].toLowerCase().includes(lowercasedQuery)
    );
    const calculatedTotal = invoice.paid_by_client_cash + (invoice.paid_by_client_credit * (1 - 0.03));
    return (
      invoice.id.toString().includes(lowercasedQuery) ||
      invoice.date_of_service.toLowerCase().includes(lowercasedQuery) ||
      (invoice.mentor?.name?.toLowerCase().includes(lowercasedQuery)) ||
      (invoice.client?.name?.toLowerCase().includes(lowercasedQuery)) ||
      (invoice.employee?.name?.toLowerCase().includes(lowercasedQuery)) ||
      calculatedTotal.toString().includes(lowercasedQuery) ||
      mpProductMatch
    );
  });

  const displayedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const handleShowModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="container mt-5">
      <h1>Mentorship Invoices</h1>

      <div className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by ID, Date of Service, Provider, Mentor, Client, or MP Product"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {filteredInvoices.length > 0 ? (
        <>
          <div className="flex gap-x-4 w-full justify-end my-4">
            <Button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="!bg-cyan-400 !border-cyan-500"
            >
              <ChevronLeft />
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="!bg-cyan-400 !border-cyan-500"
            >
              <ChevronRight />
            </Button>
          </div>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                {[
                  { key: 'id', label: 'ID' },
                  { key: 'date_of_service', label: 'Date of Service' },
                  { key: 'paid_by_client_cash', label: 'Total Paid by Client' },
                  { key: 'client.name', label: 'Client Name' },
                  { key: 'mentor.name', label: 'Mentor Name' },
                  { key: 'employee.name', label: 'Provider' },
                ].map(column => (
                  <th key={column.key} onClick={() => sortData(column.key)}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {column.label}{' '}
                      {sortConfig.key === column.key ? (
                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSort />
                      )}
                    </span>
                  </th>
                ))}
                <th>MP Products</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedInvoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.date_of_service}</td>
                  <td>{invoice.paid_by_client_cash + (invoice.paid_by_client_credit * (1 - 0.03))}</td>
                  <td>{invoice.client ? invoice.client.name : 'N/A'}</td>
                  <td>{invoice.mentor ? invoice.mentor.name : 'N/A'}</td>
                  <td>{invoice.employee ? invoice.employee.name : 'N/A'}</td>
                  <td>
                    {invoice.products_hash.mp_products?.length > 0
                      ? invoice.products_hash.mp_products
                          .map(mp_product => `${mp_product[0]} (${mp_product[1]})`)
                          .join(', ')
                      : 'N/A'}
                  </td>
                  <td>
                    <Button onClick={() => handleShowModal(invoice)} className="btn-info text-white">
                      Show
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <p>No mentorship invoices available.</p>
      )}

      {selectedInvoice && (
        <MentorshipInvoiceModal invoice={selectedInvoice} showModal={showModal} handleCloseModal={handleCloseModal} />
      )}

    </div>
  );
};

export default Mentorship;
