import { Button, Modal, Form, ListGroup } from "react-bootstrap";
import React, { memo, useState } from "react";

const AssignModal = ({
  showAssignMadal,
  setShowAssignMadal,
  assignProductData,
  setAssignProductData,
  assignSubmit,
  assignInput,
  setAssignInput,
  employeeList,
  employee,
  assigninventory_object,
  disabled,
}) => {
  const fillterEmployeeList = (employeeData) => {
    if (employee?.is_admin) {
      return employeeData;
    } else {
      return employeeData?.filter((i) => {
        return !i?.name?.toLowerCase()?.replace(/\s+/g, ' ').trim()?.includes("replenish testing");
      });
    }
  };
  const assigninventoryData = assigninventory_object || assignProductData;
  return (
    <Modal
      show={showAssignMadal}
      onHide={() => setShowAssignMadal(false)}
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
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder={` Type Quantity. maximum: ${assigninventoryData?.quantity}`}
              onChange={(e) =>
                setAssignInput({ ...assignInput, quantity: e.target.value })
              }
              max={assigninventoryData?.quantity}
              title={` You can select upto ${assigninventoryData?.quantity} Quantity`}
              required
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
              {fillterEmployeeList(employeeList)?.map((employee) => {
                return (
                  <option key={employee?.id} value={employee?.name}>
                    {employee?.name}
                  </option>
                );
              })}
            </Form.Select>
            <Button disabled={disabled} type="submit">
              Submit
            </Button>
          </Form>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setShowAssignMadal(false)}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default memo(AssignModal);
