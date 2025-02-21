import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  getInvoiceList,
  getAllInvoiceList,
  invoiceFinalize,
  multipleInvoiceFinalize,
} from "../Server";
import InvoiceCard from "../components/Cards/InvoiceCard";
import DataFilterService from "../services/DataFilterService";
import { Button, ButtonGroup, Spinner, ToggleButton } from "react-bootstrap";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import CustomModal from "../components/Modals/CustomModal";
import { useAuthContext } from "../context/AuthUserContext";
import ModalWraper from "../components/Modals/ModalWraper";
import FinalizeInvoicesCard from "../components/Cards/FinalizeInvoicesCard";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import { ChevronRight, ChevronLeft } from "lucide-react";
import InvoiceTabular from "../components/Tables/InvoiceTabular";
import FinalizeInvoicesTable from "../components/Tables/FinalizeInvoicesTable";
import { deleteInvoice, deleteMultipleInvoices  } from "../Server";

const styles = {
  tableWrapper: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '10px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #333',
    padding: '10px 15px',
    fontWeight: 'bold',
    borderRadius: '4px',
    backgroundColor: '#e9ecef',
  },
  invoiceRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #dee2e6',
    padding: '10px 15px',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  invoiceColumn: {
    flexBasis: '20%',
    flexGrow: 1,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: '5px',
  },
};


const Invoice = () => {
  const [radioValue, setRadioValue] = useState("1");
  const [invoiceList, setInvoiceList] = useState({
    finalized: [],
    "non-finalized": [],
  });
  const [loading, setLoading] = useState(false);
  const { authUserState } = useAuthContext();
  const [selectList, setSelectList] = useState("non-finalized");
  const [modalShow, setModalShow] = useState(false);
  const [singleInvoice, setSingleInvoice] = useState({});
  const [showMultipleFinalizeModal, setShowMultipleFinalizeModal] =
    useState(false);
  const [multipleInvoiceData, setMultipleInvoiceData] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [finalized, setFinalized] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [allInvoices, setAllInvoices] = useState([]);
  const [inputValue, setInputValue] = useState(pageNumber);
  const [screenLoading, setScreenLoading] = useState(false)
  const getInvoices = async (refetch = false) => {
    const { data } = await getAllInvoiceList({
      is_finalized: finalized,
      page: pageNumber,
      query: searchQuery,
      field: selectedField.value
    }, refetch);
  
    setTotalPages(data?.total_pages);
  
    if (!finalized) {
      setTotalEntries(data?.total_entries);
    }
  
    const invoiceList = data.invoices || [];
    const groupedInvoices = DataFilterService.invoiceGroupByFinalized(invoiceList);

    setInvoiceList(groupedInvoices);
  };
  

  const getAllInvoices = async (refetch = false) => {
    const { data } = await getAllInvoiceList({ is_finalized: false, per_page: totalEntries }, true);
    setAllInvoices(data?.invoices || []);
  }
  
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setInputValue(value);
      const newPage = parseInt(value, 10);
      if (newPage > 0 && newPage <= totalPages) {
        setPageNumber(newPage);
      }
    }
  };

  const [selectedField, setSelectedField] = useState({ value: 'invoice_id', label: 'Invoice ID' });

  const options = [
    { value: 'invoice_id', label: 'Invoice ID' },
    { value: 'client_name', label: 'Client Name' },
    { value: 'employee_name', label: 'Employee Name' }
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: '#06b6d4',
      '&:hover': { borderColor: '#06b6d4' },
      boxShadow: '0 0 0 1px #06b6d4',
      height: '48px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#e0f7fa' : 'white',
      color: state.isFocused ? '#06b6d4' : 'black'
    })
  };


  const handleFieldChange = (selectedOption) => {
    setSelectedField(selectedOption);
    setSearchQuery('');
  };

  useEffect(() => {
    getInvoices();
    return () => {};
  }, [finalized, pageNumber, searchQuery, selectedField]);

  const finalizeInvoiceSubmit = (invoice) => {
    confirmAlert({
      title: "Confirm to finalize",
      message:
        "Are you sure you want to finalize, this will send this invoice as a mail to the provider",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setScreenLoading(true);
              await invoiceFinalize(invoice.id, invoice);
              toast.success(
                "Invoice finalized successfully and the mail has been sent on the email id"
              );
              await getInvoices(true);
              setScreenLoading(false);
            } catch (error) {
              console.log(error);
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to Finalize Invoices."
              );

              if (error.response.status === 422) {
                toast.warning(
                  "Finalize Other Invoices:" +
                    invoice?.fellow_non_finalized_invoices +
                    " to get the mail please."
                );
                setScreenLoading(false);
              }
              setScreenLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  const radios = [
    { name: "Non Finalized Invoices", value: "1" },
    { name: "Finalized Invoices", value: "2" },
  ];

  const seeMore = (invoice) => {
    setSingleInvoice(invoice);
    setModalShow(true);
  };

  const addMultipleFinalize = (invoiceId, invoice) => {
    setMultipleInvoiceData((prevData) => {
      if (prevData[invoiceId]) {
        // If the invoice is already selected, remove it
        const newData = { ...prevData };
        delete newData[invoiceId];
        return newData;
      } else {
        // If the invoice is not selected, add it
        return { ...prevData, [invoiceId]: invoice };
      }
    });
  };

  const finalizeMultipleInvoiceSubmit = () => {
    setShowMultipleFinalizeModal(false);
    setLoading(true);
    confirmAlert({
      title: "Confirm to finalize",
      message: `  Are you sure you want to finalize ${
        Object.keys(multipleInvoiceData).length
      } invoice(s), this will send this invoice as a mail to the provider(s).`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            setShowMultipleFinalizeModal(true);
            try {
              const { data } = await multipleInvoiceFinalize(
                Object.values(multipleInvoiceData)
              );
              if (data) {
                toast.success(
                  <ul>
                    {data.message?.map((item, index) => (
                      <li className="list-disc" key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              } else {
                toast.success(
                  "Invoices finalized successfully and the mail has been sent on the email id"
                );
              }

              await getInvoices(true);
              setMultipleInvoiceData({});
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to Finalize Invoices."
              );
              if (error.response.status === 422) {
                toast.warning(
                  "Finalize Other Invoices, to get the mail please."
                );
              }
            } finally {
              setShowMultipleFinalizeModal(false);
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  };

  const onCustomModalHide = async () => {
    setModalShow(false);
    await getInvoices(true);
  };

  const [sortConfig, setSortConfig] = useState({ key: 'invoiceId', direction: 'asc' });

  const [sortedInvoices, setSortedInvoices] = useState([]);

  const sortInvoices = (invoices, key, direction) => {
    const sortedInvoices = [...invoices];
    sortedInvoices.sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortedInvoices;
  };

  useEffect(() => {
    if (invoiceList[selectList]?.length) {
      const sorted = sortInvoices(invoiceList[selectList], sortConfig.key, sortConfig.direction);
      setSortedInvoices(sorted);
    } else {
      setSortedInvoices([]);
    }
  }, [invoiceList, selectList, sortConfig]);  

  // Handle column header click to sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const [selectedInvoices, setSelectedInvoices] = useState([]);

  const handleBulkDelete = async () => {
    const numberOfInvoices = selectedInvoices.length;
    const confirmation = window.confirm(
      `Are you sure you want to delete ${numberOfInvoices} invoice${numberOfInvoices > 1 ? "s" : ""}?`
    );

    if (confirmation) {
      try {
        const { data } = await deleteMultipleInvoices(selectedInvoices, true); // Use the updated function
        toast.success(`${numberOfInvoices} invoice${numberOfInvoices > 1 ? "s" : ""} deleted successfully.`);
        getInvoices(true);
      } catch (error) {
        toast.error("An error occurred while deleting invoices.");
      }

      // Reset selection after deletion
      setSelectedInvoices([]);
    }
  };
  

  const toggleInvoiceSelection = (invoiceId) => {
    setSelectedInvoices((prevSelected) => {
      if (prevSelected.includes(invoiceId)) {
        // If already selected, remove it
        return prevSelected.filter((id) => id !== invoiceId);
      } else {
        // If not selected, add it
        return [...prevSelected, invoiceId];
      }
    });
  };

  const handlePageChange = (event) => {
    const newPage = parseInt(event.target.value);
    if (newPage > 0 && newPage <= totalPages) {
      setInputValue(newPage);
      setPageNumber(newPage);
    }
  };

  const handleInputBlur = () => {
    setInputValue(pageNumber); // Reset the input if user leaves it blank or invalid
  };

  const handlePageSubmit = (event) => {
    event.preventDefault();
    const newPage = parseInt(inputValue);
    if (newPage > 0 && newPage <= totalPages) {
      setPageNumber(newPage);
    } else {
      setInputValue(pageNumber); // Reset the input if invalid
    }
  };
  const ScreenLoading = () => {
    return <div style={{ width: "100%", height: "87vh", position: "absolute", zIndex: 9, background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }} className='d-flex justify-content-center align-items-center'>
        <Spinner animation="border" variant="info" />
    </div>
}
  return (
    <>
    {screenLoading && <ScreenLoading />}
      <br />
      <div className="flex  flex-col lg:flex-row items-center relative">
        <div className="w-full flex justify-center">
          <ButtonGroup className="mb-2 gap-2 border w-full md:w-auto border-gray-200 p-3 ">
            {radios.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                className={`custom-toggle-btn ${
                  radioValue === radio.value ? "!rounded-2xl !font-medium !text-[1.2rem] !px-12 !bg-cyan-400 !border-cyan-500 " : "btn-white"
                } toggle-button `}
                name="radio"
                style={{
                  borderTopLeftRadius:
                    idx === 0 && radioValue === radio.value ? "0" : "1rem",
                  borderBottomLeftRadius:
                    idx === 0 && radioValue === radio.value ? "0" : "1rem",
                  borderTopRightRadius:
                    idx === radios.length - 1 && radioValue === radio.value
                      ? "0"
                      : "1rem",
                  borderBottomRightRadius:
                    idx === radios.length - 1 && radioValue === radio.value
                      ? "0"
                      : "1rem",
                }}
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => {
                  setSelectList(
                    String(e.currentTarget.value) === "1"
                      ? "non-finalized"
                      : "finalized"
                  );
                  setRadioValue(e.currentTarget.value);
                  setFinalized((String(e.currentTarget.value) === "1")? false : true)
                  setPageNumber(1);
                }}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
        </div>
        <div className="static lg:absolute right-4 ">
          <Button
            type="button"
            onClick={() => {setShowMultipleFinalizeModal(true);
              getAllInvoices(true);
            }}
            className=" whitespace-nowrap px-4 !bg-cyan-400 !border-cyan-500"
          >
            Finalize Multiple
          </Button>
        </div>
      </div>
      <hr />
      <ModalWraper
        show={showMultipleFinalizeModal}
        onHide={() => setShowMultipleFinalizeModal(false)}
        footer={
          <>
            {Object.keys(multipleInvoiceData).length > 0 && (
              <Loadingbutton
                title={`Finalize`}
                isLoading={loading}
                loadingText={`Finalizing ${
                  Object.keys(multipleInvoiceData).length
                } invoices...`}
                onClick={finalizeMultipleInvoiceSubmit}
              />
            )}
          </>
        }
        size="lg"
      >
        <div className="justify-center flex flex-wrap gap-3 min-h-[5rem] max-h-[35rem] overflow-y-auto" style={{ display: 'block' }}>
  {/* Header Row */}
  <div style={styles.headerRow}>
    <div
      style={styles.invoiceColumn}
      onClick={() => handleSort('invoice.id')} // Sorting by Invoice Id
    >
      <strong>Employee Name</strong>
      {/* {sortConfig.key === 'invoiceId' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''} */}
    </div>
    <div
      style={styles.invoiceColumn}
      onClick={() => handleSort('employeeMentor')}
    >
      <strong>Invoice Id</strong>
    </div>
    <div
      style={styles.invoiceColumn}
      onClick={() => handleSort('details')}
    >
      <strong>Client Name</strong>
    </div>
    <div
      style={styles.invoiceColumn}
      onClick={() => handleSort('finalize')}
    >
      <strong>Date of Service</strong>
    </div>
  </div>

  {/* Table Rows */}
  {allInvoices?.map((invoice) => {  
    return (
      <FinalizeInvoicesTable
        key={invoice.id}
        employeeName={invoice.employee_name}
        clientName={invoice.client?.name}
        invoiceId={invoice.id}
        invoice={invoice}
        finalizeInvoiceSubmit={finalizeInvoiceSubmit}
        addMultipleFinalize={addMultipleFinalize}
        multipleInvoiceData={multipleInvoiceData}
      />
    );
  })}
</div>

      </ModalWraper>
      <div className="p-4">
        {modalShow && (
          <CustomModal
            show={modalShow}
            onHide={onCustomModalHide}
            userProfile={authUserState.user}
            invoiceData={singleInvoice}
            fiInvoiceList={singleInvoice.is_finalized}
            getInvoices={getInvoices}
            finalizeInvoiceSubmit={finalizeInvoiceSubmit}
          />
        )}

        <div className="flex justify-center items-center mb-4 gap-4 p-4 bg-white shadow-md rounded-xl">
          <div className="w-1/4">
            <Select
              className="z-50 h-full"
              options={options}
              value={selectedField}
              placeholder="Select Search Field"
              onChange={handleFieldChange}
              styles={customStyles}
            />
          </div>

          <input
            type="text"
            placeholder={selectedField ? `Search by ${selectedField.label}` : "Select a field first"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-3/4 p-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition duration-200 h-12"
            disabled={!selectedField}
          />
        </div>

        {/* <div className="flex gap-x-4  justify-end my-4">
          {/* Pagination controls *
          <Button
            onClick={() => setPageNumber(pageNumber - 1)}
            className="!bg-cyan-400 !border-cyan-500"
            disabled={pageNumber === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => setPageNumber(pageNumber + 1)}
            className="!bg-cyan-400 !border-cyan-500"
            disabled={
              pageNumber === totalPages
            }
          >
            <ChevronRight />
          </Button>
        </div> */}
        <div className="justify-center flex flex-wrap gap-3">
        <div style={styles.tableWrapper}>
      <div style={styles.container}>
        <div style={styles.headerRow}>
        <div
            style={styles.invoiceColumn}
            onClick={() => handleSort('invoice.id')}  // Sorting by Invoice Id
          >
            <strong>Invoice Id</strong>
            {sortConfig.key === 'invoiceId' ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : ''}
          </div>
          <div
            style={styles.invoiceColumn}
            onClick={() => handleSort('employeeMentor')}
          >
            <strong>Employee/Mentor</strong>
          </div>
          <div
            style={styles.invoiceColumn}
            onClick={() => handleSort('details')}
          >
            <strong>See More Details</strong>
          </div>
          <div
            style={styles.invoiceColumn}
            onClick={() => handleSort('finalize')}
          >
            <strong>Finalize Invoice</strong>
          </div>
          {/* <div
            style={styles.invoiceColumn}
            onClick={() => handleSort('delete')}
          >
            {/* <strong>Delete</strong> 
          </div> */}
        </div>

        {sortedInvoices.length > 0 ? (
          sortedInvoices.map((invoice) => (
            <InvoiceTabular
              key={invoice.id}
              invoice={invoice}
              seeMore={seeMore}
              finalizeInvoiceSubmit={finalizeInvoiceSubmit}
              getInvoices={getInvoices}
              toggleInvoiceSelection={toggleInvoiceSelection}
            />
          ))
        ) : (
          <div style={styles.invoiceRow}>
            <div style={styles.invoiceColumn}>
              No invoices available.
            </div>
          </div>
        )}
        {selectedInvoices.length > 0 && (
        <button 
        onClick={handleBulkDelete}
        style={{
          backgroundColor: '#dc3545', // Red background color for delete button
          color: 'white', // White text color
          padding: '8px 15px', // Padding around the text
          border: 'none', // Removing the default border
          borderRadius: '5px', // Rounded corners
          fontSize: '14px', // Font size
          cursor: 'pointer', // Cursor pointer on hover
          display: 'block', // Makes the button inline
          marginTop: '10px', // Space at the top
          fontWeight: 'bold', // Makes text bold
          width: '150px', // Set a specific width for the button
          textAlign: 'center' // Center the text inside the button
        }}
      >
        Delete Selected ({selectedInvoices.length})
      </button>
      
      )}
      </div>
    </div>
        </div>
        {/* <div className="flex gap-x-4  justify-end my-4">
          {/* Pagination controls *
          <Button
            onClick={() => setPageNumber(pageNumber - 1)}
            className="!bg-cyan-400 !border-cyan-500"
            disabled={pageNumber === 1}
          >
            <ChevronLeft />
          </Button>
          <Button
            onClick={() => setPageNumber(pageNumber + 1)}
            className="!bg-cyan-400 !border-cyan-500"
            disabled={
              pageNumber === totalPages
            }
          >
            <ChevronRight />
          </Button>
        </div> */}
        <div className="flex gap-x-4 justify-end my-4">
      {/* Left Button */}
      <Button
        onClick={() => setPageNumber(pageNumber - 1)}
        className="!bg-cyan-400 !border-cyan-500"
        disabled={pageNumber === 1}
      >
        <ChevronLeft />
      </Button>

      {/* Page Input */}
      <form
        className="flex items-center">
        <span>Page</span>
        <input
          type="number"
          value={inputValue}
          // onChange={(e) => setInputValue(e.target.value)}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="mx-2 w-12 text-center"
          min={1}
          max={totalPages}
        />
        <span>of {totalPages}</span>
      </form>

      {/* Right Button */}
      <Button
        onClick={() => setPageNumber(pageNumber + 1)}
        className="!bg-cyan-400 !border-cyan-500"
        disabled={pageNumber === totalPages}
      >
        <ChevronRight />
      </Button>
    </div>
      </div>
    </>
  );
};

export default Invoice;
