import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useState } from "react";
import ScheduleToolbar from "../components/Schedule/ScheduleToolbar";
import { FixedSizeList as List } from "react-window";
import AsideLayout from "../components/Layouts/AsideLayout";
import { createSchedule, getClients, getEmployeesList } from "../Server";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import ModalWraper from "../components/Modals/ModalWraper";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  place: null,
};

function App() {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [eventsData, setEventsData] = useState({});
  const [clientNameOptions, setClientNameOptions] = useState([]);

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

  const getClientName = async (refetch = false) => {
    const { data } = await getClients(refetch);

    if (data?.length > 0) {
      setClientNameOptions(
        data.map((client) => ({
          label: client.name,
          value: client.id,
        }))
      );
    }
  };
  useEffect(() => {
    getEmployees();
    getClientName();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEmployee = (emp) => {
    if (emp) {
      const treatmentOption = (emp.employees_inventories || []).map((inv) => {
        return {
          label: inv.product.name,
          value: inv.product.id,
          product_type: inv.product.product_type,
          quantity: inv.quantity,
        };
      });
      setSelectedEmployeeData({ ...emp, treatmentOption });
    }
  };
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
          className={`p-2 border-b transition-all duration-700 ${
            selectedEmployeeData?.id === employee.id
              ? "pointer-events-none bg-gray-200 rounded-md "
              : "cursor-pointer "
          } `}
        >
          {employee.name || ""}
        </div>
      )
    );
  };

  const handleAddAppointmentSelect = ({ start, end, ...rest }) => {
    setAppointmentModal({
      show: true,
      start_time: start,
      end_time: end,
      date: moment(start).format("DD/MM/YYYY"),
    });
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentModal?.client_name) {
      toast.error("Please select a client");
      return;
    } else if (!appointmentModal?.treatment) {
      toast.error("Please select a treatment");
      return;
    }
    const copyAppointMent = {
      ...appointmentModal,
      employee_id: selectedEmployeeData.id,
    };
    delete copyAppointMent.show;
    // console.log(JSON.stringify(copyAppointMent, null, 2));
    const { data } = await createSchedule(copyAppointMent);
    console.log(data);
    setEventsData((pre) => {
      const prevData = pre[selectedEmployeeData.id] || [];
      return {
        ...pre,
        [selectedEmployeeData.id]: [...prevData, copyAppointMent],
      };
    });

    setAppointmentModal(initialAppointmentModal);
    try {
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error.response.statusText ||
          error.message ||
          "Failed to add appointment."
      ); // handle error
    }
  };

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
          </>
        }
      >
        {selectedEmployeeData && (
          <div className="flex-1 mt-8 lg:mt-0 px-2 bg-white">
            <Calendar
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              selectable
              startAccessor="start_time"
              endAccessor="end_time"
              titleAccessor="treatment"
              localizer={localizer}
              defaultDate={new Date()}
              defaultView="week"
              events={eventsData[selectedEmployeeData.id] || []}
              components={{
                toolbar: ScheduleToolbar,
              }}
              onSelectEvent={(event) => {
                console.log(event);
              }}
              onSelectSlot={handleAddAppointmentSelect}
              style={{
                ".rbcHeader": {
                  color: "red", // Set your desired color here
                },
              }}
            />
          </div>
        )}
      </AsideLayout>

      <ModalWraper
        show={appointmentModal.show}
        onHide={() => setAppointmentModal(initialAppointmentModal)}
        title="New Appointment"
        footer={
          <div className="space-x-2">
            <Button type="submit" form="appointmentForm">
              Save
            </Button>
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
                <label htmlFor="treatment">Treatment</label>
                <Select
                  inputId="treatment"
                  isClearable
                  onChange={(selectedOption) =>
                    setAppointmentModal((pre) => ({
                      ...pre,
                      treatment: selectedOption.label,
                      product_type: selectedOption.product_type,
                      product_id: selectedOption.value,
                    }))
                  }
                  options={selectedEmployeeData.treatmentOption}
                  placeholder="Select a Treatment"
                  required
                />
              </div>
            )}

          <div className="flex flex-col gap-2">
            <label htmlFor="client">Client</label>
            <CreatableSelect
              isClearable
              isCreatable
              inputId="client"
              onChange={(selectedOption) =>
                setAppointmentModal((pre) => ({
                  ...pre,
                  client_name: selectedOption.label,
                  client_id: selectedOption.value,
                }))
              }
              options={clientNameOptions}
              required
              placeholder="Select a client"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span>Time</span>
            {appointmentModal.start_time && (
              <span>
                {moment(appointmentModal.start_time).format("hh:mm A")} -{" "}
                {moment(appointmentModal.end_time).format("hh:mm A")}
              </span>
            )}
          </div>
        </form>
      </ModalWraper>
    </>
  );
}

export default App;
