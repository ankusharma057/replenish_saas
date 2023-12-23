import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import ScheduleToolbar from "../components/Schedule/ScheduleToolbar";
import { FixedSizeList as List } from "react-window";
import AsideLayout from "../components/Layouts/AsideLayout";
import { getEmployeesList } from "../Server";
import Select from "react-select";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import ModalWraper from "../components/Modals/ModalWraper";
import LabelInput from "../components/Input/LabelInput";
const localizer = momentLocalizer(moment);
const now = new Date();

export const MOCK_EVENTS = [
  {
    id: 0,
    title: "All Day Event very long title",
    allDay: true,
    start: new Date(2015, 3, 0),
    end: new Date(2015, 3, 1),
  },
  {
    id: 1,
    title: "Long Event",
    start: new Date(2015, 3, 7),
    end: new Date(2015, 3, 10),
  },

  {
    id: 2,
    title: "DTS STARTS",
    start: new Date(2016, 2, 13, 0, 0, 0),
    end: new Date(2016, 2, 20, 0, 0, 0),
  },

  {
    id: 3,
    title: "DTS ENDS",
    start: new Date(2016, 10, 6, 0, 0, 0),
    end: new Date(2016, 10, 13, 0, 0, 0),
  },

  {
    id: 4,
    title: "Some Event",
    start: new Date(2015, 3, 9, 0, 0, 0),
    end: new Date(2015, 3, 10, 0, 0, 0),
  },
  {
    id: 5,
    title: "Conference",
    start: new Date(2015, 3, 11),
    end: new Date(2015, 3, 13),
    desc: "Big conference for important people",
  },
  {
    id: 6,
    title: "Meeting",
    start: new Date(2015, 3, 12, 10, 30, 0, 0),
    end: new Date(2015, 3, 12, 12, 30, 0, 0),
    desc: "Pre-meeting meeting, to prepare for the meeting",
  },
  {
    id: 7,
    title: "Lunch",
    start: new Date(2015, 3, 12, 12, 0, 0, 0),
    end: new Date(2015, 3, 12, 13, 0, 0, 0),
    desc: "Power lunch",
  },
  {
    id: 8,
    title: "Meeting",
    start: new Date(2015, 3, 12, 14, 0, 0, 0),
    end: new Date(2015, 3, 12, 15, 0, 0, 0),
  },
  {
    id: 9,
    title: "Happy Hour",
    start: new Date(2015, 3, 12, 17, 0, 0, 0),
    end: new Date(2015, 3, 12, 17, 30, 0, 0),
    desc: "Most important meal of the day",
  },
  {
    id: 10,
    title: "Dinner",
    start: new Date(2015, 3, 12, 20, 0, 0, 0),
    end: new Date(2015, 3, 12, 21, 0, 0, 0),
  },
  {
    id: 11,
    title: "Planning Meeting with Paige",
    start: new Date(2015, 3, 13, 8, 0, 0),
    end: new Date(2015, 3, 13, 10, 30, 0),
  },
  {
    id: 11.1,
    title: "Inconvenient Conference Call",
    start: new Date(2015, 3, 13, 9, 30, 0),
    end: new Date(2015, 3, 13, 12, 0, 0),
  },
  {
    id: 11.2,
    title: "Project Kickoff - Lou's Shoes",
    start: new Date(2015, 3, 13, 11, 30, 0),
    end: new Date(2015, 3, 13, 14, 0, 0),
  },
  {
    id: 11.3,
    title: "Quote Follow-up - Tea by Tina",
    start: new Date(2015, 3, 13, 15, 30, 0),
    end: new Date(2015, 3, 13, 16, 0, 0),
  },
  {
    id: 12,
    title: "Late Night Event",
    start: new Date(2015, 3, 17, 19, 30, 0),
    end: new Date(2015, 3, 18, 2, 0, 0),
  },
  {
    id: 12.5,
    title: "Late Same Night Event",
    start: new Date(2015, 3, 17, 19, 30, 0),
    end: new Date(2015, 3, 17, 23, 30, 0),
  },
  {
    id: 13,
    title: "Multi-day Event",
    start: new Date(2015, 3, 20, 19, 30, 0),
    end: new Date(2015, 3, 22, 2, 0, 0),
  },
  {
    id: 14,
    title: "Today",
    start: new Date(new Date().setHours(new Date().getHours() - 3)),
    end: new Date(new Date().setHours(new Date().getHours() + 3)),
  },
  {
    id: 15,
    title: "Point in Time Event",
    start: now,
    end: now,
  },
  {
    id: 16,
    title: "Video Record",
    start: new Date(2015, 3, 14, 15, 30, 0),
    end: new Date(2015, 3, 14, 19, 0, 0),
  },
  {
    id: 17,
    title: "Dutch Song Producing",
    start: new Date(2015, 3, 14, 16, 30, 0),
    end: new Date(2015, 3, 14, 20, 0, 0),
  },
  {
    id: 18,
    title: "Itaewon Halloween Meeting",
    start: new Date(2015, 3, 14, 16, 30, 0),
    end: new Date(2015, 3, 14, 17, 30, 0),
  },
  {
    id: 19,
    title: "Online Coding Test",
    start: new Date(2015, 3, 14, 17, 30, 0),
    end: new Date(2015, 3, 14, 20, 30, 0),
  },
  {
    id: 20,
    title: "An overlapped Event",
    start: new Date(2015, 3, 14, 17, 0, 0),
    end: new Date(2015, 3, 14, 18, 30, 0),
  },
  {
    id: 21,
    title: "Phone Interview",
    start: new Date(2015, 3, 14, 17, 0, 0),
    end: new Date(2015, 3, 14, 18, 30, 0),
  },
  {
    id: 22,
    title: "Cooking Class",
    start: new Date(2015, 3, 14, 17, 30, 0),
    end: new Date(2015, 3, 14, 19, 0, 0),
  },
  {
    id: 23,
    title: "Go to the gym",
    start: new Date(2015, 3, 14, 18, 30, 0),
    end: new Date(2015, 3, 14, 20, 0, 0),
  },
];
const currentTime = new Date(); // Get the current time
const events = [
  {
    title: "Appointment 1",
    start: currentTime, // Set the start time to the current time
    end: moment(currentTime).add(1, "hour").toDate(), // Set the end time to 1 hour later
  },
  {
    title: "Appointment 2",
    start: currentTime, // Set the start time to the current time
    end: moment(currentTime).add(1, "hour").toDate(), // Set the end time to 1 hour later
  },
  // Add more events as needed
];

const initialShowAddAppointmentModal = {
  show: false,
  start: null,
  end: null,
  place: null,
};

function App() {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(
    initialShowAddAppointmentModal
  );

  const getEmployees = async (refetch = false) => {
    try {
      const { data } = await getEmployeesList(refetch);
      if (data?.length > 0) {
        setEmployeeList(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getEmployees();
    return () => {};
  }, []);

  const handleSelect = ({ start, end }) => {
    setShowAddAppointmentModal({
      show: true,
      start,
      end,
    });
    // console.log(start);
    // console.log(end);
    // const title = window.prompt("New Event name");
    // if (title)
    //   setEventsData([
    //     ...eventsData,
    //     {
    //       start,
    //       end,
    //       title,
    //     },
    //   ]);
  };

  const EmployeeItem = ({ index, style }) => {
    const employee = employeeList[index];
    return (
      employee && (
        <div
          style={style}
          onClick={() => {
            // selectedEmployeeData?.id !== employee.id && handleSelect(employee);
            // if (window.innerWidth < 1024) {
            collapse();
            // }
          }}
          // className={`p-2 border-b transition-all duration-700 ${
          // selectedEmployeeData?.id === employee.id
          // ? "pointer-events-none"
          // : "cursor-pointer "
          // } `}
        >
          {employee.name || ""}
        </div>
      )
    );
  };

  const treatmentOption = [{}];
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
              <div className="flex pb-24 flex-col pl-2 gap-4 overflow-y-auto">
                {(employeeList || []).length > 0 && (
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
        <div className="flex-1 mt-8 lg:mt-0 px-2 bg-white">
          <Calendar
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            selectable
            localizer={localizer}
            defaultDate={new Date()}
            defaultView="week"
            // events={eventsData}
            components={{
              toolbar: ScheduleToolbar,
            }}
            onSelectEvent={(event) => alert(event.title)}
            onSelectSlot={handleSelect}
            style={{
              ".rbcHeader": {
                color: "red", // Set your desired color here
              },
            }}
          />
        </div>
      </AsideLayout>

      <ModalWraper
        show={showAddAppointmentModal.show}
        onHide={() =>
          setShowAddAppointmentModal(initialShowAddAppointmentModal)
        }
        title="New Appointment"
      >
        <div className="text-lg flex flex-col gap-y-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="treatment">Treatment</label>
            <Select
              label
              inputId="treatment"
              className=""
              onChange={(e) => {}}
              options={treatmentOption}
              placeholder="Select a Treatment"
            />
          </div>

          <div className="flex flex-col gap-2">
            <LabelInput
              controlId="client"
              label="Client"
              name="client"
              placeholder="Add Client Name"
              required
              type="text"
            />
          </div>
        </div>
      </ModalWraper>
    </>
  );
}

export default App;
