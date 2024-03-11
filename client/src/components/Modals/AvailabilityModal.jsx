import ModalWraper from "./ModalWraper";
import { Button, Form } from "react-bootstrap";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import { toast } from "react-toastify";

const availability = [
  { label: "Available", value: true },
  { label: "Unavailable", value: false },
];

const AvailabilityModal = (props) => {
  const {
    availabilityModal,
    closeModal,
    handleSubmit,
    setSelectedAvailability,
  } = props;

  const handleInputChange = (e, att) => {
    availabilityModal[att] = moment(e).toDate();
  };

  const handleDone = (e) => {
    e.preventDefault();
    if (
      !availabilityModal.end_time ||
      !availabilityModal.start_time ||
      new Date(availabilityModal.start_time).valueOf() >
        new Date(availabilityModal.end_time).valueOf()
    ) {
      toast.error("Please select valid time interval.");
      return;
    }
    handleSubmit();
  };

  return (
    <ModalWraper
      show={availabilityModal.show}
      onHide={closeModal}
      footer={
        <div className="space-x-2">
          <Button type="submit" form="appointmentForm">
            Save
          </Button>
        </div>
      }
    >
      <form
        id="appointmentForm"
        onSubmit={handleDone}
        className="text-lg flex flex-col gap-y-2"
      >
        {/* <div className="flex flex-col gap-2">
          <>
            <label htmlFor="availability">Availability</label>
            <Select
              inputId="availability"
              onChange={(selectedOption) =>
                setSelectedAvailability(selectedOption)
              }
              options={availability}
              required
              placeholder="Select availability"
            />
          </>
        </div> */}

        <div className="flex flex-col gap-2">
          <span>From</span>
          <Datetime
            value={availabilityModal.start_time}
            onChange={(event) => handleInputChange(event, "start_time")}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span>To</span>
          <Datetime
            value={availabilityModal.end_time}
            onChange={(event) => handleInputChange(event, "end_time")}
          />
        </div>

        <Form.Check
          type="checkbox"
          label="For Every Week"
          id="ForEveryWeek"
          onChange={(e) => (availabilityModal.every_week = e.target.checked)}
        />
      </form>
    </ModalWraper>
  );
};

export default AvailabilityModal;
