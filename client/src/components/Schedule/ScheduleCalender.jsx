import React, { useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import ScheduleToolbar from "./ScheduleToolbar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { memo } from "react";
import { useEffect } from "react";
import './calendar.css'
const localizer = momentLocalizer(moment);

const ScheduleCalender = ({ ...rest }) => {
  const [timeSlots, setTimeSlots] = useState(1);
  const today = new Date();
  useEffect(() => {
  }, [])
  return (
    <Calendar
      className="sm:max-h-[90%]"
      views={[Views.MONTH, Views.WEEK, Views.DAY]}
      selectable
      startAccessor="start_time"
      endAccessor="end_time"
      titleAccessor="treatment"
      tooltipAccessor={"treatment"}
      localizer={localizer}
      defaultDate={new Date()}
      defaultView="week"
      timeslots={timeSlots}
      min={
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          7
        )
      }

      max={
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          19
        )
      }

      step={60} //Number of time slots per hour
      components={{
        toolbar: (e) => <ScheduleToolbar {...e} />,
      }}
      {...rest}
    />
  );
};

export default memo(ScheduleCalender);
