import { Button, Modal, Form } from "react-bootstrap";
import React, { memo } from "react";
import Loadingbutton from "../Buttons/Loadingbutton";
import LabelInput from "../Input/LabelInput";

const AssignModal = ({
  showAssignMadal,
  setShowAssignMadal,
  assignProductData,
  assignSubmit,
  assignInput,
  setAssignInput,
  employeeList,
  employee,
  assigninventory_object,
  loading,
  loadingText,
  setLoading,
}) => {
  const filterEmployeeList = (employeeData) => {
    if (employee?.is_admin) {
      return employeeData;
    } else {
      return employeeData?.filter((i) => {
        return !i?.name
          ?.toLowerCase()
          ?.replace(/\s+/g, " ")
          .trim()
          ?.includes("replenish training");
      });
    }
  };
  const assigninventoryData = assigninventory_object || assignProductData;
  return (
    <Modal
      show={showAssignMadal}
      onHide={() => {
        setShowAssignMadal(false);
        setLoading(false);
      }}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Product Name: {assigninventoryData?.product?.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="flex justify-between flex-col items-center gap-2">
        <div className="w-full">
          <Form className="flex flex-col gap-4" onSubmit={assignSubmit}>
        

            <LabelInput
              label="Quantity"
              controlId="Quantity"
              placeholder={` Type Quantity. maximum: ${assigninventoryData?.quantity}`}
              required={true}
              onChange={(e) =>
                setAssignInput({ ...assignInput, quantity: e.target.value })
              }
              className="-mb-3"
              max={assigninventoryData?.quantity}
              type="number"
              title={` You can select upto ${assigninventoryData?.quantity} Quantity`}
              step="0.01"
              min="0"
              name="password"
            />

            <Form.Select
              aria-label="Default select example"
              onChange={(e) =>
                setAssignInput({
                  ...assignInput,
                  employee_name: e.target.value,
                })
              }
              required
            >
              <option>Select The Employee</option>
              {filterEmployeeList(
                employeeList?.filter((i) => i?.id !== employee.id)
              )?.map((employee) => {
                return (
                  <option key={employee?.id} value={employee?.name}>
                    {employee?.name}
                  </option>
                );
              })}
            </Form.Select>
            <Loadingbutton
              isLoading={loading}
              title="Submit"
              loadingText={loadingText || "Submitting..."}
              type="submit"
            />
            {/* <Button disabled={disabled} type="submit">
              Submit
            </Button> */}
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => {
            setShowAssignMadal(false);
            setLoading(false);
          }}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default memo(AssignModal);
