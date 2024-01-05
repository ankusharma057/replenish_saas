import React from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import ScheduleToolbar from "./ScheduleToolbar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";
import { memo } from "react";

const localizer = momentLocalizer(moment);

const ScheduleCalender = ({ ...rest }) => {
  return (
    <Calendar
      views={[Views.MONTH, Views.WEEK, Views.DAY]}
      selectable
      startAccessor="start_time"
      endAccessor="end_time"
      titleAccessor="treatment"
      tooltipAccessor={"treatment"}
      localizer={localizer}
      defaultDate={new Date()}
      defaultView="week"
      timeslots={6}
      step={10} //Number of time slots per hour
      components={{
        toolbar: (e) => <ScheduleToolbar {...e} />,
      }}
      {...rest}
      //   onSelectEvent={(event) => {
      //     handleAddAppointmentSelect(event, true);
      //   }}
      //   onSelectSlot={handleAddAppointmentSelect}
      //   onRangeChange={onCalenderRangeChange}
    />
  );
};

export default memo(ScheduleCalender);
