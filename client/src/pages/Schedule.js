import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import AsideLayout from "../components/Layouts/AsideLayout";
import {
  createLocation,
  createSchedule,
  deleteAppointmentEmployee,
  deleteAvailability,
  getAvailability,
  getClients,
  getEmployeesList,
  getLocationEmployee,
  getLocations,
  getSchedule,
  markAvailability,
  remainingBalancePaidToEmployee,
  updateAvailability,
} from "../Server";
import * as dates from "react-big-calendar/lib/utils/dates";

import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import ModalWraper from "../components/Modals/ModalWraper";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../components/Input/LabelInput";
import { useAuthContext } from "../context/AuthUserContext";
import Loadingbutton from "../components/Buttons/Loadingbutton";
import ScheduleCalender from "../components/Schedule/ScheduleCalender";
import { getTimeSlots, getUnavailableEverWeekData } from "./scheduleHelper";
import AvailabilityModal from "../components/Modals/AvailabilityModal";
import RemoveAvailability from "../components/Schedule/RemoveAvailability";

const localizer = momentLocalizer(moment);

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  place: null,
  readOnly: false,
};

const initialAvailabilityModal = {
  show: false,
  start_time: null,
  end_time: null,
  readOnly: false,
  every_week: false,
};

const initialAddLocationModal = {
  show: false,
  location: "",
  employees: [],
  isLoading: false,
};

function Schedule() {
  const { authUserState } = useAuthContext();
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [allEmployeeList, setAllEmployeeList] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [serviceLocation, setServiceLocation] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [addLocationModal, setAddLocationModal] = useState(
    initialAddLocationModal
  );
  const [availabilityModal, setAvailabilityModal] = useState({
    ...initialAvailabilityModal,
  });
  const [selectedAvailability, setSelectedAvailability] = useState();

  const [employeeScheduleEventsData, setEmployeeScheduleEventsData] = useState(
    {}
  );
  const [clientNameOptions, setClientNameOptions] = useState([]);
  const [calenderCurrentRange, setCalenderCurrentRange] = useState({
    start_date: "",
    end_date: "",
  });
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      if (data?.length > 0) {
        const a = data?.map((emp) => ({
          ...emp,
          label: emp?.name,
          value: emp?.id,
        }));
        setEmployeeList(a);
        setAllEmployeeList(a);
        handleSelectEmployee(data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEmployeeSchedule = async (emp, refetch = false) => {
    try {
      const { data } = await getSchedule(
        {
          employee_id: emp.id,
          start_date: emp.start_date,
          end_date: emp.end_date,
        },
        refetch
      );
      const newData = data.map((d) => ({
        ...d,
        start_time: new Date(d.start_time),
        end_time: new Date(d.end_time),
        treatment: d?.treatment?.name || "",
        treatment_id: d?.treatment?.id || "",
        treatmentObj: d?.treatment,
      }));
      const availabilityPayload = {
        employee_id: emp.id,
      };
      const resp = await getAvailability(availabilityPayload, refetch);
      const availabilityData = resp.data.map((d) => ({
        start_time: new Date(d.start_time),
        end_time: new Date(d.end_time),
        available: d.available,
        id: d.id,
        every_week: d.every_week,
      }));
      console.log(resp, availabilityData, "availabilityData");
      const everyWeekUnavailabilities = availabilityData.filter(
        (item) => item.every_week
      );
      const cancelUnavailabilities = availabilityData.filter(
        (item) => item.available
      );
      let unavailabilityNewData = [];
      if (everyWeekUnavailabilities.length > 0) {
        const unavailData = getUnavailableEverWeekData(
          everyWeekUnavailabilities,
          emp.start_date,
          emp.end_date,
          cancelUnavailabilities
        );
        unavailabilityNewData.push(...unavailData);
      }
      const newAvailData = availabilityData.filter(
        (item) => !item.every_week && !item.available
      );
      const arr = newData.concat(newAvailData);
      const arr1 = arr.concat(unavailabilityNewData);
      setEmployeeScheduleEventsData((pre) => {
        return {
          ...pre,
          [emp.id]: arr1,
        };
      });
    } catch (error) { }
  };

  const getClientName = async (employee_id, refetch = false) => {
    try {
      const { data } = await getClients(employee_id, refetch);

      if (data?.length > 0) {
        setClientNameOptions(
          data.map((client) => ({
            label: client.name,
            value: client.id,
          }))
        );
      }
    } catch (error) { }
  };

  const getAllLocation = async (refetch = false) => {
    const { data } = await getLocations(refetch);

    if (data?.length > 0) {
      setServiceLocation(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };
  useEffect(() => {
    getEmployees();
    getAllLocation();
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEmployee = async (emp) => {
    if (emp) {
      getClientName(emp.id);
      const treatmentOption = (emp.employees_inventories || []).map((inv) => {
        return {
          label: inv.product.name,
          value: inv.product.id,
          product_type: inv.product.product_type,
          quantity: inv.quantity,
          duration: inv.product.duration,
        };
      });
      setSelectedEmployeeData({ ...emp, treatmentOption });
    }
  };
  const filteredEmployeeList = employeeList?.filter((employee) =>
    employee?.name?.toLowerCase()?.includes(employeeSearch?.toLowerCase())
  );

  const EmployeeItem = ({ index, style }) => {
    const employee = filteredEmployeeList[index];
    return (
      employee && (
        <div
          style={style}
          onClick={() => {
            selectedEmployeeData?.id !== employee.id &&
              handleSelectEmployee(employee);
            if (window.innerWidth < 1024) {
              collapse();
            }
          }}
          className={`p-2 border-b transition-all duration-700 ${selectedEmployeeData?.id === employee.id
            ? "pointer-events-none bg-gray-200 rounded-md "
            : "cursor-pointer "
            } `}
        >
          {employee.name || ""}
        </div>
      )
    );
  };

  const [removeAvailabilityModal, setRemoveAvailabilityModal] = useState(false);
  const [removeAvailabilityData, setRemoveAvailabilityData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddAppointmentSelect = ({ start, end, ...rest }, readOnly) => {
    let formateData = {
      show: true,
      start_time: start,
      end_time: end,
      date: moment(start).format("DD/MM/YYYY"),
    };

    if (readOnly) {
      formateData = {
        ...formateData,
        ...rest,
        readOnly: true,
      };
    }
    console.log(formateData, "formateData");
    if (rest?.available === false) {
      setRemoveAvailabilityData(formateData);
      setRemoveAvailabilityModal(true);
    }
    // formateData.timeSlots =
    // moment(formateData?.timeSlots[1]?.start).format("hh:mm A") === "08:00 PM"
    //   ? formateData.timeSlots.slice(0, 1)
    //   : formateData.timeSlots;
    if (rest?.available !== false) {
      setRemoveAvailabilityModal(false);
      setAppointmentModal(formateData);
    }
  };

  const handleSubmitRemoveAvailability = async () => {
    if (removeAvailabilityData.remove_every_week) {
      await deleteAvailability(removeAvailabilityData.id);
    } else if (!removeAvailabilityData.every_week) {
      await deleteAvailability(removeAvailabilityData.id);
    } else {
      removeAvailabilityData.available = true;
      removeAvailabilityData.every_week = false;
      delete removeAvailabilityData.show;
      delete removeAvailabilityData.date;
      delete removeAvailabilityData.id;
      delete removeAvailabilityData.readOnly;
      delete removeAvailabilityData.sourceResource;
      removeAvailabilityData.employee_id = selectedEmployeeData.id;
      await markAvailability(removeAvailabilityData);
    }
    getEmployeeSchedule({
      id: selectedEmployeeData.id,
      start_date: calenderCurrentRange.start_date,
      end_date: calenderCurrentRange.end_date,
    });
    setRemoveAvailabilityModal(false);
    toast.success("Availability removed successfully.");
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentModal?.client_name) {
      toast.error("Please select a client");
      return;
    } else if (!appointmentModal?.treatment) {
      toast.error("Please select a treatment");
      return;
    } else if (!appointmentModal?.selectedTimeSlot) {
      toast.error("Please select a timeslot");
      return;
    }

    const copyAppointMent = {
      ...appointmentModal,
      employee_id: selectedEmployeeData.id,
      start_time: appointmentModal.selectedTimeSlot.start,
      end_time: appointmentModal.selectedTimeSlot.end,
    };
    delete copyAppointMent.show;
    delete copyAppointMent.timeSlots;
    delete copyAppointMent.selectedTimeSlot;
    const { data } = await createSchedule(copyAppointMent);
    let newCopyAppointMent = {
      ...copyAppointMent,
      id: data?.id,
      total_amount: data?.total_amount,
      paid_amount: data?.paid_amount,
      remaining_amount: data?.remaining_amount,
    };
    setEmployeeScheduleEventsData((pre) => {
      const prevData = pre[selectedEmployeeData.id] || [];
      return {
        ...pre,
        [selectedEmployeeData.id]: [...prevData, newCopyAppointMent],
      };
    });
    setAppointmentModal(initialAppointmentModal);
    toast.success("Appointment added successfully.");
    try {
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
        error?.response?.statusText ||
        error.message ||
        "Failed to add appointment."
      ); // handle error
    }
  };

  const onCalenderRangeChange = (date) => {
    let formattedStartDate;
    let formattedEndDate;
    if (date?.start && date.end) {
      formattedStartDate = moment(date.start).format("MM/DD/YYYY");
      formattedEndDate = moment(date.end).format("MM/DD/YYYY");
    } else if (date.length > 0) {
      formattedStartDate = moment(date[0]).format("MM/DD/YYYY");
      formattedEndDate = moment(date[date.length - 1]).format("MM/DD/YYYY");
    }
    setCalenderCurrentRange({
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    });
    getEmployeeSchedule({
      id: selectedEmployeeData.id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    });
  };

  const onLocationChange = async (selectedOption) => {
    const { data } = await getLocationEmployee(selectedOption?.id);
    if (data?.length > 0) {
      setEmployeeList(data);
      setSelectedEmployeeData(null);
    }
  };

  const addLocation = async (e) => {
    try {
      e.preventDefault();

      const copyAddLocationModal = {
        ...addLocationModal,
        employee_ids: (addLocationModal?.employees || []).map((loc) => loc?.id),
      };
      delete copyAddLocationModal?.show;
      delete copyAddLocationModal?.isLoading;
      delete copyAddLocationModal?.employees;
      const { data } = await createLocation(copyAddLocationModal);
      if (data) {
        setAddLocationModal(initialAddLocationModal);
        // getEmployees();
        getAllLocation(true);
        e.target?.reset();
        toast.success("New location added successfully.");
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (selectedEmployeeData) {
      const firstVisibleDay = dates.firstVisibleDay(new Date(), localizer);
      const lastVisibleDay = dates.lastVisibleDay(new Date(), localizer);
      if (firstVisibleDay && lastVisibleDay) {
        onCalenderRangeChange({
          start: firstVisibleDay,
          end: lastVisibleDay,
        });
      }
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeData]);

  const handleAvailabilityButtonClick = () => {
    setAvailabilityModal({ ...availabilityModal, show: true });
  };

  const handleSubmit = async () => {
    try {
      if (availabilityModal.readOnly) {
        const data = {
          available: selectedAvailability.value,
        };
        await updateAvailability(availabilityModal.id, data);
        if (selectedAvailability.value) {
          setEmployeeScheduleEventsData((pre) => {
            const prevData = pre[selectedEmployeeData.id] || [];
            let newArr = prevData.filter((e) => {
              if (
                e.start_time === availabilityModal.start_time &&
                e.end_time &&
                availabilityModal.end_time
              ) {
                return false;
              } else return e;
            });
            return {
              ...pre,
              [selectedEmployeeData.id]: [...newArr],
            };
          });
          setAvailabilityModal(initialAvailabilityModal);
        }
      } else {
        const data = {
          ...availabilityModal,
          employee_id: selectedEmployeeData.id,
          available: false,
        };
        delete data.show;
        delete data.readOnly;
        const resp = await markAvailability(data);

        let newData = [];
        if (data.every_week) {
          const unavailData = getUnavailableEverWeekData(
            [{ ...data, id: resp.data.id }],
            calenderCurrentRange.start_date,
            calenderCurrentRange.end_date
          );
          newData.push(...unavailData);
          setEmployeeScheduleEventsData((pre) => {
            const prevData = pre[selectedEmployeeData.id] || [];
            return {
              ...pre,
              [selectedEmployeeData.id]: [...prevData, ...newData],
            };
          });
        } else {
          setEmployeeScheduleEventsData((pre) => {
            const prevData = pre[selectedEmployeeData.id] || [];
            return {
              ...pre,
              [selectedEmployeeData.id]: [
                ...prevData,
                { ...data, id: resp.data.id },
              ],
            };
          });
        }
      }
      setAvailabilityModal(initialAvailabilityModal);
      toast.success("Availability updated successfully.");
    } catch (error) {
      setAvailabilityModal(initialAvailabilityModal);
      toast.error(
        error?.response?.data?.exception ||
        error?.response?.statusText ||
        error?.message ||
        "Failed to update availability"
      ); // handle error
    }
  };

  const handlePaymentModal = async (appointmentModal) => {
    await remainingBalancePaidToEmployee(appointmentModal.id)
      .then((res) => {
        if (res.status === 201) {
          toast.success("Payment done successfully.");
          console.log(res);
          setAppointmentModal({
            ...appointmentModal,
            remaining_amount: 0,
            paid_amount: appointmentModal.total_amount,
            show: true
          });
          setEmployeeScheduleEventsData((pre) => {
            return {
              ...pre,
              [selectedEmployeeData.id]: pre[selectedEmployeeData.id].map(
                (event) => {
                  if (event.id === appointmentModal.id) {
                    return {
                      ...event,
                      remaining_amount: 0,
                      paid_amount: appointmentModal.total_amount,
                    };
                  }
                  return event;
                }
              ),
            };
          });
          setShowConfirmPayment(false);
        }
      })
      .catch((error) => {
        if (error.response.status === 422) {
          toast.error("You do not have enough inventory to pay the remaining amount.");
        } else {
          toast.error("Payment failed, Please contact administrator.");
        }
      });
  };

  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <div>
              <SearchInput
                placeholder="Search Staff..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                All Staff <ChevronDown />
              </h1>
              <div
                className="flex pb-24 flex-col p-2 gap-4 overflow-y-auto"
                key={employeeSearch}
              >
                {(filteredEmployeeList || []).length > 0 && (
                  <List
                    height={window.innerHeight - 350}
                    itemCount={employeeList.length}
                    itemSize={45}
                    width={"100%"}
                  >
                    {EmployeeItem}
                  </List>
                )}
              </div>
            </div>
          </>
        }
      >
        <div className="flex-1  py-10 px-2 bg-white">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h1>{selectedEmployeeData?.name}</h1>
            <div className="flex gap-2 flex-col sm:flex-row">
              {serviceLocation?.length > 0 && (
                <div className="flex flex-col gap-y-2 sm:flex-row items-center gap-x-2">
                  <Select
                    className="w-80 z-10"
                    options={serviceLocation}
                    placeholder="Search Places"
                    onChange={onLocationChange}
                  />
                  {authUserState.user?.is_admin && (
                    <Button
                      onClick={() =>
                        setAddLocationModal((pre) => ({ ...pre, show: true }))
                      }
                      variant="info"
                      className="text-white flex w-full sm:w-fit"
                    >
                      Add
                    </Button>
                  )}
                </div>
              )}
              <Button
                onClick={handleAvailabilityButtonClick}
                variant={"info"}
                className=" text-white"
              >
                Mark Availability
              </Button>
            </div>
          </div>

          {selectedEmployeeData && (
            <ScheduleCalender
              events={employeeScheduleEventsData[selectedEmployeeData.id] || []}
              onSelectEvent={(event) => {
                handleAddAppointmentSelect(event, true);
              }}
              onSelectSlot={handleAddAppointmentSelect}
              onRangeChange={onCalenderRangeChange}
              eventPropGetter={(event) => {
                const backgroundColor =
                  "available" in event && !event.available && "#d3d3d3";
                return { style: { backgroundColor } };
              }}
            />
          )}
        </div>
      </AsideLayout>

      {/* Availability modal */}
      <AvailabilityModal
        availabilityModal={availabilityModal}
        closeModal={() => setAvailabilityModal(initialAvailabilityModal)}
        handleSubmit={handleSubmit}
        setSelectedAvailability={(o) => setSelectedAvailability(o)}
      />

      {/* Add appointment modal */}
      <ModalWraper
        show={appointmentModal.show}
        onHide={() => setAppointmentModal(initialAppointmentModal)}
        title={
          appointmentModal?.readOnly
            ? `Appointment Details`
            : "New  Appointment"
        }
        footer={
          <div className="space-x-2">
            {appointmentModal.readOnly ? (
              <Button
                className="btn btn-danger"
                onClick={() => {
                  setShowConfirm(true);
                  appointmentModal.show = false;
                }}
              >
                Cancel Appointment
              </Button>
            ) : null}
            {appointmentModal.readOnly ? null : (
              <Button type="submit" form="appointmentForm">
                Save
              </Button>
            )}
            {parseInt(appointmentModal?.remaining_amount) > 0 && (
              <Button
                onClick={() => {
                  setShowConfirmPayment(true);
                  appointmentModal.show = false;
                }}
              >
                Pay Remaining Amount
              </Button>
            )}
            {/* <Button>+ Add</Button> */}
          </div>
        }
      >
        <form
          id="appointmentForm"
          onSubmit={addAppointMentSubmit}
          className="text-lg flex flex-col gap-y-2"
        >
          {selectedEmployeeData &&
            selectedEmployeeData?.treatmentOption?.length > 0 && (
              <div className="flex flex-col gap-2">
                {appointmentModal?.readOnly ? (
                  <div>
                    <span>Treatment</span>
                    <br></br>
                    <span>{appointmentModal?.treatment || ""}</span>
                  </div>
                ) : (
                  <>
                    <label htmlFor="treatment">Treatment</label>
                    <Select
                      inputId="treatment"
                      isClearable
                      onChange={(selectedOption) => {
                        var timeSlots = getTimeSlots(
                          selectedOption?.duration,
                          appointmentModal.start_time,
                          employeeScheduleEventsData[selectedEmployeeData.id]
                        );
                        timeSlots = timeSlots?.filter((slot) => {
                          let slotTime = moment(slot.start);
                          let slotEndTime = moment(slot.end);
                          if (
                            slotTime.hour() < 20 ||
                            (slotTime.hour() === 20 && slotTime.minute() === 0)
                          ) {
                            return (
                              slotEndTime.hour() < 20 ||
                              (slotEndTime.hour() === 20 &&
                                slotEndTime.minute() === 0)
                            );
                          } else {
                            return false;
                          }
                        });
                        setAppointmentModal((pre) => ({
                          ...pre,
                          treatment_id: selectedOption?.value,
                          treatment: selectedOption?.label,
                          product_type: selectedOption?.product_type,
                          product_id: selectedOption?.value,
                          timeSlots: timeSlots,
                        }));
                      }}
                      options={selectedEmployeeData.treatmentOption}
                      placeholder="Select a Treatment"
                      required
                    />
                  </>
                )}
              </div>
            )}

          <div className="flex flex-col gap-2">
            {appointmentModal?.readOnly ? (
              <div>
                <span>Client</span>
                <br></br>
                <span>
                  {/* {(clientNameOptions || []).find(
                    (op) => op?.value === appointmentModal?.client_id
                  )?.label || ""} */}
                  {appointmentModal?.client?.name ||
                    appointmentModal?.client_name ||
                    ""}
                </span>
              </div>
            ) : (
              <>
                <label htmlFor="client">Client</label>
                <Select
                  isClearable
                  isCreatable
                  inputId="client"
                  // defaultValue={
                  //   (clientNameOptions || []).find(
                  //     (op) => op.value === appointmentModal?.client_id
                  //   ) || ""
                  // }
                  onChange={(selectedOption) =>
                    setAppointmentModal((pre) => ({
                      ...pre,
                      client_name: selectedOption?.label,
                      client_id: selectedOption?.value,
                    }))
                  }
                  options={clientNameOptions}
                  required
                  placeholder="Select a client"
                />
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span>Time</span>
            {appointmentModal.readOnly ? (
              <span>
                {moment(appointmentModal.start_time).format("hh:mm A")} -{" "}
                {moment(appointmentModal.end_time).format("hh:mm A")}
              </span>
            ) : (
              appointmentModal?.timeSlots
                ?.filter(
                  (slot) =>
                    !employeeScheduleEventsData[selectedEmployeeData.id]?.some(
                      (schedule) =>
                        moment(schedule.start_time).isSame(
                          moment(slot.start)
                        ) && moment(schedule.end_time).isSame(moment(slot.end))
                    )
                )
                ?.map((slot) => {
                  return (
                    <Form.Check
                      type="radio"
                      checked={
                        appointmentModal?.selectedTimeSlot &&
                        appointmentModal.selectedTimeSlot === slot
                      }
                      label={`${moment(slot.start).format(
                        "hh:mm A"
                      )} - ${moment(slot.end).format("hh:mm A")}`}
                      id={slot}
                      onChange={(selectedOption) =>
                        setAppointmentModal((pre) => ({
                          ...pre,
                          selectedTimeSlot: slot,
                        }))
                      }
                    />
                  );
                })
            )}
            {appointmentModal.readOnly && (
              <div className="flex flex-col gap-2">
                <span>Transaction Details</span>
                <div className="flex gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <span>Total Amount</span>
                    <span>{parseFloat(appointmentModal?.total_amount)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Paid Amount</span>
                    <span>{parseFloat(appointmentModal?.paid_amount)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span>Remaining Amount</span>
                    <span>
                      {parseFloat(appointmentModal?.remaining_amount)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </ModalWraper>

      <ModalWraper
        show={showConfirmPayment}
        title="Confirm"
        onHide={() => {
          setShowConfirmPayment(false);
          appointmentModal.show = true;
        }}
        footer={
          <div className="flex gap-2">
            <button
              className="btn btn-danger mr-auto"
              onClick={() => {
                handlePaymentModal(appointmentModal);
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
              Are you sure you want to confirm payment of this appointment?
            </span>
          </div>
        </div>
      </ModalWraper>

      <ModalWraper
        show={showConfirm}
        title="Confirm"
        onHide={() => {
          setShowConfirm(false);
          appointmentModal.show = true;
        }}
        footer={
          <div className="flex gap-2">
            <button
              className="btn btn-danger mr-auto"
              onClick={async () => {
                const res = await deleteAppointmentEmployee(
                  appointmentModal.id
                );
                if (res.status === 200) {
                  toast.success("Appointment has been cancelled successfully");
                  setShowConfirm(false);
                  setAppointmentModal(initialAppointmentModal);
                  getEmployeeSchedule(
                    {
                      id: selectedEmployeeData.id,
                      start_date: calenderCurrentRange.start_date,
                      end_date: calenderCurrentRange.end_date,
                    },
                    true
                  );
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

      {/* remove availability modal */}
      <RemoveAvailability
        removeAvailabilityData={removeAvailabilityData}
        removeAvailabilityModal={removeAvailabilityModal}
        closeModal={() => setRemoveAvailabilityModal(false)}
        handleSubmitRemoveAvailability={handleSubmitRemoveAvailability}
        setSelectedAvailability={(o) => setSelectedAvailability(o)}
      />

      {/* create location modal */}
      <ModalWraper
        show={addLocationModal.show}
        onHide={() => setAddLocationModal(initialAddLocationModal)}
        title={"Add New Location"}
        footer={
          <Loadingbutton
            type="submit"
            title="Add"
            isLoading={addLocationModal.isLoading}
            loadingText="Adding..."
            form="addLocation"
          />
        }
      >
        <form
          id="addLocation"
          onSubmit={addLocation}
          className="text-lg flex flex-col gap-y-2"
        >
          <LabelInput
            controlId="locationName"
            label="Location"
            name="location"
            onChange={(e) => {
              setAddLocationModal((pre) => ({
                ...pre,
                location: e.target.value,
              }));
            }}
            placeholder="Add new location"
            required
            type="text"
          />

          <Select
            inputId="availableEmployee"
            isClearable
            isMulti
            onChange={(emp) => {
              setAddLocationModal((pre) => ({
                ...pre,
                employees: emp,
              }));
            }}
            options={allEmployeeList}
            placeholder="Select Available Employees"
            required
          />
        </form>
      </ModalWraper>
    </>
  );
}

export default Schedule;
