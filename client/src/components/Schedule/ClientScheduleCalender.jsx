import React, {useEffect, useState} from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { memo } from "react";
import './calendar.css'
import ClientScheduleToolbar from "./ClientScheduleToolbar";

const localizer = momentLocalizer(moment);

const ClientScheduleCalender = ({ ...rest }) => {
  const [timeSlots, setTimeSlots] = useState(1);
  const today = new Date();
  // useEffect(()=>{
  //   console.log(rest);
  // },[rest])
  // useEffect(()=>{
  //   let timeSlotsPerHour = 60 / rest.slotDuration;
  //   setTimeSlots(timeSlotsPerHour)
  // },[])
  return (
    <div className="client max-w-full overscroll-auto">
      <Calendar
        views={[Views.WEEK, Views.DAY]}
        selectable
        startAccessor="start_time"
        endAccessor="end_time"
        titleAccessor="treatment"
        tooltipAccessor={"treatment"}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="week"
        timeslots={timeSlots}
        step={60} //Number of time slots per hour
        min={
          new Date(
            today.getFullYear(), 
            today.getMonth(), 
            today.getDate(), 
            0
          )
        }
     
        components={{
          toolbar: (e) => <ClientScheduleToolbar {...e} />,
        }}
        {...rest}
      />
    </div>
  );
};

export default memo(ClientScheduleCalender);
