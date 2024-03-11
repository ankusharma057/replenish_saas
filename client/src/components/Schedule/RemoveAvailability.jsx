import React from "react";
import ModalWraper from "../Modals/ModalWraper";
import { Button, Form } from "react-bootstrap";
import moment from "moment";
import { useEffect } from "react";

const RemoveAvailability = (props) => {
  const {
    removeAvailabilityData,
    removeAvailabilityModal,
    closeModal,
    handleSubmitRemoveAvailability,
  } = props;
  const handleDone = (e) => {
    e.preventDefault();
    handleSubmitRemoveAvailability();
  };
  // useEffect(()=>{
  //   removeAvailabilityData?.every_week = false
  // },[])
  return (
    <ModalWraper
      show={removeAvailabilityModal}
      onHide={closeModal}
      footer={
        <div className="space-x-2">
          <Button type="submit" form="appointmentForm">
            Remove
          </Button>
        </div>
      }
    >
      <form
        id="appointmentForm"
        onSubmit={handleDone}
        className="text-lg flex flex-col gap-y-2"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="availability">Mark Availability</label>
          From {moment(removeAvailabilityData?.start_time).format(
            "hh:mm A"
          )} to {moment(removeAvailabilityData?.end_time).format("hh:mm A")}
          {removeAvailabilityData?.every_week === true && (
            <Form.Check
              type="checkbox"
              label="For Every Week"
              id="ForEveryWeek"
              onChange={(e) =>
                (removeAvailabilityData.remove_every_week = e.target.checked)
              }
            />
          )}
        </div>
      </form>
    </ModalWraper>
  );
};

export default RemoveAvailability;
