import React, { useEffect, useState } from "react";
import EmployeeInvoiceCard from "../components/Cards/EmployeeInvoiceCard";
import {
  deleteEmployeeRoute,
  getEmployeesList,
  getInvoiceList,
  sendResetPasswordLinkRoute,
  updateVendore,
} from "../Server";
import { useAuthContext } from "../context/AuthUserContext";
import InventoryModal from "../components/Modals/InventoryModal";
import InvoiceListModal from "../components/Modals/InvoiceListModal";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "react-toastify";
import { Form, Popover } from "react-bootstrap";
import LabelInput from "../components/Input/LabelInput";
import Loadingbutton from "../components/Buttons/Loadingbutton";

const Employee = () => {
  const { authUserState } = useAuthContext();
  const [invoiceList, setInvoiceList] = useState([]);
  const [invModalSHow, setInvModalSHow] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [employeeInvoices, setEmployeeInvoices] = useState({
    invoices: [],
    employee: {},
  });
  const [loading, setLoading] = useState(false);

  const [invoiceModalShow, setInvoiceModalShow] = useState(false);
  const [updateIvoiceInput, setUpdateIvoiceInput] = useState({
    name: employeeInvoices.employee?.name || "",
    vendor_name: employeeInvoices.employee?.vendor_name || "",
    email: employeeInvoices.employee?.email,
    gfe: employeeInvoices.employee?.gfe || false,
    service_percentage: employeeInvoices.employee?.service_percentage || 0,
    retail_percentage: employeeInvoices.employee?.retail_percentage || 0,
  });

  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      setEmployeeList(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getInvoices = async () => {
    const { data } = await getInvoiceList();
    setInvoiceList(data);
  };

  useEffect(() => {
    getEmployees();
    getInvoices();
    return () => {};
  }, []);

  const openShowInventory = (invoice, employee) => {
    setEmployeeInvoices({
      invoices: invoice,
      employee: employee,
    });
    setInvModalSHow(true);
  };

  const openShowInvoice = (invoice, employee) => {
    setEmployeeInvoices({
      invoices: invoice,
      employee: employee,
    });
    setInvoiceModalShow(true);
  };

  const sendResetPasswordLink = (employee) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to send the reset password mail to ${employee?.name}`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              await sendResetPasswordLinkRoute(employee);
              toast.success("Send reset password main successfully delivered");
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Some Error Occur"
              );
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

  const updateGfePercent = async (e) => {
    e.preventDefault();
    const updatedData = {
      email: updateIvoiceInput.email,
      gfe: updateIvoiceInput.gfe,
      name: updateIvoiceInput.name,
      retail_percentage: updateIvoiceInput.retail_percentage,
      service_percentage: updateIvoiceInput.service_percentage,
      vendor_name: updateIvoiceInput.vendor_name,
    };
    try {
      setLoading(true);
      const { data } = await updateVendore(updateIvoiceInput.id, updatedData);
      toast.success("Employee has been updated successfully.");
      await getEmployees(true);
      setUpdateIvoiceInput(data);
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message ||
          "Failed to update Employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === "checkbox" ? checked : value;
    setUpdateIvoiceInput((pre) => ({
      ...pre,
      [name]: inputValue,
    }));
  };
  const updatePopover = (
    <Popover id="popover-basic">
      <Popover.Header as="h3">Update Employee</Popover.Header>
      <Popover.Body>
        <Form onSubmit={updateGfePercent} className="mb-3">
          <LabelInput
            label="Name"
            type="text"
            defaultValue={updateIvoiceInput.name}
            controlId="name"
            name="name"
            placeholder="Enter Name"
            onChange={handleUpdateChange}
            required={true}
          />
          {authUserState.user?.is_admin === true && (
            <>
              <LabelInput
                label="Vendor Name"
                type="text"
                defaultValue={updateIvoiceInput.vendor_name}
                controlId="vendor_name"
                name="vendor_name"
                placeholder="Enter Vendor Name"
                onChange={handleUpdateChange}
                required={true}
              />
            </>
          )}

          <LabelInput
            label="Email"
            type="text"
            value={updateIvoiceInput.email}
            controlId="email"
            name="email"
            disabled
            readOnly
          />
          <Form.Check
            className="my-2"
            name="gfe"
            type={"checkbox"}
            id={`default-checkbox`}
            label={`GFE`}
            checked={updateIvoiceInput.gfe}
            onChange={handleUpdateChange}
          />

          <LabelInput
            label="Service Percentage"
            type="number"
            defaultValue={updateIvoiceInput.service_percentage}
            controlId="service_percentage"
            onChange={handleUpdateChange}
            name="service_percentage"
          />

          <LabelInput
            label="Retail Percentage"
            controlId="service_percentage"
            type="number"
            name="retail_percentage"
            defaultValue={updateIvoiceInput.retail_percentage}
            onChange={handleUpdateChange}
          />

          <Loadingbutton
            isLoading={loading}
            title="Submit"
            loadingText={"Updating Employee..."}
            type="submit"
          />
        </Form>
      </Popover.Body>
    </Popover>
  );

  const deleteEmployee = (employee) => {
    confirmAlert({
      title: "Confirm to submit",
      message: `Are you sure you want to delete ${employee?.name}, you won't be able to revert this change.`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              await deleteEmployeeRoute(employee.id);
              toast.success("Employee has been deleted successfully.");
              await getEmployees(true);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error.response.statusText ||
                  error.message ||
                  "Failed to delete the Employee"
              );
            } finally {
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

  return (
    <>
      {/* <Header /> */}

      <InvoiceListModal
        show={invoiceModalShow}
        onHide={() => setInvoiceModalShow(false)}
        setModalShow={invoiceModalShow}
        employeeInvoices={employeeInvoices.invoices}
        EmployeeName={employeeInvoices.employee.name}
      />
      {invModalSHow && (
        <InventoryModal
          inventoryList={employeeInvoices.employee}
          showModal={invModalSHow}
          setshowModal={setInvModalSHow}
          isQtyUpdate={false}
          employeeList={employeeList}
          userProfile={authUserState.user}
          // productList={productList}
          // entireInventoryList={inventoryList}
          getEmployees={getEmployees}
        />
      )}
      <div className="mt-3 mb-3 mx-1 flex justify-center flex-wrap gap-3">
        {employeeList
          ?.sort((a, b) => a?.name?.localeCompare(b?.name))
          ?.map((employee) => {
            return (
              <EmployeeInvoiceCard
                key={employee.id}
                employeeList={employeeList}
                employee={employee}
                title={employee.name}
                invoiceList={invoiceList}
                userProfile={authUserState.user}
                openShowInventory={openShowInventory}
                openShowInvoice={openShowInvoice}
                sendResetPasswordLink={sendResetPasswordLink}
                updatePopover={updatePopover}
                setUpdateIvoiceInput={setUpdateIvoiceInput}
                deleteEmployee={deleteEmployee}
              />
            );
          })}
      </div>
    </>
  );
};

export default Employee;
