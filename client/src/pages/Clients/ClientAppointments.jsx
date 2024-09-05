import { useEffect, useState } from "react";
import {
  deleteAppointment,
  getClientSchedule,
  remainingBalance,
} from "../../Server";
import { useLocation } from "react-router-dom";

import ClientScheduleCalender from "../../components/Schedule/ClientScheduleCalender";
import ModalWraper from "../../components/Modals/ModalWraper";
import moment from "moment";
import { toast } from "react-toastify";

const initialSelectedModal = {
  show: false,
  treatment: "",
  date: "",
  end_time: "",
  start_time: "",
};
function ClientSchedule() {
  const [clientSchedules, setClientSchedules] = useState([]);
  const [showSelectedClientModal, setShowSelectedClientModal] =
    useState(initialSelectedModal);
  const [showToastOnce, setShowToastOnce] = useState(false);
  const { state } = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getSchedule();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if(!showToastOnce) {
  //     if (!state) {
  //       toast.error("Payment failed, Please contact administrator.");
  //       setShowToastOnce(true);
  //     } else if (state === "success") {
  //       toast.success("Appointment has been created successfully");
  //       setShowToastOnce(true);
  //     }
  //   }
  // }, []);

  const getSchedule = async () => {
    const { data } = await getClientSchedule(true);
    console.log(data);
    if (data?.length > 0) {
      setClientSchedules(() => {
        return (data || []).map((d) => ({
          ...d,
          start_time: new Date(d.start_time),
          end_time: new Date(d.end_time),
          treatment: d.treatment?.name || "",
          total_price: `${d?.total_amount} $`,
          paid_amt: d?.paid_amount ? `${d?.paid_amount}$` : "0 $",
          remaining_amt: d?.remaining_amount
            ? `${d?.remaining_amount} $`
            : `${d?.total_amount} $`,
        }));
      });
    }
  };

  return (
    <>
      <div className="p-2 md:p-20">
        <>
          <div className="flex items-center justify-between pl-1">
            <h1 className="text-center">Your Appointments</h1>
          </div>
          <ClientScheduleCalender
            events={clientSchedules || []}
            onSelectEvent={(event) =>
              setShowSelectedClientModal({ ...event, show: true })
            }
          />
        </>
        <ModalWraper
          show={showConfirm}
          title="Confirm"
          onHide={() => {
            setShowConfirm(false);
            showSelectedClientModal.show = true;
          }}
          footer={
            <div className="flex gap-2">
              <button
                className="btn btn-danger mr-auto"
                onClick={async () => {
                  const res = await deleteAppointment(
                    showSelectedClientModal.id
                  );
                  if (res.status === 200) {
                    toast.success(
                      "Appointment has been cancelled successfully"
                    );
                    setShowConfirm(false);
                    setShowSelectedClientModal(initialSelectedModal);
                    getSchedule();
                  } else {
                    toast.error("Something went wrong. Please try again.");
                  }
                }}
              >
                Yes
              </button>
            </div>
          }
        >
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg">
                Are you sure you want to cancel this appointment?
              </span>
            </div>
          </div>
        </ModalWraper>
        <ModalWraper
          show={showSelectedClientModal.show}
          title="Your Booked appointment"
          onHide={() => setShowSelectedClientModal(initialSelectedModal)}
          footer={
            <div className="flex gap-2">
              <button
                className="btn btn-danger mr-auto"
                onClick={() => {
                  setShowConfirm(true);
                  showSelectedClientModal.show = false;
                }}
              >
                Cancel Appointment
              </button>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    const res = await remainingBalance(
                      showSelectedClientModal.id
                    );
                    if (res.status === 200 && res.data?.redirect_url) {
                      window.open(res.data?.redirect_url, "_blank");
                      setShowSelectedClientModal(initialSelectedModal);
                      getSchedule();
                    }
                  } catch (error) {
                    if (error.response.status === 422) {
                      if (error.response?.data?.error === "No inventories") {
                        toast.error("No inventories. Please try again later.");
                      } else {
                        toast.error("Something went wrong. Please try again later.");
                      }
                    } else {
                      toast.error(
                        "Payment failed, Please contact administrator."
                      );
                    }
                  }
                }}
              >
                Pay Balance
              </button>
            </div>
          }
        >
          <div className="space-y-2">
            <div className="flex flex-col gap-2">
              {showSelectedClientModal.treatment && (
                <>
                  <span className="font-medium text-lg">
                    Treatment By {showSelectedClientModal.employee.name}
                  </span>
                  <span>{showSelectedClientModal?.treatment || ""}</span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg">Time</span>

              {showSelectedClientModal.start_time && (
                <span>
                  {moment(showSelectedClientModal.start_time).format("hh:mm A")}{" "}
                  -{moment(showSelectedClientModal.end_time).format("hh:mm A")}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg">Total Balance</span>

              {showSelectedClientModal.total_price && (
                <span>{showSelectedClientModal?.total_price || ""}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg">Paid Balance</span>

              {showSelectedClientModal?.paid_amt && (
                <span>{showSelectedClientModal.paid_amt || ""}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-medium text-lg">Remaining Balance</span>

              {showSelectedClientModal?.remaining_amt && (
                <span>{showSelectedClientModal.remaining_amt || ""}</span>
              )}
            </div>
          </div>
        </ModalWraper>
      </div>
    </>
  );
}

export default ClientSchedule;
