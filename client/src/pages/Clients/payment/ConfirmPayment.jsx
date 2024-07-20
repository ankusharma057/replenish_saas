import React, { useCallback, useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthContext } from "../../../context/AuthUserContext";
import ClientLayout from "../../../components/Layouts/ClientLayout";
import { useLocation } from "react-router-dom";
import { getClientEmployee, getIntakeFormsWithTreatment, reminder } from "../../../Server";
import { IoClose } from "react-icons/io5";

const ConfirmPayment = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authUserState } = useAuthContext();
  const { state } = useLocation();
  const [paymentState, setPaymentState] = useState("");
  const [intakeForms, setIntakeForms] = useState();
  const [isTabVisible, setIsTabVisible] = useState(true);

  const handleVisibilityChange = useCallback(() => {
    setIsTabVisible(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  console.log(isTabVisible)

  useEffect(() => {
    const refreshIntakeForms = () => {
      getIntakeForms()
    }

    if (isTabVisible) {
      refreshIntakeForms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTabVisible]);

  const getIntakeForms = async () => {
      try {
        const response = await getIntakeFormsWithTreatment(params.get('treatment_id'));
        if (response.status === 200) {
          setIntakeForms(response.data)
        }
      }
      catch (err) { }
    }

  useEffect(() => {
    if (!state?.redirect_url) {
      navigate("/clients");
      toast.error("Something went wrong. Please try again.");
      return;
    } else if (!authUserState.client) {
      navigate("/clients/signin");
      toast.error("Please login first.");
      return;
    }

    getIntakeForms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getEmp = async () => {
      const { data } = await getClientEmployee(params.get('empId'));
      if (data) {
        setPaymentState(data.pay_50 ? 'now' : 'later')
      }
    }
    if (params.get('empId')) {
      getEmp()
    }
  }, [params])
  const [reminderOptions, setReminderOptions] = useState({
    email2DaysBefore: false,
    email24HoursBefore: false,
    textMessage2DaysBefore: false,
    textMessage24HoursBefore: false,
  });

  const handleReminderChange = (option) => {
    setReminderOptions((prevOptions) => ({
      ...prevOptions,
      [option]: !prevOptions[option],
    }));
  };

  const checkAllFormsSubmitted = () => {
    const allFormsSubmitted = (intakeForms || []).filter((data) => (data.submitted === false))
    if (allFormsSubmitted.length === 0) {
      return false
    }
    else {
      return true
    }
  }

  const handleFormSubmit = async () => {
    let reminderOptionsSorted = [
      reminderOptions.email2DaysBefore ? "email_48" : null,
      reminderOptions.email24HoursBefore ? "email_24" : null,
      reminderOptions.textMessage2DaysBefore ? "text_48" : null,
      reminderOptions.textMessage24HoursBefore ? "text_24" : null,
    ];
    if (!paymentState) {
      toast.error("Please select payment option");
      return;
    }
    try {
      if (checkAllFormsSubmitted()) {
        toast.error("Please Fillout Intake Forms")
      }
      else {
        if (paymentState === "now") {
          const response = await reminder(state?.id, {
            reminder: reminderOptionsSorted,
          });
          if (response?.status === 200) {
            toast.success("Reminder has been set successfully");
            window.open(state?.redirect_url, "_blank");
            navigate("/clients/appointments", { state: "success" });
          }
        } else {
          const response = await reminder(state?.id, {
            reminder: reminderOptionsSorted,
          });
          if (response?.status === 200) {
            toast.success("Reminder has been set successfully");
            toast.success("Appointment has been created successfully");
            navigate("/clients/appointments", { state: "success" });
          }
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };




  return (
    <ClientLayout>
      <Form className="flex bg-white flex-col gap-2 p-6 rounded-lg">
        <div className="flex  gap-2">
          <div className="flex p-3 bg-gray-100 rounded-full w-4 h-4 justify-center items-center">
            1
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl">How would you like to remind?</h2>
            <Form.Check
              type="checkbox"
              label="Email 2 days before appointment"
              id="email2DaysBefore"
              // checked={reminderOptions.email2DaysBefore}
              onChange={() => handleReminderChange("email2DaysBefore")}
            />
            <Form.Check
              type="checkbox"
              label="Email 24 hours before appointment"
              id="email24HoursBefore"
              // checked={reminderOptions.email24HoursBefore}
              onChange={() => handleReminderChange("email24HoursBefore")}
            />
            <Form.Check
              type="checkbox"
              label="Text message(SMS) 2 days before appointment"
              id="textMessage2DaysBefore"
              // checked={reminderOptions.textMessage2DaysBefore}
              onChange={() => handleReminderChange("textMessage2DaysBefore")}
            />
            <Form.Check
              type="checkbox"
              label="Text message(SMS) 24 hours before appointment"
              id="textMessage24HoursBefore"
              // checked={reminderOptions.textMessage24HoursBefore}
              onChange={() => handleReminderChange("textMessage24HoursBefore")}
            />
          </div>
        </div>

        <div className="flex  gap-2">
          <div className="flex p-3 bg-gray-100 rounded-full w-4 h-4 justify-center items-center">
            2
          </div>
          <div className="flex flex-col flex-1 gap-2">
            <h2 className="text-xl">Cancellation Policy</h2>
            <div className="flex flex-col justify-between">
              <p>Please fill out our online intake form</p>
              <div className="border w-[50%] rounded-md p-2 px-3">
                <div className="flex flex-col gap-1">
                  {Array.isArray(intakeForms) && intakeForms.length > 0 ? intakeForms.map((form, i) => (
                    <div key={i} className="grid grid-cols-[1fr,auto] items-center">
                      <div>{form?.name}</div>
                      <div>
                        <Link className="no-underline" target="_blank" to={`/clients/intake-form/?intake_form_id=${form?.id}&client_id=${authUserState.client.id}`}>
                          <div className={`cursor-pointer text-white px-2 rounded-md py-[3px] ${form?.submitted ? "bg-green-400" : "bg-red-400"}`}>
                            Fill out intake form
                          </div>
                        </Link>
                      </div>
                    </div>
                  )) : 'No Intake Forms Are Available'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex  gap-2">
          <div className="flex p-3 bg-gray-100 rounded-full w-4 h-4 justify-center items-center">
            3
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-xl">Cancellation Policy</h2>
            <p>
              Your appointment time is reserved just for you. A late
              cancellation or missed visit leaves a hole in the therapist day
              that could be filled by another patient. As such, we require 48
              hours notices for any cancellation or changes to your appointment.
              Patients who provide less than 48 hours notices or miss their
              appointment will be charged a cancellation fee of the card on
              file.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleFormSubmit}>Confirm</Button>
        </div>
      </Form>
    </ClientLayout>
  );
};

export default ConfirmPayment;
