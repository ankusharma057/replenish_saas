import { toast } from "react-toastify";
import { getDatesInRange } from "../helper";

const getDividedSlots = (duration, start_time, maxTime) => {
  let slots = [];
  const firstSlot = {
    start: start_time,
    end: new Date(start_time.getTime() + duration * 60000),
  };
  slots.push(firstSlot);
  for (
    let index = 0;
    slots[index].end.getTime() <= maxTime.getTime();
    index++
  ) {
    const newSlot = {
      start: slots[index].end,
      end: new Date(slots[index].end.getTime() + duration * 60000),
    };
    if (newSlot.end.getTime() <= maxTime.getTime()) slots.push(newSlot);
    else break;
  }
  return slots;
};

export const getTimeSlots = (duration, start_time, userScheduleEventsData) => {
  let slots = [];
  if (start_time === null || start_time === undefined) return slots;
  const maxTime = new Date(start_time.getTime() + 60 * 60000);
  const durationNotMatched = userScheduleEventsData?.some((eventData) => {
    if (eventData.start_time.getTime() === start_time.getTime()) {
      let durationCheck = eventData.end_time - eventData.start_time;
      durationCheck = Math.round(durationCheck / 60000);
      if (durationCheck === parseInt(duration)) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  });
  if (durationNotMatched) {
    toast.error(
      `No slot available for ${duration} minutes in selected time. Please select some other time .`
    );
    return slots;
  }
  const currentDayBookedSlots =
    userScheduleEventsData?.length > 0
      ? userScheduleEventsData?.filter((eventData) => {
          return (
            eventData.start_time.getDate() === start_time.getDate() &&
            eventData.start_time.getTime() < maxTime.getTime() &&
            eventData.start_time.getTime() > start_time.getTime()
          );
        })
      : [];
  if (currentDayBookedSlots.length > 0) {
    const sortedCurrentDayBookedSlots = currentDayBookedSlots.sort(function (
      a,
      b
    ) {
      return new Date(a.start_time) - new Date(b.start_time);
    });
    const n = sortedCurrentDayBookedSlots.length;
    const firstSlot = {
      start: start_time,
      end: sortedCurrentDayBookedSlots[0].start_time,
    };

    slots.push(firstSlot);
    for (let i = 1; i <= n; i++) {
      if (
        sortedCurrentDayBookedSlots[i - 1].end_time.getTime() <
        maxTime.getTime()
      ) {
        const nextSlot = {
          start: sortedCurrentDayBookedSlots[i - 1].end_time,
          end: sortedCurrentDayBookedSlots[i]?.start_time || maxTime,
        };

        slots.push(nextSlot);
      } else break;
    }
    let fixedSlots = [];
    for (let j = 0; j < slots.length; j++) {
      if (
        Math.round(
          (slots[j].end.getTime() - slots[j].start.getTime()) / 60000
        ) >= duration
      ) {
        const s = getDividedSlots(duration, slots[j].start, slots[j].end);
        fixedSlots.push(...s);
      }
    }
    if (fixedSlots.length <= 0) {
      toast.error(
        `No slot available for ${duration} minutes in selected time. Please select some other time .`
      );
    }
    return fixedSlots;
  } else {
    const res = getDividedSlots(duration, start_time, maxTime);
    return res;
  }
};

export const getUnavailableEverWeekData = (
  everyWeekUnavailabilities,
  start_date,
  end_date,
  cancelUnavailabilities
) => {
  let unavailabilityNewData = [];
  const selectedDateRange = getDatesInRange(start_date, end_date);
  for (let item in everyWeekUnavailabilities) {
    const day = everyWeekUnavailabilities[item].start_time.getDay();
    let unavailableAdditionalEvents = [];
    for (let selectedDate in selectedDateRange) {
      const selectedDay = selectedDateRange[selectedDate].getDay();
      if (selectedDay === day) {
        unavailableAdditionalEvents.push(selectedDateRange[selectedDate]);
      }
    }
    for (let eve in unavailableAdditionalEvents) {
      let start = new Date();
      start.setTime(everyWeekUnavailabilities[item].start_time.getTime());
      start.setMonth(unavailableAdditionalEvents[eve].getMonth());
      start.setDate(unavailableAdditionalEvents[eve].getDate());
      let end = new Date();
      end.setTime(everyWeekUnavailabilities[item].end_time.getTime());
      end.setMonth(unavailableAdditionalEvents[eve].getMonth());
      end.setDate(unavailableAdditionalEvents[eve].getDate());
      unavailabilityNewData.push({
        ...everyWeekUnavailabilities[item],
        start_time: start,
        end_time: end,
      });
    }
  }
  unavailabilityNewData = unavailabilityNewData?.filter((event) => {
    return !cancelUnavailabilities?.some((cancelEvent) => {
      return (
        event.start_time.getTime() === cancelEvent.start_time.getTime() &&
        event.end_time.getTime() === cancelEvent.end_time.getTime()
      );
    });
  });
  return unavailabilityNewData;
};
