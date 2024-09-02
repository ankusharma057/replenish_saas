import React, { useEffect, useRef, useState } from "react";
import LogoHeader from "../../components/Headers/LogoHeader";
import ClientLayout from "../../components/Layouts/ClientLayout";
import Heading from "../../components/Headers/Heading";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  createClientSchedule,
  getAllLocationAndEmployee,
  getClientEmployee,
  getClientEmployeeAvailability,
  getEmployeeAvailablities,
  getClientEmployeeSchedule,
  getLocationEmployee,
  getProductsList,
  getTreatmentsList,
} from "../../Server";
import Select from "react-select";
import { Button, Form } from "react-bootstrap";
import * as dates from "react-big-calendar/lib/utils/dates";

import EmployeeProfileCard from "../../components/Cards/EmployeeProfileCard";
import ClientScheduleCalender from "../../components/Schedule/ClientScheduleCalender";
import { useAuthContext } from "../../context/AuthUserContext";
import { toast } from "react-toastify";
import moment from "moment";
import ModalWraper from "../../components/Modals/ModalWraper";
import ClientAsideLayout from "../../components/Layouts/ClientAsideLayout";
import { useAsideLayoutContext } from "../../context/AsideLayoutContext";
import { getTimeSlots, getUnavailableEverWeekData } from "../scheduleHelper";
import { momentLocalizer } from "react-big-calendar";
import _ from 'lodash';

const localizer = momentLocalizer(moment);

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  location: null,
  isEdit: false,
};
const ClientLocation = () => {
  const [params, setParams] = useSearchParams();
  const updatedParams = new URLSearchParams(params);
  const { authUserState } = useAuthContext();
  const { collapse } = useAsideLayoutContext();
  const navigate = useNavigate();
  const { state } = useLocation();

  const locId = params.get("locId");
  const empId = params.get("empId");
  const [employees, setEmployees] = useState([]);
  const [locationAndEmployee, setLocationAndEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [treatmentsList, setTreatmentsList] = useState([]);
  const [selectedTreatMent, setSelectedTreatMent] = useState(null);
  const [selectedEmpSchedules, setSelectedEmpSchedules] = useState([]);
  const topViewRef = useRef();
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [calenderCurrentRange, setCalenderCurrentRange] = useState({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    const firstVisibleDay = dates.firstVisibleDay(new Date(), localizer);
    const lastVisibleDay = dates.lastVisibleDay(new Date(), localizer);
    if (firstVisibleDay && lastVisibleDay) {
      onCalenderRangeChange({
        start: firstVisibleDay,
        end: lastVisibleDay,
      });
    }
    return () => { };
  }, []);

  useEffect(() => {
    if (empId) {
      const fetchData = async () => {
        await getEmp();
        if(calenderCurrentRange.start_date !== "" && calenderCurrentRange.end_date !== ""){
          await getEmpSchedule(calenderCurrentRange);  
        }
      };
      fetchData();
    }

    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId]);

  useEffect(() => {
    getEmpByLocId();
    getLocEmp();
    if(calenderCurrentRange.start_date !== "" && calenderCurrentRange.end_date !== ""){
    getEmpSchedule(calenderCurrentRange);
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locId, empId]);

  useEffect(() => {
    if (selectedTreatMent) {
      localStorage.setItem("treatment", JSON.stringify(selectedTreatMent));
      updatedParams.set("treatment_id", selectedTreatMent.treatment.id);
      setParams(updatedParams);
    }
  }, [selectedTreatMent]);

  useEffect(() => {
    if (state?.selectedTreatMent) {
      setSelectedTreatMent({ ...state.selectedTreatMent });
    }
    return () => { };
  }, [state?.selectedTreatMent]);

  const getEmp = async () => {
    try {
      const { data } = await getClientEmployee(empId);
      if (data) {
        setSelectedEmployee(data);
        const { data: products } = await getProductsList();
        const { data: treatments } = await getTreatmentsList(data?.id);

        const groupedTreatments = _(treatments)
              .groupBy('product.id')
              .map(group => ({
                product: _.head(group).product,
                treatments: _.map(group, o => o)
              }))
              .value()

        if (products?.length) {
          setProductsList(products);
        }

        if (treatments?.length) {
          setTreatmentsList(groupedTreatments);
        }
      } else {
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getLocEmp = async () => {
    try {
      const { data } = await getAllLocationAndEmployee();
      if (data?.length > 0) {
        setLocationAndEmployee(data);
      }
    } catch (error) {
      console.log(error);
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
    getEmpSchedule({
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    });
  };
  const getEmpSchedule = async (emp, refetch = false) => {
    try {
      if (empId) {
        const { data } = await getClientEmployeeSchedule(empId, refetch);
        let newData = data?.map((d) => ({
          ...d,
          schedule: d,
          start_time: new Date(d.start_time),
          end_time: new Date(d.end_time),
          treatment: d?.treatment?.treatment || "",
        }));

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        const availabilityPayload = {
          employee_id: empId,
          from_date: formatDate(emp?.start_date),
          to_date: formatDate(emp?.end_date),
          location_id: locId
        };

        const availibilityData = await getEmployeeAvailablities(
          availabilityPayload, true
        );

        const unavailibilityData = await getClientEmployeeAvailability(
          empId,true
        );

        const availabilityTimings = availibilityData.data.map(d => {
          return d.availability_timings.map(obj => ({
            start_time: new Date(d.availability_date + " " + obj.start_time),
            end_time: new Date(d.availability_date + " " + obj.end_time),
            available: true
          }));
        });

        const availabilityDataNew = availabilityTimings.flatMap(obj=>obj)

        const unavailabilityDataNew = unavailibilityData.data.map((d) => ({ 
          start_time: new Date(d.start_time),
          end_time: new Date(d.end_time),
          available: d.available,
          id: d.id,
          every_week: d.every_week,
        }));
        const everyWeekUnavailabilities = unavailabilityDataNew.filter(
          (item) => item.every_week
        );
        const cancelUnavailabilities = unavailabilityDataNew.filter(
          (item) => item.available
        );
        let unavailabilityNewData = [];
        if (everyWeekUnavailabilities.length > 0) {
          const unavailData = await getUnavailableEverWeekData(
            everyWeekUnavailabilities,
            emp.start_date,
            emp.end_date,
            cancelUnavailabilities
          );
          unavailabilityNewData.push(...unavailData);
        }
        const newAvailData = unavailabilityDataNew.filter(
          (item) => !item.every_week && !item.available
        );
        const arr = newData.concat(newAvailData);
        const arr1 = arr.concat(unavailabilityNewData,availabilityDataNew);
        setSelectedEmpSchedules(arr1);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getEmpByLocId = async () => {
    try {
      if (params.get("locId")) {
        const { data } = await getLocationEmployee(params.get("locId"));
        if (data.length) {
          setEmployees(data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isEmp = !((!!empId && !selectedEmployee) || !empId);

  const handleAddAppointmentSelect = (e) => {
    if (e?.client?.id && e?.client?.id === authUserState.client?.id) {
      toast("This slot is already booked by you.");
      return;
    }
    if (e?.client?.id && e?.client?.id !== authUserState.client?.id) {
      toast("This slot is already booked.");
      return;
    }
    if ("available" in e && !e.available) {
      toast("Unavailable at this slot");
      return;
    }
    if (!selectedTreatMent) {
      return toast("Please select the treatment");
    }

    const start = e.start_time;
    const end = e.end_time;
    const duration = selectedTreatMent?.treatment?.duration;

   const a =  getTimeSlots(duration, start, selectedEmpSchedules, end, e.available? false : true)

    let formateData = {
      show: true,
      start_time: start,
      end_time: isNaN(duration)
        ? end
        : moment(start).add(+duration, "minutes").toDate(),
      date: moment(start).format("DD/MM/YYYY"),
      isEdit: true,
      timeSlots: a,
    };

    localStorage.setItem("formateData", JSON.stringify(formateData));
    formateData.timeSlots = formateData.timeSlots.filter((slot) => {
      let slotTime = moment(slot.start);
      let slotEndTime = moment(slot.end);
      if (
        slotTime.hour() < 20 ||
        (slotTime.hour() === 20 && slotTime.minute() === 0)
      ) {
        return (
          slotEndTime.hour() < 20 ||
          (slotEndTime.hour() === 20 && slotEndTime.minute() === 0)
        );
      } else {
        return true;
      }
    });
  
    if (e.available) {
      setAppointmentModal({ ...formateData, isEdit: true });
    } else {
      setAppointmentModal(formateData);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    const isValidSlot = selectedEmpSchedules.some(schedule => {
      return schedule.available &&
        moment(slotInfo.start).isSameOrAfter(schedule.start_time) &&
        moment(slotInfo.end).isSameOrBefore(schedule.end_time);
    });

    if (!isValidSlot) {
      toast.error("Please select an available slot.");
      return;
    }
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTreatMent?.product?.id) {
      toast.error("Please select a treatment");
      return;
    }
    if (!appointmentModal?.selectedTimeSlot?.start) {
      toast.error("Please select a time slot.");
      return;
    }
    const copyAppointMent = {
      start_time: appointmentModal?.selectedTimeSlot?.start,
      date: appointmentModal?.date,
      end_time: appointmentModal?.selectedTimeSlot?.end,
      employee_id: selectedEmployee?.id,
      treatment_id: selectedTreatMent?.treatment?.id,
      product_id: selectedTreatMent?.product?.id,
      location_id: locId,
    };

    const { data } = await createClientSchedule(copyAppointMent);
    if (data?.redirect_url) {
      const stateObject = {
          locId,
          empId,
          selectedTreatMent,
          id: data?.schedule.id,
      };

      if (data?.redirect_url && data?.schedule?.employee?.pay_50) {
        stateObject.redirect_url = data?.redirect_url;
      }else{
        stateObject.redirect_url = `/clients/appointments`;
      }
      navigate(`/clients/payment/confirm_payment?empId=${empId}&treatment_id=${selectedTreatMent?.treatment?.id}`, {
        state: stateObject,
      });
    }
    else if(data.schedule) {
      toast.success("Appointment added successfully.");
    }  
    else {
      toast.error("Something went wrong. Please try again.");
    }
    setAppointmentModal(initialAppointmentModal);
    await getEmpSchedule(calenderCurrentRange, true);
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

  const filteredTimeSlots = appointmentModal?.timeSlots?.filter((slot) => {
    const isWithinAvailableTime = selectedEmpSchedules?.some(
      (schedule) => schedule.available &&
        moment(slot.start).isSameOrAfter(schedule.start_time) &&
        moment(slot.end).isSameOrBefore(schedule.end_time)
    );

    const overlapWithBooking = selectedEmpSchedules.some(
      (schedule) => !schedule.available &&
        moment(slot.start).isBefore(schedule.end_time) &&
        moment(slot.end).isAfter(schedule.start_time)
    );

    return isWithinAvailableTime && !overlapWithBooking;
  });

  return (
    <ClientLayout>
      <div className="bg-white min-h-full rounded-lg pb-4 text-slate-800">
        <LogoHeader />
        <Heading
          text={
            <div>
              <span className="text-3xl font-thin">
                Book an Appointment
              </span>
            </div>
          }
        />

        {isEmp ? (
          <ClientAsideLayout
            asideContent={
              <div className="flex flex-col ">
                <h3>{selectedEmployee?.name}</h3>
                <p>Select a treatment</p>
                <ul className="flex p-0 flex-col gap-2 ">
                  {(treatmentsList || []).map((treatmentObj) => (
                    <li key={treatmentObj?.product?.id} className="rounded-lg p-2">
                      {treatmentObj?.product?.name}
                      <ul className="m-0 p-0 text-center space-y-2">
                        {(treatmentObj?.treatments || []).map((treatment) => (
                          <li
                            key={treatment?.id}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTreatMent({
                                product: treatmentObj?.product,
                                treatment,
                              });

                              if (window.innerWidth < 1024) {
                                collapse();
                              }
                              setTimeout(() => {
                                topViewRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                });
                              }, 500);
                            }}
                            className={`flex flex-col transition-all text-white text-sm cursor-pointer rounded-sm p-2 ${selectedTreatMent?.treatment?.id === treatment?.id
                                ? "bg-blue-800"
                                : "bg-primary-dark-blue hover:bg-black"
                              }`}
                          >
                            <span>{treatment?.name}</span>
                            <span>
                              {treatment?.duration} min
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            }
          >
            <div
              ref={topViewRef}
              className="flex-1 mt-5 overflow-x-auto md:ml-3 lg:px-4"
            >
              <div className="min-w-[450px] overflow-x-auto">
                {selectedTreatMent?.treatment?.name ? (
                  <p>
                    Selected treatment
                    <span className="ml-2 font-bold">
                      {selectedTreatMent?.treatment?.name}
                    </span>
                  </p>
                ) : (
                  <p>Please select a treatment</p>
                )}
                <ClientScheduleCalender
                  onSelectEvent={(e) => handleAddAppointmentSelect(e)}
                  events={(selectedEmpSchedules || []).flatMap((data) => {
                    if (data.available) {
                      const start_time = new Date(data?.start_time);
                      const end_time = new Date(data?.end_time);
                      const events = [];
                      let currentTime = start_time;
                      while (currentTime < end_time) {
                        const nextTime = new Date(currentTime);
                        nextTime.setHours(currentTime.getHours() + 1);
                        events.push({
                          ...data,
                          start_time: currentTime,
                          end_time: nextTime >= end_time ? end_time : nextTime,
                        });
                        currentTime = nextTime;
                      }
                      return events;
                    }
                    return [data];
                  })}
                  onSelectSlot={handleSelectSlot}
                  onRangeChange={onCalenderRangeChange}
                  eventPropGetter={(event) => {
                    const backgroundColor = ( "available" in event && event.available ) ? "#22d3ee" :"#000";                      
                    return { style: { backgroundColor } };
                  }}
                />
              </div>
              <div className="flex  flex-col pt-4 items-center justify-center">
                <p>
                  Select a treatment from the list on the left to view available
                  appointment times
                </p>
                <img
                  alt="Please select the treatment"
                  className="md:max-w-xl"
                  src="/empty-state-booking.png"
                />
              </div>
            </div>
          </ClientAsideLayout>
        ) : (
          <ClientAsideLayout
            asideContent={
              <ul className="w-[250px] text-center text-sm rounded-lg border m-0 p-0">
                {(locationAndEmployee || []).map((locEmp) => (
                  <li
                    key={locEmp?.id}
                    className={`border-b hover:bg-gray-200 ${locId === String(locEmp?.id) ? "bg-gray-200 " : ""
                      } transition-all`}
                  >
                    <Link
                      to={`/clients/location?locations=${locEmp?.name}&locId=${locEmp?.id}`}
                      className="p-3 no-underline block text-black/80"
                    >
                      {locEmp?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            }
          >
            <div className="flex mt-5 ml-2 flex-col flex-1">
              <h3 className="font-normal border-b pb-4">
                Welcome to our online booking site
              </h3>
              <h3 className="font-normal">Medical</h3>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className=""></div>
                <div className="">
                  <p className="mb-2">Book by Practitioner</p>
                  {(employees || []).map((emp) => (
                    <EmployeeProfileCard
                      key={emp?.id}
                      path={`/clients/location?empId=${emp?.id}&&locId=${locId}`}
                      name={emp?.name}
                      image={emp?.image}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ClientAsideLayout>
        )}
      </div>

      <ModalWraper
        show={appointmentModal.show}
        onHide={() => setAppointmentModal(initialAppointmentModal)}
        title={
          appointmentModal?.isEdit
            ? // ? `Click on "Add new" to create new appointment on same time`
            "New  Appointment"
            : `Your appointment`
        }
        footer={
          <div className="space-x-2">
            {authUserState.client ? (
              <Button type="submit" form="appointmentForm">
                Confirm
              </Button>
            ) : (
              <Link
                className="no-underline btn-primary"
                to={`/clients/signin${window.location.search}`}
              >
                Please sign in to book an appointment
              </Link>
            )}
          </div>
        }
      >

        <form
          id="appointmentForm"
          onSubmit={addAppointMentSubmit}
          className="text-lg flex flex-col gap-y-2"
        >
          <div className="flex flex-col gap-2">
            <span>Treatment</span>
            <span>
              {selectedTreatMent?.treatment?.name} -{" "}
              {selectedTreatMent?.treatment?.duration || 30}min
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span>Time</span>
            {!appointmentModal?.isEdit ? (
              <span>
                {moment(appointmentModal.start_time).format("hh:mm A")} -{" "}
                {moment(appointmentModal.end_time).format("hh:mm A")}
              </span>
            ) : (
              (filteredTimeSlots.length !==0)?
              filteredTimeSlots.filter(
                  (slot) =>
                    !selectedEmpSchedules.some(
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
                      onChange={(selectedOption) => {
                        let tempData = appointmentModal;
                        tempData.selectedTimeSlot = slot;
                        localStorage.setItem(
                          "appointmentData",
                          JSON.stringify(tempData)
                        );

                        setAppointmentModal((pre) => ({
                          ...pre,
                          selectedTimeSlot: slot,
                        }));
                      }}
                    />
                  );
                }):<p>Slot is Not available for this Treatment</p>
            )}
          </div>
        </form>
      </ModalWraper>
    </ClientLayout>
  );
};

export default ClientLocation;
