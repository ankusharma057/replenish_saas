import React, { useEffect, useState } from "react";
import { Button, Card, Form, OverlayTrigger, Popover } from "react-bootstrap";
import CustomEmployeeModel from "./CustomEmployeeModel";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import { toast } from "react-toastify";
import InventoryModal from "./InventoryModal";

export default function Employee({
  employee,
  invoiceList,
  userProfile,
  employeeList,
  productList,
  inventoryList,
}) {
  const [employeeInvoices, setEmployeeInvoices] = useState([]);
  const [modalShow, setModalShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [updateIvoiceInput, setUpdateIvoiceInput] = useState({
    name: employee?.name || "",
    vendor_name: employee?.vendor_name || "",
    email: employee?.email,
    gfe: employee?.gfe || false,
    service_percentage: employee?.service_percentage || 0,
    retail_percentage: employee?.retail_percentage || 0,
  });

  useEffect(() => {
    const filteredInvoices = invoiceList.filter(
      (invoice) => invoice?.employee?.id === employee?.id
    );
    setEmployeeInvoices(filteredInvoices);
  }, [invoiceList, employee]);
  function handleClick() {
    setModalShow(!modalShow);
  }

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setUpdateIvoiceInput((pre) => ({
      ...pre,
      [name]: inputValue,
    }));
  };

  function sendResetPasswordLink() {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to send the reset password mail to ${employee?.name}`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(
              "/api/employees/" + employee?.id + "/send_reset_password_link"
            );
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  }

  // console.log(updateIvoiceInput);
  function updateGfePercent(e) {
    e.preventDefault();
    fetch(`/api/employees/${employee?.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateIvoiceInput),
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Employee has been updated successfully.");
          window.location.reload();
        } else if (res.status === 404) {
          res.json().then(() => {
            toast.error("Please provide a client.");
          });
        } else {
          res.json().then(() => {
            toast.error("Failed to update Employee");
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occured.");
      });
  }

  function deleteEmployee() {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to delete ${employee?.name}, you won't be able to revert this change.`,
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            fetch(`/api/employees/${employee?.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((res) => {
                if (res.ok) {
                  toast.success("Employee has been deleted successfully.");
                  // window.location.reload();
                } else if (res.status === 404) {
                  res.json().then(() => {
                    toast.error("Please provide a client.");
                  });
                } else {
                  res.json().then(() => {
                    toast.error("Failed to delete the Employee");
                  });
                }
              })
              .catch((error) => {
                console.error("Error:", error);
                toast.error("An error occured.");
              });
          },
        },
        {
          label: "No",
          onClick: () => console.log("Click No"),
        },
      ],
    });
  }

  const updatePopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Update Employee</Popover.Header>
      <Popover.Body>
        <Form onSubmit={updateGfePercent} className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            defaultValue={employee?.name}
            onChange={handleUpdateChange}
          />
          {userProfile?.is_admin === true && (
            <>
              <Form.Label className="mt-2">Vendor Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Vendor Name"
                name="vendor_name"
                defaultValue={employee?.vendor_name}
                onChange={handleUpdateChange}
              />
            </>
          )}
          <Form.Label className="mt-2">Email</Form.Label>
          <Form.Control type="text" readOnly disabled value={employee?.email} />
          <Form.Check
            className="my-2"
            name="gfe"
            type={"checkbox"}
            id={`default-checkbox`}
            label={`GFE`}
            checked={updateIvoiceInput.gfe}
            onChange={handleUpdateChange}
          />
          <Form.Label className="mt-2">Service Percentage</Form.Label>
          <Form.Control
            type="number"
            name="service_percentage"
            defaultValue={employee?.service_percentage}
            onChange={handleUpdateChange}
          />
          <br />
          <Form.Label className="mt-2">Retail Percentage</Form.Label>
          <Form.Control
            type="number"
            name="retail_percentage"
            defaultValue={employee?.retail_percentage}
            onChange={handleUpdateChange}
          />
          <br />
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Popover.Body>
    </Popover>
  );

  const tailWindEmployeeCard = (
    <Card className="text-center w-[20rem] sm:w-[25rem]" border="info">
      <Card.Header as="h5">{employee?.name}</Card.Header>
      <Card.Body className="">
        {userProfile?.is_admin === true ? (
          <>
            <div className="flex justify-between gap-2">
              {employeeInvoices.length > 0 ? (
                <Button onClick={handleClick} variant="info">
                  Show Invoices
                </Button>
              ) : (
                <p>No Invoices</p>
              )}
              <Button onClick={() => setShowModal(true)} variant="info">
                Show Inventories
              </Button>
            </div>
            {employeeInvoices.length > 0 ? (
              <CustomEmployeeModel
                show={modalShow}
                onHide={handleClick}
                setModalShow={setModalShow}
                employeeInvoices={employeeInvoices}
                EmployeeId={employee?.id}
              />
            ) : (
              <></>
            )}
            <div
              className={`flex  ${
                employee?.is_admin === false
                  ? "justify-between"
                  : "justify-center"
              } px-2 my-3 gap-2`}
            >
              <Button onClick={sendResetPasswordLink} variant="info">
                Send Password Reset Link
              </Button>

              {employee?.is_admin === false && (
                <>
                  <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={updatePopover}
                  >
                    <Button variant="info">Update</Button>
                  </OverlayTrigger>
                  <Button
                    variant="danger"
                    onClick={() => {
                      deleteEmployee();
                    }}
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
            <Button onClick={() => setShowModal(true)} variant="info">
              Show Inventories
            </Button>
          )
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div>
      {employeeInvoices ? tailWindEmployeeCard : <div>Loading</div>}
      <InventoryModal
        inventoryList={employee}
        showModal={showModal}
        setshowModal={setShowModal}
        isQtyUpdate={false}
        employeeList={employeeList}
        userProfile={userProfile}
        productList={productList}
        entireInventoryList={inventoryList}
      />
    </div>
  );
}
