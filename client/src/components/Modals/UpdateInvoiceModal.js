import React from "react";
import Loadingbutton from "../Buttons/Loadingbutton";
import ModalWraper from "./ModalWraper";
import LabelInput from "../Input/LabelInput";
import { Form } from "react-bootstrap";

const UpdateInvoiceModal = ({
  showUpdateModal,
  handleNestedClick,
  invoiceID,
  nestedInputModal,
  updateSubmit,
  setNestedInputModal,
  loading,
}) => {
  return (
    <>
      <ModalWraper
        show={showUpdateModal}
        onHide={handleNestedClick}
        title={"Update Invoice"}
        footer={
          <>
            <Loadingbutton
              isLoading={loading}
              form="form1"
              title="Submit"
              loadingText="Updating Invoice..."
              type="submit"
            >
              Submit
            </Loadingbutton>
          </>
        }
      >
        <div className="text-2xl text-gray-700">InvoiceID: {invoiceID}</div>
        <Form
          onSubmit={updateSubmit}
          id="form1"
          className="max-w-4xl mx-auto bg-white p-4 rounded-md"
        >
          <div className=" border rounded-sm p-2 mb-4 flex-col gap-2 flex justify-content-around">
            <div>
              Overhead Fee Type:
              <Form.Select
                name="overheadFeeType"
                value={nestedInputModal.overheadFeeType}
                onChange={(event) =>
                  setNestedInputModal({
                    ...nestedInputModal,
                    overheadFeeType: event.target.value,
                  })
                }
                className="w-full mt-1 p-1 border-gray-300 border rounded-md"
              >
                <option value="">Select Type</option>
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </Form.Select>
            </div>

            <LabelInput
              label="Overhead Fee Value:"
              type="number"
              placeholder={"Overhead Fee"}
              controlId="overheadFeeValue"
              name="overheadFeeValue"
              onChange={(event) =>
                setNestedInputModal({
                  ...nestedInputModal,
                  overheadFeeValue: event.target.value,
                })
              }
              className="w-full mt-1 p-1 border-gray-300 border rounded-md"
            />

            <LabelInput
              label="Total"
              type="number"
              placeholder={"Total"}
              controlId="total"
              name="total"
              onChange={(event) =>
                setNestedInputModal({
                  ...nestedInputModal,
                  charge: event.target.value,
                })
              }
              className="w-full mt-1 p-1 border-gray-300 border rounded-md"
            />
          </div>
        </Form>
      </ModalWraper>
    
    </>
  );
};

export default UpdateInvoiceModal;
