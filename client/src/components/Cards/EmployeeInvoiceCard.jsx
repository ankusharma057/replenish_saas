import React, { memo } from "react";
import { Button, Card, OverlayTrigger } from "react-bootstrap";

const EmployeeInvoiceCard = ({
  title,
  userProfile,
  setShowModal,
  handleClick,
  employee,
  sendResetPasswordLink,
  updatePopover,
  deleteEmployee,
  invoiceList,
  openShowInventory,
  openShowInvoice,
  setUpdateInvoiceInput,
}) => {
  const isEmployeeAdmin = employee?.is_admin === false;
  // const [employeeInvoices, setEmployeeInvoices] = useState([]);
  // useEffect(() => {
  //   const filteredInvoices = invoiceList.filter(
  //     (invoice) => invoice?.employee?.id === employee?.id
  //   );
  //   setEmployeeInvoices(filteredInvoices);
  // }, [invoiceList, employee]);

  const employeeInvoices = invoiceList.filter(
    (invoice) => invoice?.employee?.id === employee?.id
  );

  return (
    <Card className="text-center w-[20rem] sm:w-[25rem]" border="info">
      <Card.Header as="h5">{title}</Card.Header>
      <Card.Body className="">
        {userProfile?.is_admin === true ? (
          <>
            <div className="flex justify-between gap-2">
              {employeeInvoices.length > 0 ? (
                <Button
                  onClick={() => openShowInvoice(employeeInvoices, employee)}
                  variant="info"
                >
                  Show Invoices
                </Button>
              ) : (
                <p>No Invoices</p>
              )}
              <Button
                onClick={() => {
                  openShowInventory(employeeInvoices, employee);
                  // setShowModal(true);
                }}
                variant="info"
              >
                Show Inventories
              </Button>
            </div>

            <div
              className={`flex  ${
                isEmployeeAdmin ? "justify-between" : "justify-center"
              } px-2 my-3 gap-2`}
            >
              <Button
                onClick={() => sendResetPasswordLink(employee)}
                variant="info"
              >
                Send Password Reset Link
              </Button>

              {isEmployeeAdmin && (
                <>
                  <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={updatePopover}
                  >
                    <Button
                      onClick={() => setUpdateInvoiceInput(employee)}
                      variant="info"
                    >
                      Update
                    </Button>
                  </OverlayTrigger>
                  <Button
                    variant="danger"
                    onClick={() => deleteEmployee(employee)}
                    title="Delete Employee"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          userProfile?.is_inv_manager === true &&
          userProfile?.is_admin === false && (
            <Button
              onClick={() => openShowInventory(employeeInvoices, employee)}
              variant="info"
            >
              Show Inventories
            </Button>
          )
        )}
      </Card.Body>
    </Card>
  );
};

export default memo(EmployeeInvoiceCard);
