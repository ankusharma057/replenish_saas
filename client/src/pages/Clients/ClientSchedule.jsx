import moment from "moment";
import { useEffect, useState } from "react";
import AsideLayout from "../../components/Layouts/AsideLayout";
import {
  createClientSchedule,
  getClientEmployee,
  getClientEmployeeSchedule,
  getClientLocations,
  getClientSchedule,
  getLocationEmployee,
} from "../../Server";
import Select from "react-select";
import { ChevronDown } from "lucide-react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import ScheduleCalender from "../../components/Schedule/ScheduleCalender";
import ModalWraper from "../../components/Modals/ModalWraper";
import { useAuthContext } from "../../context/AuthUserContext";
import SearchInput from "../../components/Input/SearchInput";

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  place: null,
  isEdit: false,
};

function ClientAppointment() {
  const [currentTab, setCurrentTab] = useState({
    tab: "client",
    data: null,
    dataType: "clientData",
    location: [],
    selectedLocation: null,
  });
  const [clientSchedules, setClientSchedules] = useState([]);
  const { authUserState } = useAuthContext();
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeAppointmentList, setEmployeeAppointmentList] = useState([]);

  useEffect(() => {
    getAllLocation();
    getSchedule();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSchedule = async (refetch = false) => {
    const { data } = await getClientSchedule(refetch);
    if (data?.length > 0) {
      setClientSchedules(() => {
        return (data || []).map((d) => ({
          ...d,
          start_time: new Date(d.start_time),
          end_time: new Date(d.end_time),
        }));
      });
    }
  };

  const getAllLocation = async (refetch = false) => {
    try {
      const { data } = await getClientLocations(refetch);
      if (data?.length > 0) {
        setCurrentTab((pre) => ({
          ...pre,
          tab: "client",
          location: data?.map((loc) => ({
            ...loc,
            label: loc.name,
            value: loc.id,
          })),
        }));
        // setCurrentData((pre) => ({}));
      }
    } catch (error) {}
  };

  const handleAddAppointmentSelect = ({ start, end, ...rest }, isEdit) => {
    let formateData = {
      show: true,
      start_time: start,
      end_time: end,
      date: moment(start).format("DD/MM/YYYY"),
    };

    if (isEdit) {
      // formateData = {
      //   ...formateData,
      //   ...rest,
      //   isEdit: true,
      // };

      toast.error("You can not edit your schedule");
      return;
    }

    setAppointmentModal(formateData);
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentModal?.treatment) {
      toast.error("Please select a treatment");
      return;
    }

    if (!currentTab?.data?.id) {
      toast.error("Please select the Practitioner ");
    }
    const copyAppointMent = {
      ...appointmentModal,
      employee_id: currentTab?.data?.id,
    };
    delete copyAppointMent.show;
    await createClientSchedule(copyAppointMent);

    setEmployeeAppointmentList((pre) => {
      return [...pre, copyAppointMent];
    });
    toast.success("Appointment added successfully.");
    setAppointmentModal(initialAppointmentModal);
    await getSchedule(true);

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
    // let formattedStartDate;
    // let formattedEndDate;
    // if (date?.start && date.end) {
    //   formattedStartDate = moment(date.start).format("DD/MM/YYYY");
    //   formattedEndDate = moment(date.end).format("DD/MM/YYYY");
    // } else if (date.length > 0) {
    //   formattedStartDate = moment(date[0]).format("DD/MM/YYYY");
    //   formattedEndDate = moment(date[date.length - 1]).format("DD/MM/YYYY");
    // }
    // getEmployeeSchedule({
    //   id: selectedEmployeeData.id,
    //   start_date: formattedStartDate,
    //   end_date: formattedEndDate,
    // });
  };

  const onLocationChange = async (selectedOption) => {
    try {
      const { data } = await getLocationEmployee(selectedOption?.id);

      console.log(selectedOption);
      if (data?.length > 0) {
        setCurrentTab((pre) => ({
          ...pre,
          tab: "employee",
          data,
          dataType: "employeeList",
          currentLocation: selectedOption,
        }));
      }
    } catch (error) {}
  };

  const onSelectEmployee = async (emp) => {
    try {
      const { data } = await getClientEmployee(emp?.id);

      if (data) {
        const { data: empSchedule } = await getClientEmployeeSchedule(data.id);
        setCurrentTab((pre) => ({
          ...pre,
          tab: "employee",
          data: {
            ...data,
            treatmentOption: data?.employees_inventories?.map((product) => {
              return {
                label: product?.product?.name,
                value: product?.product?.id,
                product_type: product?.product?.product_type,
              };
            }),
          },
          dataType: "employee",
        }));

        setEmployeeAppointmentList(
          (empSchedule || []).map((d) => ({
            ...d,
            start_time: new Date(d.start_time),
            end_time: new Date(d.end_time),
          }))
        );
      }
    } catch (error) {}
  };

  const ClientTab = ({ showLocation = true }) => {
    return (
      <div className="p-4 md:p-20">
        <>
          <div className="flex items-center justify-between">
            <h1>Your schedules</h1>
            {currentTab.location?.length > 0 && showLocation && (
              <div className="flex items-center gap-x-2">
                <Select
                  className="w-80"
                  options={currentTab.location}
                  placeholder="Search Places"
                  onChange={onLocationChange}
                />
              </div>
            )}
          </div>
          <ScheduleCalender
            events={clientSchedules || []}
            // onSelectEvent={(event) => {}}
          />
        </>
      </div>
    );
  };

  return (
    <>
      {currentTab.tab === "client" ? (
        <ClientTab />
      ) : (
        <AsideLayout
          asideContent={
            <>
              <div className="border-t-2 rounded-lg py-2 flex flex-col gap-y-4 bg-white">
                {currentTab.dataType === "employee" && (
                  <>
                    <h1 className="text-xl flex gap-x-2 items-center justify-center">
                      Practitioner <ChevronDown />
                    </h1>
                    <div className="flex pb-24 flex-col p-2 gap-4 overflow-y-auto">
                      {currentTab?.data?.id && (
                        <div className="flex flex-col gap-4">
                          <div className="">
                            <span>{currentTab?.data?.name}</span>
                          </div>

                          <div className="flex flex-col gap-2">
                            <h3>Treatments</h3>
                            {currentTab?.data?.employees_inventories?.map(
                              (product) => {
                                return (
                                  <span
                                    key={product?.product?.id}
                                    className=" cursor-pointer hover:bg-gray-200 rounded-lg p-2  flex justify-between"
                                  >
                                    <span>{product?.product?.name}</span>
                                    <span className="font-bold">
                                      ${product?.product?.cost_price}
                                    </span>
                                  </span>
                                );
                              }
                            )}
                          </div>
                          {/* <PlusCircle /> */}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {currentTab.dataType === "employeeList" && (
                  <>
                    <SearchInput
                      placeholder="Search Staff..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                    />

                    <div key="employeeSearch">
                      {currentTab?.data
                        ?.filter((employee) =>
                          employee?.name
                            ?.toLowerCase()
                            ?.includes(employeeSearch?.toLowerCase())
                        )
                        .map((emp) => (
                          <div
                            key={emp?.id}
                            onClick={() => onSelectEmployee(emp)}
                            className={`p-2 border-b transition-all duration-700 cursor-pointer hover:bg-gray-200 rounded-lg`}
                          >
                            {emp?.name || ""}
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </>
          }
        >
          <div className="flex-1  py-10 px-2 bg-white">
            <div className="flex items-center justify-end">
              {currentTab.location?.length > 0 && (
                <div className="flex items-center gap-x-2">
                  <Select
                    className="w-80"
                    options={currentTab.location}
                    placeholder="Search Places"
                    onChange={onLocationChange}
                    defaultValue={currentTab?.currentLocation}
                  />
                </div>
              )}
            </div>
            {currentTab.dataType === "employee" ? (
              <ScheduleCalender
                events={employeeAppointmentList || []}
                onSelectEvent={(event) => {
                  if (event?.client_id === authUserState.client?.id) {
                    handleAddAppointmentSelect(event, true);
                  } else {
                    toast.warning("Already booked this time.");
                  }
                }}
                onSelectSlot={handleAddAppointmentSelect}
                onRangeChange={onCalenderRangeChange}
              />
            ) : (
              <ClientTab showLocation={false} />
            )}
          </div>
        </AsideLayout>
      )}

      {/* Add appointment modal */}
      {currentTab.tab === "employee" && (
        <ModalWraper
          show={appointmentModal.show}
          onHide={() => setAppointmentModal(initialAppointmentModal)}
          title={
            appointmentModal?.isEdit
              ? // ? `Click on "Add new" to create new appointment on same time`
                `Your appointment`
              : "New  Appointment"
          }
          footer={
            <div className="space-x-2">
              <Button type="submit" form="appointmentForm">
                Save
              </Button>
            </div>
          }
        >
          <form
            id="appointmentForm"
            onSubmit={addAppointMentSubmit}
            className="text-lg flex flex-col gap-y-2"
          >
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
              options={currentTab?.data.treatmentOption}
              placeholder="Select a Treatment"
              required
            />

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
      )}
    </>
  );
}

export default ClientAppointment;
