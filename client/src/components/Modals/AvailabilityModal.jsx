import ModalWraper from "./ModalWraper";
import { Button, Form } from "react-bootstrap";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { getLocationEmployee, getLocations, postAvailability, getEmployeeLocations, getLocationsOnly, getEmployeeLocationsOnly, getLocationEmployeeOnly } from "../../Server";
import { useAuthContext } from "../../context/AuthUserContext";
import Select from "react-select";
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';

const availability = [
  { label: "Available", value: true },
  { label: "Unavailable", value: false },
];

const AvailabilityModal = (props) => {
  const { authUserState } = useAuthContext();

  const {
    availabilityModal,
    closeModal,
    handleSubmit,
    setSelectedAvailability,
    setChanges
  } = props;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const initialAvailabilityTimings = () => {
    return daysOfWeek.map((day) => { return { day: day.toLowerCase(), timings: [] } } )
  }

  const [serviceLocation, setServiceLocation] = useState([]);
  const [employeeList, setEmployeeList] = useState();
  const [selectedStaff, setSelectedStaff] = useState();
  const [availabilityTimings, setAvailabilityTimings] = useState(initialAvailabilityTimings)

  const [scheduleData, setScheduleData] = useState({update_all_my_locations: false});

  const onLocationChange = async (selectedOption) => {
    setChanges(true)

    if (authUserState?.user) {
      const { data } = await getLocationEmployeeOnly(selectedOption?.id);
      if (data?.length > 0) {
        if (authUserState?.user?.is_admin) {
          setEmployeeList(data);  
        }else{
          setEmployeeList(data.filter((emp) => emp.id === authUserState?.user?.id));
        }
        
        setScheduleData({ ...scheduleData, location_id: selectedOption.id })
      }
    } else {
      const data = [...authUserState?.user]

      if (data?.length > 0) {
        setEmployeeList(data);
        setScheduleData({ ...scheduleData, location_id: selectedOption.id })
      }
    }
  };
  useEffect(() => {
    setServiceLocation(
      props?.serviceLocation.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
    );
  }, [props]);

  const handleInputChange = (e, att) => {
    setChanges(true)
    availabilityModal[att] = moment(e).toDate();
    setScheduleData({ ...scheduleData, [att]: moment(e).format('DD-MM-YYYY') })
  };



  const handleDone = async (e) => {
    e.preventDefault();
    if (
      !scheduleData.end_date ||
      !scheduleData.start_date ||
      new Date(scheduleData.start_date).valueOf() >
      new Date(scheduleData.end_date).valueOf()
    ) {
      toast.error("Please select valid time interval.");
      return;
    }

    if (!checkTimingsValidity(availabilityTimings)) {
      toast.error("Please check shift timings and select valid time interval.");
      return;
    }

    const hasTiming = availabilityTimings.some(day => day.timings.length > 0)

    if(!hasTiming){
      toast.error("Please correct Time Intervel");
      return;
    }



    const hasCorrectTiming = availabilityTimings.filter(day => day.timings.length > 0);

    const validTiming = hasCorrectTiming.every(data =>
      data.timings.every(datas =>
        "start_time" in datas && datas.start_time !== null &&
        "end_time" in datas && datas.end_time !== null
      )
    );

    if(!validTiming){
      toast.error("Please Choose correct Time Intervel");
      return;
    }



    if(!("employee_id" in scheduleData)){
      toast.error("Please Choose Employee");
      return;
    }

    const res = await postAvailability({ availability: { ...scheduleData, availability_timings: [...availabilityTimings] } })
    if (res.status === 201 || res.status === 200) {
      toast.success("Changes Applied Successfully");
      setAvailabilityTimings(initialAvailabilityTimings);
      setEmployeeList([]);
      // closeModal()
    }
    handleSubmit();
  };
  let yesterday = moment().subtract(1, "day");
  function valid(current) {
    return current.isAfter(yesterday);
  }
  const isValidEndDate = (currentDate) => {
    return currentDate.isSameOrAfter(moment(scheduleData.start_date, 'DD-MM-YYYY'), 'day');
  };
  function checkTimingsValidity(schedule) {
    for (let i = 0; i < schedule.length; i++) {
      const day = schedule[i];
      for (let j = 0; j < day.timings.length; j++) {
        const timing = day.timings[j];
        const startTime = new Date(`January 1, 2024 ${timing.start_time}`);
        const endTime = new Date(`January 1, 2024 ${timing.end_time}`);

        // Compare start_time and end_time
        if (startTime >= endTime) {
          return false; // Invalid timing found
        }
      }
    }

    return true; // All timings are valid
  }

  const closeModalWithResetForm = () => {
    closeModal();
    setScheduleData({ ...scheduleData, update_all_my_locations: false })
    setEmployeeList([])
  }

  return (
    <ModalWraper
      show={availabilityModal.show}
      title={'Manage Shifts'}
      onHide={closeModalWithResetForm}
      size={'xl'}
      customClose={true}
      footer={
        <div className="space-x-2">
          <Button onClick={()=>{closeModal();setScheduleData({ ...scheduleData, update_all_my_locations: false }); setEmployeeList([])}} className="bg-white text-black border-black hover:bg-slate-400">
            Cancel
          </Button>
          <Button type="submit" form="appointmentForm">
            Apply Shift Schedule
          </Button>
        </div>
      }
    >
      <form
        id="appointmentForm"
        onSubmit={handleDone}
        className="text-lg flex flex-col gap-y-2"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 pl-2 pr-5 border-r-[1px] ">
            {daysOfWeek.map((day, index) => {
              return (
                <DayShift key={index} day={day} availabilityTimings={availabilityTimings} setChanges={setChanges} setAvailabilityTimings={setAvailabilityTimings} />
              )
            })}
          </div>
          <div className="flex flex-col gap-2">
            <div>Apply this shift schedule to the following dates:</div>
            <div className="flex gap-2 items-center">
              <div className="flex flex-col w-full gap-2">
                {/* <span>From</span> */}
                <Datetime
                  closeOnSelect={true}
                  timeFormat={false}
                  isValidDate={valid}
                  value={availabilityModal.start_time}
                  inputProps={{ placeholder: 'Start Date' }}
                  onChange={(event) => handleInputChange(event, "start_date")}
                />
              </div>
              <div>to</div>
              <div className="flex flex-col w-full gap-2">
                {/* <span>To</span> */}
                <Datetime
                  closeOnSelect={true}
                  timeFormat={false}
                  isValidDate={isValidEndDate}
                  value={availabilityModal.end_time}
                  inputProps={{ placeholder: 'End Date' }}
                  onChange={(event) => handleInputChange(event, "end_date")}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div>All the following locations:</div>
              {serviceLocation?.length > 0 && (
                <div className="flex flex-col gap-y-2 sm:flex-row items-center gap-x-2">
                  <Select
                    className="w-full z-10"
                    options={serviceLocation}
                    placeholder="Select Location"
                    onChange={onLocationChange}
                  />
                </div>
              )}
              <div className="flex gap-4 m-1 items-center">
                <div>Apply For all locations?</div>
                <input
                  checked={scheduleData.update_all_my_locations }
                  name="apply_for_all_locations"
                  type="checkbox"
                  onChange={(e) => {setChanges(true); setScheduleData({ ...scheduleData, update_all_my_locations: e.target.checked })}}
                  className="w-4 h-4 text-blue-500 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </div>
              <div>
                <div>For the following staff:</div>
                <div className="flex flex-col gap-2 py-2">
                  {employeeList && employeeList.map((val, index) => {
                    return (
                      <div key={index} className="flex gap-2">
                        <input type="radio" name={val.name} checked={selectedStaff && selectedStaff.id === val.id} onChange={() => { setSelectedStaff(val); setChanges(true); setScheduleData({ ...scheduleData, employee_id: val.id }) }} id={val.id} />
                        <label htmlFor={val.id}>{val.name}</label>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* <Form.Check
              type="checkbox"
              label="For Every Week"
              id="ForEveryWeek"
              onChange={(e) => (availabilityModal.every_week = e.target.checked)}
            /> */}
          </div>
        </div>
      </form>
    </ModalWraper>
  );
};

export default AvailabilityModal;

const DayShift = ({ day, availabilityTimings,setChanges, setAvailabilityTimings }) => {
  const [timings, setTimings] = useState([])
  const handleAddTimes = () => {
    setTimings([...timings, { start_time: null, end_time: null }])
    setChanges(true)
  }
  const handleRemoveTimes = (index) => {
    const newTimeArray = [...timings]
    newTimeArray.splice(index, 1);
    setTimings([...newTimeArray])
    setChanges(true)
  }
  const handleInputChange = (e, att, index) => {
    const date = new Date(e.$d);

    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    };

    const timeString = date.toLocaleString('en-US', options);

    setChanges(true)
    const updatedTime = [...timings]
    updatedTime[index] = { ...updatedTime[index], [att]: timeString }
    setTimings([...updatedTime])

  };
  useEffect(() => {
    const newValues = [...availabilityTimings]
    const dayIndex = newValues.findIndex(entry => entry.day.toLowerCase() === day.toLowerCase());
    const isPresent = dayIndex !== -1;
    if (isPresent) {
      newValues[dayIndex] = { day: day.toLowerCase(), timings: timings }
      setAvailabilityTimings([...newValues])
    } else {
      setAvailabilityTimings([...availabilityTimings, { day: day.toLowerCase(), timings: timings }])
    }
  }, [timings])
  return (
    <div className="flex flex-col gap-2 last:border-b-[0px] py-2 border-b-[1px]">
      <div className="flex items-center justify-between font-medium">
        <div>{day}</div>
      </div>
      <div>
        <div className="flex flex-col gap-2">
          {timings.map((val, index) => {
            return (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex flex-col gap-2">
                  {/* <Datetime
                    dateFormat={false}
                    timeConstraints={{ hours: { min: 5 } }}
                    inputProps={{ placeholder: 'Start Time' }}
                    onChange={(event) => handleInputChange(event, "start_time", index)}
                  /> */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopTimePicker views={['hours', 'minutes']} onChange={(event) => handleInputChange(event, "start_time", index)}  />                       
                      </LocalizationProvider>
                </div>
                <div>to</div>
                <div className="flex flex-col gap-2">
                  {/* <Datetime
                    dateFormat={false}
                    timeConstraints={{ hours: { min: 5 } }}
                    inputProps={{ placeholder: 'End Time' }}
                    onChange={(event) => handleInputChange(event, "end_time", index)}
                  /> */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DesktopTimePicker views={['hours', 'minutes']} onChange={(event) => handleInputChange(event, "end_time", index)}  />
                      </LocalizationProvider>
                </div>
                <div onClick={() => handleRemoveTimes(index)} className="text-cyan-400 hover:cursor-pointer"><RxCross2 className="w-6 h-6" /></div>
              </div>
            )
          })}
        </div>
      </div>
      <div onClick={handleAddTimes} className="text-cyan-500 font-medium hover:cursor-pointer">Add Times</div>
    </div>
  )
}