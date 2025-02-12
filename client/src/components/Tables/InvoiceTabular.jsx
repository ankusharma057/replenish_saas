
// import React, { memo } from "react";
// import { Button } from "react-bootstrap";
// import { confirmAlert } from "react-confirm-alert";
// import { toast } from "react-toastify";
// import { deleteInvoice } from "../../Server";

// const styles = {
//   tableWrapper: {
//     width: '90%',
//     maxWidth: '1200px',
//     margin: '0 auto',
//     padding: '10px',
//   },
//   container: {
//     display: 'table',
//     width: '100%',
//     borderCollapse: 'collapse',
//   },
//   headerRow: {
//     display: 'table-row',
//     backgroundColor: '#e9ecef',
//     fontWeight: 'bold',
//     borderBottom: '2px solid #333',
//   },
//   headerColumn: {
//     display: 'table-cell',
//     padding: '10px 15px',
//     textAlign: 'center',
//     border: '1px solid #ddd',
//   },
//   invoiceRow: {
//     display: 'table-row',
//     backgroundColor: '#f8f9fa',
//   },
//   invoiceColumn: {
//     display: 'table-cell',
//     padding: '8px 15px',
//     textAlign: 'center',
//     border: '1px solid #dee2e6',
//   },
//   button: {
//     padding: '5px 10px',
//     fontSize: '12px',
//   }
// };

// const InvoiceTabular = ({ invoice, seeMore, finalizeInvoiceSubmit, getInvoices }) => {
//   return (
//     <div style={styles.tableWrapper}>
//       <div style={styles.container}>
//         {/* Header Row - Only displayed once at the top */}
//         {/* <div style={styles.headerRow}>
//           <div style={styles.headerColumn}>Invoice Id</div>
//           <div style={styles.headerColumn}>Employee/Mentor</div>
//           <div style={styles.headerColumn}>Details</div>
//           <div style={styles.headerColumn}>Finalize</div>
//           <div style={styles.headerColumn}>Delete</div>
//         </div> */}

//         {/* Invoice Row */}
//         <div style={styles.invoiceRow}>
//           <div style={styles.invoiceColumn}>
//             {invoice.source_invoice_id ? "Mentor " : ""}Invoice Id {invoice.id}
//           </div>
//           <div style={styles.invoiceColumn}>
//             {invoice.source_invoice_id ? "Mentor:" : "Employee:"} {invoice.employee?.name}
//           </div>
//           <div style={styles.invoiceColumn}>
//             <Button
//               onClick={() => seeMore(invoice)}
//               className="mb-3 text-white"
//               variant="info"
//               style={styles.button}
//             >
//               See More Details
//             </Button>
//           </div>
//           <div style={styles.invoiceColumn}>
//             <Button
//               style={{ display: invoice.is_finalized ? "none" : "inline", ...styles.button }}
//               onClick={() => finalizeInvoiceSubmit(invoice)}
//               variant="info"
//               className="text-white"
//             >
//               Finalize Invoice
//             </Button>
//           </div>
//           <div style={styles.invoiceColumn}>
//             <Button
//               style={{ display: invoice.is_finalized ? "inline" : "none", ...styles.button }}
//               onClick={async () => {
//                 confirmAlert({
//                   title: "Confirm to delete",
//                   message: "Are you sure you want to delete this invoice?",
//                   buttons: [
//                     {
//                       label: "Yes",
//                       onClick: async () => {
//                         try {
//                           const { data } = await deleteInvoice(invoice?.id);
//                           if (data) {
//                             toast.success("Invoice Deleted Successfully.");
//                             getInvoices(true);
//                           } else {
//                             toast.error("Something went wrong");
//                           }
//                         } catch (error) {
//                           toast.error("Something went wrong");
//                         }
//                       },
//                     },
//                     {
//                       label: "No",
//                       onClick: () => console.log("Click No"),
//                     },
//                   ],
//                 });
//               }}
//               variant="danger"
//               className="text-white"
//               style={styles.button}
//             >
//               Delete
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default memo(InvoiceTabular);

import React, { memo, useState } from "react";
import { Button } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { deleteInvoice } from "../../Server";

const styles = {
  tableWrapper: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '10px',
  },
  container: {
    display: 'table',
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    display: 'table-row',
    backgroundColor: '#e9ecef',
    fontWeight: 'bold',
    borderBottom: '2px solid #333',
  },
  headerColumn: {
    display: 'table-cell',
    padding: '10px 15px',
    textAlign: 'center',
    border: '1px solid #ddd',
  },
  invoiceRow: {
    display: 'table-row',
    backgroundColor: '#f8f9fa',
  },
  invoiceColumn: {
    display: 'table-cell',
    padding: '8px 15px',
    textAlign: 'center',
    border: '1px solid #dee2e6',
  },
  button: {
    padding: '5px 10px',
    fontSize: '12px',
  },
};

const InvoiceTabular = ({
  invoice,
  seeMore,
  finalizeInvoiceSubmit,
  getInvoices,
  toggleInvoiceSelection,
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleCheckboxChange = () => {
    setIsSelected(!isSelected);
    toggleInvoiceSelection(invoice.id); // This will update the parent state
  };

  const handleDeleteInvoice = async () => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this invoice?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const { data } = await deleteInvoice(invoice?.id);
              if (data) {
                toast.success("Invoice Deleted Successfully.");
                getInvoices(true);
              } else {
                toast.error("Something went wrong");
              }
            } catch (error) {
              toast.error("Something went wrong");
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

  return (
    <div style={styles.tableWrapper}>
      <div style={styles.container}>

        {/* Invoice Row */}
        <div style={styles.invoiceRow}>
          <div style={styles.invoiceColumn}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
            />
          </div>
          <div style={styles.invoiceColumn}>
            {invoice.id}
          </div>
          <div style={styles.invoiceColumn}>
            {invoice.employee?.name}
          </div>
          <div style={styles.invoiceColumn}>
            <Button
              onClick={() => seeMore(invoice)}
              className="text-white"
              variant="info"
              style={styles.button}
            >
              See More Details
            </Button>
          </div>
          <div style={styles.invoiceColumn}>
            <Button
              style={{ display: invoice.is_finalized ? "none" : "inline", ...styles.button }}
              onClick={() => finalizeInvoiceSubmit(invoice)}
              variant="info"
              className="text-white"
            >
              Finalize Invoice
            </Button>
          </div>
          <div style={styles.invoiceColumn}>
            <Button
              style={{ display: invoice.is_finalized ? "inline" : "none", ...styles.button }}
              onClick={handleDeleteInvoice}
              variant="danger"
              className="text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(InvoiceTabular);
