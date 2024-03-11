import moment from "moment";
import { useEffect, useState } from "react";
import AsideLayout from "../../../components/Layouts/AsideLayout";
import {
  createClientSchedule,
  getClientEmployee,
  getClientEmployeeSchedule,
  getClientLocations,
} from "../../../Server";

import Select from "react-select";
import { ChevronDown } from "lucide-react";
// import SearchInput from "../../../components/Input/SearchInput";
// import ModalWraper from "../../../components/Modals/ModalWraper";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import LabelInput from "../../../components/Input/LabelInput";
// import Loadingbutton from "../../../components/Buttons/Loadingbutton";
import ScheduleCalender from "../../../components/Schedule/ScheduleCalender";
import { useParams, useNavigate } from "react-router-dom";
import ModalWraper from "../../../components/Modals/ModalWraper";
import { useAuthContext } from "../../../context/AuthUserContext";

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  place: null,
  isEdit: false,
};

function ClientAppointment() {
  const { employee_id } = useParams();
  const { authUserState } = useAuthContext();
  // const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  const [appointmentList, setAppointmentList] = useState([]);
  const [currentData, setCurrentData] = useState({
    emp: null,
    location: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!employee_id) {
      // toast.warning("This practitioner is not available for booking.");
      navigate("/clients");
      return;
    }
    getEmployee();
    getAllLocation();
    getEmployeeSchedule();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmployee = async (refetch = false) => {
    try {
      const { data } = await getClientEmployee(employee_id, refetch);
      if (data) {
        setCurrentData((pre) => ({
          ...pre,
          emp: {
            ...data,
            treatmentOption: data?.employees_inventories?.map((product) => {
              return {
                label: product?.product?.name,
                value: product?.product?.id,
                product_type: product?.product?.product_type,
              };
            }),
          },
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEmployeeSchedule = async (refetch = false) => {
    try {
      const { data } = await getClientEmployeeSchedule(employee_id);

      if (data?.length > 0) {
        setAppointmentList(() => {
          return (data || []).map((d) => ({
            ...d,
            start_time: new Date(d.start_time),
            end_time: new Date(d.end_time),
          }));
        });
      }
    } catch (error) {}
  };

  const getAllLocation = async (refetch = false) => {
    try {
      const { data } = await getClientLocations(refetch);
      if (data?.length > 0) {
        setCurrentData((pre) => ({
          ...pre,
          location: data?.map((loc) => ({
            ...loc,
            label: loc.name,
            value: loc.id,
          })),
        }));
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
    const copyAppointMent = {
      ...appointmentModal,
      employee_id: currentData?.emp?.id,
    };
    delete copyAppointMent.show;
    await createClientSchedule(copyAppointMent);
    setAppointmentList((pre) => {
      return [...pre, copyAppointMent];
    });
    toast.success("Appointment added successfully.");
    setAppointmentModal(initialAppointmentModal);
    try {
    } catch (error) {
      toast.error(
        error?.response?.data?.exception ||
          error?.response?.statusText ||
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
    // const { data } = await getLocationEmployee(selectedOption?.id);
    navigate(
      `/clients?location=${selectedOption.id}&&location_name=${selectedOption.label}`
    );
  };

  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <div className="border-t-2 rounded-lg py-2 bg-white">
              <h1 className="text-xl flex gap-x-2 items-center justify-center">
                Practitioner <ChevronDown />
              </h1>
              <div className="flex pb-24 flex-col p-2 gap-4 overflow-y-auto">
                {currentData?.emp && (
                  <div className="flex flex-col gap-4">
                    <div className="">
                      <span>{currentData.emp?.name}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3>Treatments</h3>
                      {currentData.emp?.employees_inventories?.map(
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
            </div>
          </>
        }
      >
        <div className="flex-1  py-10 px-2 bg-white">
          <div className="flex items-center justify-end">
            {currentData.location?.length > 0 && (
              <div className="flex items-center gap-x-2">
                <Select
                  className="w-80"
                  options={currentData.location}
                  placeholder="Search Places"
                  onChange={onLocationChange}
                />
              </div>
            )}
          </div>
          <ScheduleCalender
            events={appointmentList || []}
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
        </div>
      </AsideLayout>

      {/* Add appointment modal */}
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
            {/* {appointmentModal.isEdit ? (
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
            )} */}

            {!appointmentModal.isEdit && (
              <Button type="submit" form="appointmentForm">
                Save
              </Button>
            )}
          </div>
        }
      >
        <form
          id="appointmentForm"
          onSubmit={addAppointMentSubmit}
          className="text-lg flex flex-col gap-y-2"
        >
          {currentData?.emp &&
            currentData?.emp?.treatmentOption?.length > 0 && (
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
                      options={currentData?.emp.treatmentOption}
                      placeholder="Select a Treatment"
                      required
                    />
                  </>
                )}
              </div>
            )}

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

export default ClientAppointment;
