import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import React, { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { RxCross2 } from "react-icons/rx";
import AsideLayout from "../components/Layouts/AsideLayout";
import {
  createLocation,
  createSchedule,
  deleteAppointmentEmployee,
  deleteAvailability,
  fetchAvailability,
  getAvailability,
  getClients,
  getLocationsWithoutEmployee,
  getEmployeesList,
  getEmployeesListOnly,
  getLocationEmployee,
  getLocationEmployeeOnly,
  getLocations,
  getSchedule,
  getScheduleOnly,
  getTreatmentList,
  markAvailability,
  remainingBalancePaidToEmployee,
  updateAvailability,
  getEmployeeLocations,
  deleteEmployeeAvailability,
  updateVendore,
  getLocationsOnly,
  getEmployeeLocationsOnly,
  getLocationsWithoutEmployeeOnly,
  getClientsOnly,
  getTreatmentListOnly
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
import { confirmAlert } from "react-confirm-alert";

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
  update_all_my_locations: false
};

const initialAddLocationModal = {
  show: false,
  location: "",
  employees: [],
  isLoading: false,
};

const initialManageLocationModal = {
  show: false,
  location: null,
  employees: [],
  isLoading: false,
};

function Schedule() {
  const { authUserState } = useAuthContext();
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [allEmployeeList, setAllEmployeeList] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [serviceLocation, setServiceLocation] = useState([]);
  const [employeeLocations, setEmployeeLocations] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState([]);
const [availableTime,setAvailableTime]=useState(0);
const [totalTreatmentDuration,setTotalTreatmentDuration]=useState(0);
  const [addLocationModal, setAddLocationModal] = useState(
    initialAddLocationModal
  );

  const [manageLocationModal, setManageLocationModal] = useState(
    initialManageLocationModal
  )

  const [updateEmployeeInput, setUpdateEmployeeInput] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState();

  const [availabilityModal, setAvailabilityModal] = useState({
    ...initialAvailabilityModal,
  });

  const [changes, setChanges] = useState(false)
  useEffect(()=>{setChanges(false)},[availabilityModal?.show,addLocationModal?.show,appointmentModal?.show])

  const [selectedAvailability, setSelectedAvailability] = useState();
  const [selectedEmployeeLocations, setSelectedEmployeeLocations] = useState();

  const [employeeScheduleEventsData, setEmployeeScheduleEventsData] = useState(
    {}
  );

  const [clientNameOptions, setClientNameOptions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState();

  const [calenderCurrentRange, setCalenderCurrentRange] = useState({
    start_date: "",
    end_date: "",
  });
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [disableCreateAppointment,setDisableCreateAppointment]=useState(false)
  const [startEndTime,setStartEndTime]=useState({start:"",end:""})
  const getEmployees = async (refetch = true,remove = false ) => {
    try {
      let data = [];
      if (authUserState?.user?.is_admin) {
        const response = await getLocationEmployeeOnly(selectedLocation?.id || null, refetch);
        data = response?.data || [];
      } else {
        data = [authUserState?.user];
      }

      if (data) {
        const a = data?.map((emp) => ({
          ...emp,
          label: emp?.name,
          value: emp?.id,
        }));
        setEmployeeList(data);
        setAllEmployeeList(a);
        if(remove){
          const check = data.find((datas)=>(datas?.id === selectedEmployeeData?.id))
          if(check){
            handleSelectEmployee(data[0]);
          }else{
            handleSelectEmployee(data[0])
          }
        }else{
          if(!selectedEmployeeData){
            handleSelectEmployee(data[0])
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllEmployees = async (refetch = true) => {
    try {
      const { data } = await getEmployeesListOnly(refetch);

      if (data?.length > 0) {
        const a = data?.map((emp) => ({
          ...emp,
          label: emp?.name,
          value: emp?.id,
        }));
        setEmployeesData(a);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await updateVendore(
        (Array.isArray(currentEmployee) && currentEmployee[0]?.id),
        updateEmployeeInput
      );
      setTimeout(() => {
        getEmployees();
      }, 500);
      toast.success("Employee has been updated successfully.");
      setSelectedEmployeeData(selectedEmployeeData);
      handleSelectEmployee(data);
      setManageLocationModal((pre) => ({...pre, show: false}))
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
          error.message ||
          "Failed to update Employee"
      );
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeSchedule = async (emp, refetch = true) => {
    try {
      const { data } = await getScheduleOnly(
        {
          employee_id: emp.id,
          start_date: emp.start_date,
          end_date: emp.end_date,
          location_id: emp?.location_id || selectedLocation?.id
        },
        refetch
      );


      const newData = data.map((d) => ({
        ...d,
        schedule: d,
        start_time: new Date(d.start_time),
        end_time: new Date(d.end_time),
        treatment: d?.treatment?.name || "",
        treatment_id: d?.treatment?.id || "",
        treatmentObj: d?.treatment,
      }));

      const currentDate = new Date();

      // Set the date to the 1st day of the current month
      currentDate.setDate(1);

      // Format the date to YYYY-MM-DD format (if needed)
      const firstDayOfMonth = currentDate.toISOString().slice(0, 10);
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const availabilityPayload = {
        employee_id: emp.id,
        from_date: formatDate(emp.start_date),
        to_date: formatDate(emp.end_date),
        location_id: emp?.location_id || selectedLocation?.id
      };
      const resp = await fetchAvailability(availabilityPayload, refetch);
      console.log("@@@@@resp",resp);
      
      function convertToDate(dateString, timeString) {
        // Combine date and time strings
        const combinedDateTimeString = `${dateString} ${timeString}`;

        // Create a Date object from combined string
        const dateObj = new Date(combinedDateTimeString);

        return dateObj;
      }
      const availabilityData = resp.data.filter(item => item.availability_timings.length > 0).map((d) => {
        if (d.availability_timings.length > 0) {
          const availabilitiesData = (d.availability_timings.map((t) => {
            return ({
              start_time: convertToDate(d.availability_date, t.start_time),
              end_time: convertToDate(d.availability_date, t.end_time),
              available: true,
              id: t.id,
              // every_week: t.every_week,
            })
          }))
          return { ...availabilitiesData }
        }
        return {}
      });
      console.log("@@@@@availabilityData",availabilityData);
      
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
      const transformedData = availabilityData.flatMap(item => Object.values(item));
      const arr = newData.concat(transformedData);
      const arr1 = arr.concat(unavailabilityNewData);
      console.log("@@@@@@@arr1",arr1);
      
      setEmployeeScheduleEventsData((pre) => {
        return {
          ...pre,
          [emp.id]: arr1,
        };
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getClientName = async (employee_id, refetch = false) => {
    try {
      const { data } = await getClientsOnly(employee_id, refetch);

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
    const { data } = authUserState.user.is_admin ? await getLocationsOnly(refetch) : await getEmployeeLocationsOnly(authUserState?.user?.id);

    if (data?.length > 0) {
      setSelectedLocation(previousState => {
        return { ...previousState, ...data[0] }
      });

      setServiceLocation(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };
  useEffect(() => {
    if (authUserState.user.is_admin) {
      getAllLocation();
    } else {
      getAllLocation();
      handleSelectEmployee(authUserState.user);
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedLocation?.id) {
      getEmployees();
    }
  }, [selectedLocation]);

  const getAllEmployeeLocation = async (employeeId, refetch = false) => {
    const { data } = await getLocationsWithoutEmployeeOnly(employeeId, refetch);

    if (data) {
      setEmployeeLocations(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };

  useEffect(() => {
    if (selectedEmployeeData?.id) {
      setCurrentEmployee([selectedEmployeeData]);
    }
  }, [selectedEmployeeData]);

  useEffect(() => {
    if (currentEmployee) {
      getAllEmployeeLocation((Array.isArray(currentEmployee) && currentEmployee[0]?.id));
    }
  }, [currentEmployee]);

  const handleSelectEmployee = async (emp) => {
    if (emp) {
      getClientName(emp.id);
      const { data } = await getTreatmentListOnly(false, emp.id);
      const treatmentOption = (data || []).map((inv) => {
        return {
          label: inv.name,
          value: inv?.id,
          product_id:inv?.product?.id,
          product_type: inv.product.product_type,
          quantity: inv.quantity,
          duration: inv.duration,
        };
      });
      setSelectedEmployeeData({ ...emp, treatmentOption });
      getAllLocationsByEmployee(emp.id)
    }
  };

  const getAllLocationsByEmployee = async (id) =>{
    const {data} = await getEmployeeLocationsOnly(id)
    const locationOption = (data || []).map((inv) => {
      return {
        label: inv.name,
        value: inv.id,
      };
    });
    setSelectedEmployeeLocations(locationOption);
  }

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

  // delete schedule api
  const deleteSchedule = async (id, refetch = true) => {
    try {
      await deleteEmployeeAvailability(id, refetch);
      getEmployeeSchedule({
        id: selectedEmployeeData.id,
        start_date: calenderCurrentRange.start_date,
        end_date: calenderCurrentRange.end_date,
        location_id: selectedLocation?.id
      });
      toast.success("Availability Deleted Successfully");
    } catch (error) {
      toast.error("Something went wrong");
      console.log("error", error.error);
      
    }
  }

  function isAppointmentWithinAvailability(availabilityStart, availabilityEnd, appointments) {
    const availabilityStartDate = new Date(availabilityStart);
    const availabilityEndDate = new Date(availabilityEnd);
    const removedValues = Array.isArray(appointments) && appointments.shift()

    return appointments.some(appointment => {
        if (!appointment.start_time) return false;
        const appointmentStartDate = new Date(appointment.start_time);
        return appointmentStartDate >= availabilityStartDate && appointmentStartDate <= availabilityEndDate;
    });
}

  const showConfirmationModal = (event, readOnly, events) => {
    if(event?.client){
      handleAddAppointmentSelect(event, readOnly);
    }
    else{
      confirmAlert({
        title: "Confirm to do this action",
        message: "Are you sure to do this.",
        buttons: [
          {
            label: `${ !event?.client ? "Create Appointment" : 'Show Appointment' }`,
            className: "btn btn-primary create-btn text-[16px] font-semibold px-3 py-2",
            onClick: () => {
              handleAddAppointmentSelect(event, readOnly);
            },
          },
          {
            label: "Remove Availability",
            className: "btn btn-primary del-btn",
            onClick: () => {
              setShowConfirm(false);
              deleteSchedule(event.id);
            },
          },
        ],
      })
    }
  };

  const handleAddAppointmentSelect = async({ start_time, end_time, ...rest }, readOnly) => {
    let startTime= new Date(start_time)
    let endTime= new Date(end_time)
    const differenceInMilliseconds =await endTime - startTime;
    const differenceInMinutes =await differenceInMilliseconds / 60000;
    setAvailableTime(differenceInMinutes)
    let formateData = {
      show: true,
      start_time: start_time,
      end_time: end_time,
      date: moment(start_time).format("DD/MM/YYYY"),
    };

    if (readOnly) {
      formateData = {
        ...formateData,
        ...rest,
        readOnly: true,
      };
    }
    if (!rest.hasOwnProperty("available")) {
      setRemoveAvailabilityData(formateData);
      setAppointmentModal(formateData);
      // setRemoveAvailabilityModal(true);
    }
    // formateData.timeSlots =
    // moment(formateData?.timeSlots[1]?.start).format("hh:mm A") === "08:00 PM"
    //   ? formateData.timeSlots.slice(0, 1)
    //   : formateData.timeSlots;

    if (rest.hasOwnProperty("available")) {
      formateData = {
        ...formateData,
        ...rest,
        readOnly: false,
        location_id :selectedLocation?.id || 1
      };
      setRemoveAvailabilityData(formateData);
      // setRemoveAvailabilityModal(false);
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
      location_id: selectedLocation?.id
    });
    setRemoveAvailabilityModal(false);
    toast.success("Availability removed successfully.");
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentModal?.client_name) {
      toast.error("Please select a client");
      return;
    } else if (!appointmentModal?.treatments) {
      toast.error("Please select a treatment");
      return;
    } else if (!appointmentModal?.selectedTimeSlot) {
      toast.error("Please select a timeslot");
      return;
    }
    let treatmentIds=appointmentModal.treatments.map(treatment => treatment.treatment_id);
    let productIds=appointmentModal.treatments.map(treatment => treatment.product_id);
    
    const copyAppointMent = {
      ...appointmentModal,
      employee_id: selectedEmployeeData.id,
      start_time: appointmentModal.selectedTimeSlot.start,
      end_time: appointmentModal.selectedTimeSlot.end,
      treatment_ids:treatmentIds,
      product_id:productIds
    };

    delete copyAppointMent.show;
    delete copyAppointMent.timeSlots;
    delete copyAppointMent.selectedTimeSlot; 
    function convertToDateTimeRange(dateStr, timeRangeStr) {
      const [day, month, year] = dateStr.split("/").map(Number);
      const [startTime, endTime] = timeRangeStr.split(" - ").map(time => time.trim());

      // Function to convert a single time string (like "01:00 PM") to a Date object
      function convertSingleTime(time) {
        let [hours, minutes] = time.slice(0, -2).split(":").map(Number);
        const isPM = time.slice(-2).toLowerCase() === "pm";

        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;

        return new Date(year, month - 1, day, hours, minutes);
      }
      const startDateTime = convertSingleTime(startTime);
      const endDateTime = convertSingleTime(endTime);
      return {
        start: startDateTime.toString(),
        end: endDateTime.toString()
      };
    }
    let { start, end } = await convertToDateTimeRange(appointmentModal?.date, appointmentModal?.selectedTimeSlot)
    let payload={
      "schedule": {
        "product_type": "treatment_for_client",
        "start_time": start,
        "end_time": end,
        "date": appointmentModal.date,
        "employee_id": selectedEmployeeData.id,
        "product_ids": productIds,
        "location_id": appointmentModal.location_id,
        "client_id": appointmentModal.client_id,
        "treatment_ids": treatmentIds
      }
    }
    console.log("@@@@@@@payload",payload);
    const { data } = await createSchedule(payload);
    let newCopyAppointMent = {
      ...copyAppointMent,
      id: data?.id,
      total_amount: data?.total_amount,
      paid_amount: data?.paid_amount,
      remaining_amount: data?.remaining_amount,
    };

    getEmployeeSchedule({
      id: selectedEmployeeData.id,
      start_date: calenderCurrentRange.start_date,
      end_date: calenderCurrentRange.end_date,
      location_id: selectedLocation?.id
    });
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
    setStartEndTime("")
  };

  // const onCalenderRangeChange = (date) => {
  //   let formattedStartDate;
  //   let formattedEndDate;
  //   if (date?.start && date.end) {
  //     formattedStartDate = moment(date.start).format("MM/DD/YYYY");
  //     formattedEndDate = moment(date.end).format("MM/DD/YYYY");
  //   } else if (date.length > 0) {
  //     formattedStartDate = moment(date[0]).format("MM/DD/YYYY");
  //     formattedEndDate = moment(date[date.length - 1]).format("MM/DD/YYYY");
  //   }

  //   setCalenderCurrentRange({
  //     start_date: formattedStartDate,
  //     end_date: formattedEndDate,
  //   });
    
  //   getEmployeeSchedule({
  //     id: selectedEmployeeData.id,
  //     start_date: formattedStartDate,
  //     end_date: formattedEndDate,
  //     location_id: selectedLocation?.id
  //   });
  // };
  const onCalenderRangeChange = (date) => {
    let formattedStartDate = "";
    let formattedEndDate = "";
  
    if (date?.start && date.end) {
      // Format for single range (e.g., month or week)
      formattedStartDate = moment(date.start).format("MM/DD/YYYY");
      formattedEndDate = moment(date.end).format("MM/DD/YYYY");
    } else if (Array.isArray(date) && date.length > 0) {
      formattedStartDate = moment(date[0]).format("MM/DD/YYYY");
      formattedEndDate = moment(date[date.length - 1]).format("MM/DD/YYYY");
    }
  
    setCalenderCurrentRange({
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    });
  
    if (selectedEmployeeData?.id && selectedLocation?.id) {
      getEmployeeSchedule({
        id: selectedEmployeeData.id,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        location_id: selectedLocation.id,
      });
    }
  };

  const onLocationChange = async (selectedOption) => {
    setSelectedLocation(previousState => {
      return { ...previousState, ...selectedOption }
    });

    if (authUserState.user.is_admin) {
      const { data } = await getLocationEmployeeOnly(selectedOption?.id);
      if (data?.length > 0) {
        setEmployeeList(data);
        setAppointmentModal((pre) => ({
          ...pre,
          location_id: selectedOption?.id,
        }))
        handleSelectEmployee(data[0]);
        setSelectedEmployeeData(null);
      }
    } else {
      getEmployeeSchedule({
        id: authUserState?.user?.id,
        start_date: calenderCurrentRange.start_date,
        end_date: calenderCurrentRange.end_date,
        location_id: selectedOption?.id
      });
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
        getAllLocation(true);
        setSelectedEmployeeData(null);
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
      getEmployeeSchedule(
        {
          id: selectedEmployeeData.id,
          start_date: calenderCurrentRange.start_date,
          end_date: calenderCurrentRange.end_date,
          location_id: selectedLocation?.id
        },
        true
      );
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

  const removeLocation = async (locationDetails) => {
    confirmAlert({
      title: "Remove Location",
      message: `Are you sure, you want to remove ${String(
        locationDetails.location.name
      )} from your list`,
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              setLoading(true);
              const deleteLocationDetails = {
                employee_locations_attributes: [
                  { id: locationDetails.id, _destroy: 1 },
                ],
              };
              const { data } = await updateVendore(
                selectedEmployeeData.id,
                deleteLocationDetails
              );
              toast.success("Location removed successfully.");
              handleSelectEmployee(data);
            } catch (error) {
              toast.error(
                error?.response?.data?.exception ||
                  error?.response?.statusText ||
                  error.message ||
                  "Failed to update Employee"
              );
            } finally {
              setLoading(false);
            }
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const filteredTimeSlots = appointmentModal?.timeSlots?.filter((slot) => {    
    const isWithinAvailableTime = employeeScheduleEventsData[selectedEmployeeData?.id]?.some(
      (schedule) => schedule.available &&
        moment(slot.start).isSameOrAfter(schedule.start_time) &&
        moment(slot.end).isSameOrBefore(schedule.end_time)
    );

    const overlapWithBooking = employeeScheduleEventsData[selectedEmployeeData?.id]?.some(
      (schedule) => !schedule.available &&
        moment(slot.start).isBefore(schedule.end_time) &&
        moment(slot.end).isAfter(schedule.start_time)
    );
    return isWithinAvailableTime && !overlapWithBooking;
  });

  const calculateTime = () => {
    if (Array.isArray(appointmentModal.treatments)) {
      const totalDuration = appointmentModal.treatments.reduce((total, item) => {
        return total + Number(item.duration);
      }, 0);
      const startDate = new Date(appointmentModal.start_time);
      const endDate = new Date(startDate.getTime() + totalDuration * 60000); // Convert minutes to milliseconds
      setStartEndTime({
        start: startDate,
        end: endDate,
      })
      }
    }
  useEffect(() => {
    if (Array.isArray(appointmentModal.treatments)) {
      const totalDuration = appointmentModal.treatments.reduce((total, item) => {
        return total + Number(item.duration);
      }, 0);
      if (availableTime < totalDuration) {
        setDisableCreateAppointment(true)
        toast.warning("Total time duration is more than time availability of doctor")
      } else {
        calculateTime()
        setDisableCreateAppointment(false)
      }
    }
  }, [appointmentModal.treatments]);


  return (
    <>
      <AsideLayout
        hideAsideContent={!authUserState?.user?.is_admin}
        asideContent={
          <>
            <div>
              <SearchInput
                placeholder="Search Staff..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
            </div>
            <div className="border-t-2  py-2 bg-white h-[70vh]">
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
            <div>
            {authUserState.user?.is_admin && (
              <Button
                onClick={() =>
                  {
                    setManageLocationModal((pre) => ({ ...pre, show: true }));
                    getAllEmployees();
                    getAllEmployeeLocation(selectedEmployeeData?.id)
                  }
                }
                variant="info"
                className="btn btn-primary text-white flex w-full"
              >
                Manage Locations
              </Button>
            )}
            </div>
          </>
        }
      >
        <div className="flex-1  py-10 px-2 bg-white h-full">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <h1>{selectedEmployeeData?.name}</h1>
            <div className="flex gap-2 flex-col sm:flex-row w-full md:w-auto">
              {serviceLocation?.length > 0 && (
                <div className="flex flex-col gap-y-2 sm:flex-row items-center gap-x-2">
                  <Select
                    className="w-full md:w-80 sm:w-full z-10"
                    options={serviceLocation}
                    placeholder="Search Places"
                    onChange={onLocationChange}
                    defaultValue={serviceLocation[0]}
                  />
                  
                </div>
              )}
              {authUserState.user?.is_admin && (
                <Button
                  onClick={() =>
                    {setAddLocationModal((pre) => ({ ...pre, show: true }));
                      getAllEmployees();
                    }
                  }
                  variant="info"
                  className="text-white flex w-full sm:w-fit"
                >
                  Add
                </Button>
              )}

              {authUserState.user && (
                <Button
                  onClick={handleAvailabilityButtonClick}
                  variant={"info"}
                  className=" text-white"
                >
                  Manage Shift
                </Button>)}
            </div>
          </div>

          {selectedEmployeeData && (
            // <ScheduleCalender
            // events={(employeeScheduleEventsData[selectedEmployeeData?.id] || []).flatMap((data) => {
            //   if (data.available) {
            //     const start_time = new Date(data?.start_time);
            //     const end_time = new Date(data?.end_time);
            
            //     const events = [];
            //     let currentTime = start_time;
            
            //     while (currentTime < end_time) {
            //       const nextTime = new Date(currentTime);
            //       nextTime.setHours(currentTime.getHours() + 1);
            
            //       events.push({
            //         ...data,
            //         start_time: currentTime,
            //         end_time: nextTime >= end_time ? end_time : nextTime,
            //       });
            
            //       currentTime = nextTime;
            //     }
            
            //     return events;
            //   }
            //   return [data];
            // })}
            //   onSelectEvent={(event) => {
            //     showConfirmationModal(event, true, employeeScheduleEventsData[selectedEmployeeData.id]);
            //   }}
            //   onRangeChange={onCalenderRangeChange}
            //   eventPropGetter={(event) => {
            //     const backgroundColor = ( "available" in event && event.available ) ? "" :"#299db9";
            //     return { style: { backgroundColor } };
            //   }}
            // />
            <ScheduleCalender
              events={(employeeScheduleEventsData[selectedEmployeeData?.id] || []).flatMap((data) => {
                if (data.available) {
                  const currentHour = moment(data.start_time).format("YYYY-MM-DD H")
                  const newItem = employeeScheduleEventsData[selectedEmployeeData?.id]?.filter((item) => (moment(item?.start_time).format("YYYY-MM-DD H") === currentHour && !item?.available))
                  let updateEndTime = null
                  newItem?.map((item) => {
                    if ((new Date(item.end_time) > new Date(updateEndTime)) || !updateEndTime) {
                      updateEndTime = new Date(item.end_time)
                    }
                  });
                  const events = [];
                  if (updateEndTime < new Date(data.end_time) || !updateEndTime) {
                    events.push({
                      ...data,
                      start_time: updateEndTime === null ? new Date(data.start_time) : updateEndTime,
                      end_time: new Date(data.end_time),
                    });
                  }
                  return events;
                }
                let treatmentName = ""
                data?.treatments?.map((item) => {
                  treatmentName += item.name + ", "
                })
                let newData = {
                  ...data,
                  title: treatmentName
                }
                return [newData];
              })}
              onSelectEvent={(event) => {
                showConfirmationModal(event, true, employeeScheduleEventsData[selectedEmployeeData.id]);
              }}
              onRangeChange={onCalenderRangeChange}
              eventPropGetter={(event) => {
                const backgroundColor = ("available" in event && event.available) ? "" : "#299db9";
                return { style: { backgroundColor } };
              }}
            />
          )}
        </div>
      </AsideLayout>

      {/* Availability modal */}
      <AvailabilityModal
        availabilityModal={availabilityModal}
        serviceLocation={serviceLocation}
        setChanges={setChanges}
        closeModal={() => {
          if(changes){
            confirmAlert({
              title: "Confirm to Close",
              message: `Are you sure you want to discard the changes? `,
              buttons: [
                {
                  label: "Yes",
                  onClick:  () => {
                    setAvailabilityModal(initialAvailabilityModal)
                  },
                },
                {
                  label: "No",
                  onClick: () => {
                  },
                },
              ],
            });
          }
          else{
            setAvailabilityModal(initialAvailabilityModal)
          }
          }}
        handleSubmit={handleSubmit}
        setSelectedAvailability={(o) => setSelectedAvailability(o)}
      />

      {/* Add appointment modal */}
      <ModalWraper
        show={appointmentModal.show}
        onHide={() =>{
          if(changes){
            confirmAlert({
              title: "Confirm to Close",
              message: `Are you sure you want to discard the changes? `,
              buttons: [
                {
                  label: "Yes",
                  onClick:  () => {
                    setAppointmentModal(initialAppointmentModal)
                  },
                },
                {
                  label: "No",
                  onClick: () => {
                  },
                },
              ],
            });
          }
          else{
            setAppointmentModal(initialAppointmentModal)}
          }
        }

        title={
          appointmentModal?.readOnly
            ? `Appointment Details`
            : "New Appointment"
        }
        footer={
          <div className="flex gap-2">
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
              <Button type="submit" form="appointmentForm"
              disabled={disableCreateAppointment}
              style={{
                opacity: disableCreateAppointment ? 0.5 : 1,
                backgroundColor:"#22D3EE",
                borderColor:"#22D3EE",
                cursor: disableCreateAppointment ? "not-allowed" : "pointer",
              }}
              >
                Save
              </Button>
            )}
            {!authUserState.user.is_admin && parseInt(appointmentModal?.remaining_amount) > 0 ? (
              <Button
                onClick={() => {
                  setShowConfirmPayment(true);
                  appointmentModal.show = false;
                }}
              >
                Pay Remaining Amount
              </Button>
            ):""}
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
                    {/* <Select
                      inputId="treatment"
                      isClearable
                      isMulti
                      onChange={(selectedOption) => {
                        console.log("@@@@@@@selectedOption",selectedOption);
                        
                        setChanges(true);
                        var timeSlots = getTimeSlots(
                          selectedOption?.duration,
                          appointmentModal.start_time,
                          employeeScheduleEventsData[selectedEmployeeData.id],
                          appointmentModal.end_time,
                          appointmentModal.readOnly
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
                          product_id: selectedOption?.product_id,
                          timeSlots: timeSlots,
                        }));
                      }}
                      options={selectedEmployeeData.treatmentOption}
                      placeholder="Select a Treatment"
                      required
                    /> */}
                    <Select
                      inputId="treatment"
                      isClearable
                      isMulti
                      onChange={(selectedOptions) => {
                        // Set flag to indicate changes
                        setChanges(true);
                        // Loop over selected options to calculate and filter time slots
                        const updatedTimeSlots = selectedOptions.flatMap((selectedOption) => {
                          var timeSlots = getTimeSlots(
                            selectedOption.duration,
                            appointmentModal.start_time,
                            employeeScheduleEventsData[selectedEmployeeData.id],
                            appointmentModal.end_time,
                            appointmentModal.readOnly
                          );

                          // Filter time slots according to the given conditions
                          return timeSlots?.filter((slot) => {
                            let slotTime = moment(slot.start);
                            let slotEndTime = moment(slot.end);
                            return (
                              (slotTime.hour() < 20 || (slotTime.hour() === 20 && slotTime.minute() === 0)) &&
                              (slotEndTime.hour() < 20 || (slotEndTime.hour() === 20 && slotEndTime.minute() === 0))
                            );
                          });
                        });
                          
                        // Update the appointmentModal state
                        setAppointmentModal((pre) => ({
                          ...pre,
                          treatments: selectedOptions.map((option) => ({
                            treatment_id: option.value,
                            treatment: option.label,
                            product_type: option.product_type,
                            product_id: option.product_id,
                            duration: option.duration
                          })),
                          timeSlots: updatedTimeSlots,
                          selectedTimeSlot:""
                        }));
                      }}
                      options={selectedEmployeeData.treatmentOption}
                      placeholder="Select a treatment"
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
                  onChange={(selectedOption) => {
                    setChanges(true); 
                    setAppointmentModal((pre) => ({
                      ...pre,
                      client_name: selectedOption?.label,
                      client_id: selectedOption?.value,
                    }))}
                  }
                  options={clientNameOptions}
                  required
                  placeholder="Select a client"
                />
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {appointmentModal?.readOnly ? (
              <div>
                <span>Location</span>
                <br></br>
                <span>
                  {/* {(clientNameOptions || []).find(
                    (op) => op?.value === appointmentModal?.client_id
                  )?.label || ""} */}
                  {appointmentModal?.location?.name ||
                    appointmentModal?.client_name ||
                    ""}
                </span>
              </div>
            ) : (
              <>
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
              startEndTime?.start ? <Form.Check
                  type="radio"
                  label={`${moment(startEndTime?.start).format("hh:mm A")} - ${moment(startEndTime?.end).format("hh:mm A")}`}
                  checked={appointmentModal.selectedTimeSlot}
                  onChange={(selectedOption) =>
                    setAppointmentModal((pre) => ({
                      ...pre,
                      selectedTimeSlot: `${moment(startEndTime.start).format("hh:mm A")} - ${moment(startEndTime.end).format("hh:mm A")}`,
                    }))
                  }
                />:<p>-</p>
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
                      location_id: selectedLocation?.id
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
        onHide={() => {
          if(changes){
            confirmAlert({
              title: "Confirm to Close",
              message: `Are you sure you want to discard the changes? `,
              buttons: [
                {
                  label: "Yes",
                  onClick:  () => {
                    setAddLocationModal(initialAddLocationModal)
                  },
                },
                {
                  label: "No",
                  onClick: () => {
                  },
                },
              ],
            });
          }
          else{
            setAddLocationModal(initialAddLocationModal)
          }
        }}
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
              setChanges(true)
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
              setChanges(true)
              setAddLocationModal((pre) => ({
                ...pre,
                employees: emp,
              }));
            }}
            options={employeesData}
            placeholder="Select Available Employees"
            required
          />
        </form>
      </ModalWraper>

      {/* Manage Locations */}
      <ModalWraper
        show={manageLocationModal.show}
        onHide={() => {
          getEmployees(true, true);
          if(changes){
            confirmAlert({
              title: "Confirm to Close",
              message: `Are you sure you want to discard the changes? `,
              buttons: [
                {
                  label: "Yes",
                  onClick:  () => {
                    setManageLocationModal(initialManageLocationModal)
                  },
                },
                {
                  label: "No",
                  onClick: () => {
                  },
                },
              ],
            });
          }
          else{
            setManageLocationModal(initialManageLocationModal)
          }
        }}
        title={"Manage Locations"}
      >
      <form onSubmit={updateEmployee}>
        <div className="flex flex-1 relative mt-2">
        <div className="flex flex-1 relative mt-2">
          <Select
            className="flex-fill flex-grow-1"
            inputId="EmployeeId"
            onChange={(selectedOption) => {
              const transformedLocations = Array.isArray(selectedOption) ? selectedOption.map(
                ({ id }) => ({ location_id: id })
              ) : [];
              setUpdateEmployeeInput((pre) => ({
                ...pre,
                employee_locations_attributes: [
                  ...transformedLocations,
                ],
              }));
              setCurrentEmployee([selectedOption]);
              
            }}
            value={Array.isArray(currentEmployee) && currentEmployee.map((emp) => ({label: emp.name, value: emp.id}))}
            options={employeesData}
            required
            placeholder="Select Employee"
          />
        </div>
        </div>
        <div className="flex flex-1 relative mt-2">
          <Select
            className="flex-fill flex-grow-1"
            inputId="product_type"
            isMulti
            onChange={(event) => {
              const transformedLocations = Array.isArray(event) && event.map(
                ({ id }) => ({ location_id: id })
              );
              setUpdateEmployeeInput((pre) => ({
                ...pre,
                employee_locations_attributes: [
                  ...transformedLocations,
                ],
              }));
            }}
            options={employeeLocations}
            required
            placeholder="Select Locations"
          />
        </div>
        <div
          className={`${
            selectedEmployeeData?.employee_locations?.length ===
              0 && "hidden"
          } relative overflow-x-auto shadow-md sm:rounded-lg mt-4`}
        >
          <div className="font-bold p-4">Active Locations:</div>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(currentEmployee) && currentEmployee[0]?.employee_locations.map(
                (val, index) => {
                  return (
                    <React.Fragment key={index}>
                      <EmployeeLocationTableRows
                        removeLocation={removeLocation}
                        val={val}
                      />
                    </React.Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
        {Object.keys(updateEmployeeInput).length > 0 && (
          <div className=" w-full mt-4 flex justify-end">
            <Loadingbutton
              isLoading={loading}
              title="Update"
              loadingText={"Updating Employee..."}
              type="submit"
            />
          </div>
        )}
      </form>
      </ModalWraper>

    </>
  );
}

export default Schedule;

const EmployeeLocationTableRows = ({ val, removeLocation }) => {
  return (
    <tr className="odd:bg-white even:bg-gray-50 border-b ">
      <th
        scope="row"
        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap capitalize "
      >
        {val.location.name}
      </th>
      <td className="px-6 py-4 w-14">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {removeLocation(val);}}
            className="hover:text-red-500 text-cyan-400 flex px-2 transition duration-500 hover:animate-pulse"
          >
            <RxCross2 className="w-6 h-6" />
          </button>
        </div>
      </td>
    </tr>
  );
};
