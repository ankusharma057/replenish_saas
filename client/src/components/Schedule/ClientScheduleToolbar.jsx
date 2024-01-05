import React, { memo } from "react";
import { Button } from "react-bootstrap";

const ClientScheduleToolbar = (toolbar) => {
  const calculateDateRange = (mDate, view, action) => {
    let newDate;

    switch (view) {
      case "week":
        newDate =
          action === "prev"
            ? new Date(
                mDate.getFullYear(),
                mDate.getMonth(),
                mDate.getDate() - 7
              )
            : new Date(
                mDate.getFullYear(),
                mDate.getMonth(),
                mDate.getDate() + 7
              );
        break;
      case "month":
        newDate =
          action === "prev"
            ? new Date(mDate.getFullYear(), mDate.getMonth() - 1, 1)
            : new Date(mDate.getFullYear(), mDate.getMonth() + 1, 1);
        break;
      case "day":
        newDate =
          action === "prev"
            ? new Date(
                mDate.getFullYear(),
                mDate.getMonth(),
                mDate.getDate() - 1
              )
            : new Date(
                mDate.getFullYear(),
                mDate.getMonth(),
                mDate.getDate() + 1
              );
        break;
      default:
        newDate = mDate;
    }

    return newDate;
  };

  const goToBack = () => {
    const newDate = calculateDateRange(toolbar.date, toolbar.view, "prev");
    toolbar.onNavigate("prev", newDate);
    // const startDate = calculateDateRange(newDate, toolbar.view, "prev");
    // fetchScheduleData(toolbar.view, startDate, newDate);
  };

  const goToNext = () => {
    const newDate = calculateDateRange(toolbar.date, toolbar.view, "next");
    toolbar.onNavigate("next", newDate);
    // const endDate = calculateDateRange(newDate, toolbar.view, "next");
    // fetchScheduleData(toolbar.view, newDate, endDate);
  };

  const goToToday = () => {
    const today = new Date();
    toolbar.onNavigate("today", today);
    // const startDate = today;
    // const endDate = today;
    // fetchScheduleData(toolbar.view, startDate, endDate);
  };

  return (
    <div className="flex justify-around flex-wrap mt-4 items-center p-3 gap-4">
      <h1 className="text-2xl  sm:text-3xl">{toolbar.label}</h1>

      <div className="flex gap-x-4">
        {toolbar.views?.map((view) => (
          <Button
            key={view}
            variant={toolbar.view === view ? "primary" : "outline-primary"}
            onClick={() => toolbar.onView(view)}
            className=""
          >
            {view}
          </Button>
        ))}
      </div>
      <div className="flex gap-x-4 items-center">
        <Button size="sm" variant="outline-primary" onClick={goToBack}>
          Back
        </Button>
        <Button size="sm" variant="outline-primary" onClick={goToToday}>
          Today
        </Button>
        <Button size="sm" variant="outline-primary" onClick={goToNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default memo(ClientScheduleToolbar);
