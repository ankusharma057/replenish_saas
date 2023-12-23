import React from "react";
import { Button } from "react-bootstrap";
import Select from "react-select";

const ScheduleToolbar = (toolbar) => {
  const options = [
    {
      value: "employee?.name",
      label: "employee?.name",
    },
  ];
  return (
    <div className="flex justify-around flex-wrap mt-8 items-center p-3 gap-4">
      <h1 className="text-2xl  sm:text-3xl md:text-4xl">{toolbar.label}</h1>
      <div>
        <Select
          className=" flex-1 w-80"
          onChange={(e) => {}}
          options={options}
          placeholder="Search Places"
        />
      </div>
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
    </div>
  );
};

export default ScheduleToolbar;
