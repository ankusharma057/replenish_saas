import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useEffect, useRef, useState } from "react";
import ScheduleToolbar from "../components/Schedule/ScheduleToolbar";
import { FixedSizeList as List } from "react-window";
import AsideLayout from "../components/Layouts/AsideLayout";
import {
  createSchedule,
  getClients,
  getEmployeesList,
  getLocationEmployee,
  getLocations,
  getSchedule,
} from "../Server";
import * as dates from "react-big-calendar/lib/utils/dates";

import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
import { ChevronDown } from "lucide-react";
import SearchInput from "../components/Input/SearchInput";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import ModalWraper from "../components/Modals/ModalWraper";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../components/Input/LabelInput";

const localizer = momentLocalizer(moment);

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  place: null,
  isEdit: false,
};

function Schedule() {
  const modalFormRef = useRef(null);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const { collapse } = useAsideLayoutContext();
  const [serviceLocation, setServiceLocation] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [employeeScheduleEventsData, setEmployeeScheduleEventsData] = useState(
    {}
  );
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

  const getEmployeeSchedule = async (emp, refetch = false) => {
    try {
      const { data } = await getSchedule(
        {
          employee_id: emp.id,
          start_date: emp.start_date,
          end_date: emp.end_date,
        },
        refetch
      );

      setEmployeeScheduleEventsData((pre) => {
        return {
          ...pre,
          [emp.id]: (data || []).map((d) => ({
            ...d,
            start_time: new Date(d.start_time),
            end_time: new Date(d.end_time),
          })),
        };
      });
    } catch (error) {}
  };

  const getClientName = async (employee_id, refetch = false) => {
    const { data } = await getClients(employee_id, refetch);

    if (data?.length > 0) {
      setClientNameOptions(
        data.map((client) => ({
          label: client.name,
          value: client.id,
        }))
      );
    }
  };

  const getAllLocation = async () => {
    const { data } = await getLocations();

    if (data?.length > 0) {
      setServiceLocation(
        data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
      );
    }
  };
  useEffect(() => {
    getEmployees();
    getAllLocation();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectEmployee = async (emp) => {
    if (emp) {
      getClientName(emp.id);
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

  const handleAddAppointmentSelect = ({ start, end, ...rest }, isEdit) => {
    let formateData = {
      show: true,
      start_time: start,
      end_time: end,
      date: moment(start).format("DD/MM/YYYY"),
    };

    if (isEdit) {
      formateData = {
        ...formateData,
        ...rest,
        isEdit: true,
      };
    }

    setAppointmentModal(formateData);
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
    await createSchedule(copyAppointMent);
    setEmployeeScheduleEventsData((pre) => {
      const prevData = pre[selectedEmployeeData.id] || [];
      return {
        ...pre,
        [selectedEmployeeData.id]: [...prevData, copyAppointMent],
      };
    });
    setAppointmentModal(initialAppointmentModal);
    toast.success("Appointment added successfully.");
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

  const onCalenderRangeChange = (date) => {
    let formattedStartDate;
    let formattedEndDate;
    if (date?.start && date.end) {
      formattedStartDate = moment(date.start).format("DD/MM/YYYY");
      formattedEndDate = moment(date.end).format("DD/MM/YYYY");
    } else if (date.length > 0) {
      formattedStartDate = moment(date[0]).format("DD/MM/YYYY");
      formattedEndDate = moment(date[date.length - 1]).format("DD/MM/YYYY");
    }
    getEmployeeSchedule({
      id: selectedEmployeeData.id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    });
  };

  const onLocationChange = async (selectedOption) => {
    const { data } = await getLocationEmployee(selectedOption?.id);
    if (data?.length > 0) {
      setEmployeeList(data);
      setSelectedEmployeeData(null);
    }
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
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeData]);

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
        <div className="flex-1  py-10 px-2 bg-white">
          <div className="flex items-center justify-between">
            <h1>{selectedEmployeeData?.name}</h1>
            {serviceLocation?.length > 0 && (
              <div>
                <Select
                  className="w-80"
                  options={serviceLocation}
                  placeholder="Search Places"
                  onChange={onLocationChange}
                />
              </div>
            )}
          </div>
          {selectedEmployeeData && (
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
              events={employeeScheduleEventsData[selectedEmployeeData.id] || []}
              components={{
                toolbar: (e) => (
                  <ScheduleToolbar
                    {...e}
                    serviceLocation={serviceLocation || []}
                    onLocationChange={onLocationChange}
                    setEmployeeList={setEmployeeList}
                  />
                ),
              }}
              onSelectEvent={(event) => {
                handleAddAppointmentSelect(event, true);
              }}
              onSelectSlot={handleAddAppointmentSelect}
              onRangeChange={onCalenderRangeChange}
            />
          )}
        </div>
      </AsideLayout>

      <ModalWraper
        show={appointmentModal.show}
        onHide={() => setAppointmentModal(initialAppointmentModal)}
        title={
          appointmentModal?.isEdit
            ? `Click on "Add new" to create new appointment on same time`
            : "New  Appointment"
        }
        footer={
          <div className="space-x-2">
            {appointmentModal.isEdit ? (
              <Button
                onClick={() => {
                  handleAddAppointmentSelect({
                    start: appointmentModal?.start_time,
                    end: appointmentModal?.end_time,
                  });
                }}
                type="button"
                form="newForm"
              >
                Add new
              </Button>
            ) : (
              <Button type="submit" form="appointmentForm">
                Save
              </Button>
            )}
            {/* <Button>+ Add</Button> */}
          </div>
        }
      >
        <form
          id="appointmentForm"
          ref={modalFormRef}
          onSubmit={addAppointMentSubmit}
          className="text-lg flex flex-col gap-y-2"
        >
          {selectedEmployeeData &&
            selectedEmployeeData?.treatmentOption?.length > 0 && (
              <div className="flex flex-col gap-2">
                {appointmentModal?.isEdit ? (
                  <LabelInput
                    readOnly
                    value={appointmentModal?.treatment || ""}
                    label="Treatment"
                  />
                ) : (
                  <>
                    <label htmlFor="treatment">Treatment</label>
                    <Select
                      inputId="treatment"
                      isClearable
                      onChange={(selectedOption) =>
                        setAppointmentModal((pre) => ({
                          ...pre,
                          treatment: selectedOption?.label,
                          product_type: selectedOption?.product_type,
                          product_id: selectedOption?.value,
                        }))
                      }
                      options={selectedEmployeeData.treatmentOption}
                      placeholder="Select a Treatment"
                      required
                    />
                  </>
                )}
              </div>
            )}

          <div className="flex flex-col gap-2">
            {appointmentModal?.isEdit ? (
              <LabelInput
                readOnly
                value={
                  (clientNameOptions || []).find(
                    (op) => op?.value === appointmentModal?.client_id
                  )?.label || ""
                }
                label="Client"
              />
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
                  onChange={(selectedOption) =>
                    setAppointmentModal((pre) => ({
                      ...pre,
                      client_name: selectedOption?.label,
                      client_id: selectedOption?.value,
                    }))
                  }
                  options={clientNameOptions}
                  required
                  placeholder="Select a client"
                />
              </>
            )}
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

export default Schedule;
