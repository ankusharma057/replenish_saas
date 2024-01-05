import React, { useEffect, useState } from "react";
import LogoHeader from "../../components/Headers/LogoHeader";
import ClientLayout from "../../components/Layouts/ClientLayout";
import Heading from "../../components/Headers/Heading";
import { Link, useSearchParams } from "react-router-dom";
import {
  createClientSchedule,
  getAllLocationAndEmployee,
  getClientEmployee,
  getClientEmployeeSchedule,
  getLocationEmployee,
  getProductsList,
} from "../../Server";
import Select from "react-select";
import { Button } from "react-bootstrap";

import EmployeeProfileCard from "../../components/Cards/EmployeeProfileCard";
import ClientScheduleCalender from "../../components/Schedule/ClientScheduleCalender";
import { useAuthContext } from "../../context/AuthUserContext";
import { toast } from "react-toastify";
import moment from "moment";
import ModalWraper from "../../components/Modals/ModalWraper";

const initialAppointmentModal = {
  show: false,
  start_time: null,
  end_time: null,
  location: null,
  isEdit: false,
};
const ClientLocation = () => {
  const [params] = useSearchParams();
  const { authUserState } = useAuthContext();

  const locId = params.get("locId");
  const empId = params.get("empId");
  const [employees, setEmployees] = useState([]);
  const [locationAndEmployee, setLocationAndEmployee] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [selectedTreatMent, setSelectedTreatMent] = useState(null);
  const [selectedEmpSchedules, setSelectedEmpSchedules] = useState([]);

  const [appointmentModal, setAppointmentModal] = useState(
    initialAppointmentModal
  );
  useEffect(() => {
    if (empId) {
      getEmp();
      getEmpSchedule();
    }

    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empId]);

  useEffect(() => {
    getEmpByLocId();
    getLocEmp();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locId, empId]);

  const getEmp = async () => {
    try {
      const { data } = await getClientEmployee(empId);
      if (data) {
        setSelectedEmployee(data);
        const { data: products } = await getProductsList();
        if (products?.length) {
          setProductsList(products);
        }
      } else {
        setSelectedEmployee(null);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getLocEmp = async () => {
    try {
      const { data } = await getAllLocationAndEmployee();
      if (data?.length > 0) {
        setLocationAndEmployee(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getEmpSchedule = async (refetch = false) => {
    try {
      if (empId) {
        const { data } = await getClientEmployeeSchedule(empId, refetch);

        if (data?.length) {
          setSelectedEmpSchedules(
            (data || []).map((d) => ({
              ...d,
              start_time: new Date(d.start_time),
              end_time: new Date(d.end_time),
              treatment: d?.treatment?.treatment || "",
            }))
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getEmpByLocId = async () => {
    try {
      if (params.get("locId")) {
        const { data } = await getLocationEmployee(params.get("locId"));
        if (data.length) {
          setEmployees(data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isEmp = !((!!empId && !selectedEmployee) || !empId);

  const handleAddAppointmentSelect = ({ start, end, ...rest }) => {
    if (!selectedTreatMent) {
      return toast("Please select the treatment");
    }

    const duration = selectedTreatMent?.treatment?.duration;
    let formateData = {
      show: true,
      start_time: start,
      end_time: isNaN(duration)
        ? end
        : moment(start).add(+duration, "minutes").toDate(),
      date: moment(start).format("DD/MM/YYYY"),
    };

    setAppointmentModal(formateData);

    // setAppointmentModal(formateData);
  };

  const addAppointMentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTreatMent?.product?.id) {
      toast.error("Please select a treatment");
      return;
    }
    const copyAppointMent = {
      // ...selectedTreatMent,
      start_time: appointmentModal?.start_time,
      date: appointmentModal?.date,
      end_time: appointmentModal?.end_time,
      employee_id: selectedEmployee?.id,
      treatment_id: selectedTreatMent?.treatment?.id,
      product_id: selectedTreatMent?.product?.id,
    };

    
    await createClientSchedule(copyAppointMent);
    toast.success("Appointment added successfully.");
    setAppointmentModal(initialAppointmentModal);
    await getEmpSchedule(true);
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
    <ClientLayout>
      <div className="bg-white min-h-full rounded-lg pb-4 text-slate-800">
        <LogoHeader />

        <Heading
          text={
            <span className="text-3xl font-thin">
              Book an Appointment
              <span className="text-lg">
                {`${
                  params.get("locations")
                    ? ` at ${params.get("locations")}`
                    : ""
                }
                Let us come to you!`}
              </span>
            </span>
          }
        />

        {isEmp ? (
          <div className="flex justify-between p-4">
            <div className="flex flex-col ">
              <h3>{selectedEmployee?.name}</h3>
              <p>Select a treatment</p>
              <ul className="flex flex-col gap-2">
                {(productsList || []).map((product) => (
                  <li key={product?.id} className="w-[250px] rounded-lg p-2">
                    {product?.name}
                    <ul className="m-0 p-0 text-center space-y-2">
                      {(product?.treatments || []).map((treatment) => (
                        <li
                          key={treatment?.id}
                          onClick={(e) => {
                            e.preventDefault(); // Prevent any default behavior
                            setSelectedTreatMent({
                              product,
                              treatment,
                            });
                            // window.scrollTo({ top: 0, behavior: "smooth" });
                            window.scrollTo(0, 0);
                          }}
                          className="w-[250px] flex flex-col transition-all bg-primary-dark-blue hover:bg-black text-white text-sm cursor-pointer rounded-sm p-2"
                        >
                          <span>{treatment?.name}</span>
                          <span>
                            {treatment?.duration} min-{product?.retail_price}$
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 px-4">
              {selectedTreatMent ? (
                <div>
                  <p>
                    Selected treatment
                    <span className="ml-2 font-bold">
                      {/* {selectedTreatMent?.treatment?.name} */}
                    </span>
                  </p>
                  <ClientScheduleCalender
                    onSelectEvent={(e) => {
                      if (e?.client_id === authUserState.client?.id) {
                        toast("You can't book your own appointment");
                        return;
                      } else {
                        toast("Already booked");
                      }
                    }}
                    events={selectedEmpSchedules || []}
                    onSelectSlot={handleAddAppointmentSelect}
                  />
                </div>
              ) : (
                <div className="flex  flex-col pt-4 items-center justify-center">
                  <p>
                    Select a treatment from the list on the left to view
                    available appointment times
                  </p>
                  <img
                    alt="Please select the treatment"
                    className="max-w-xl"
                    src="/empty-state-booking.png"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex p-2 gap-4">
            <ul className="w-[250px] text-center text-sm rounded-lg border m-0 p-0">
              {(locationAndEmployee || []).map((locEmp) => (
                <li
                  key={locEmp?.id}
                  className={`border-b hover:bg-gray-200 ${
                    locId === String(locEmp?.id) ? "bg-gray-200 " : ""
                  } transition-all`}
                >
                  <Link
                    to={`/clients/location?locations=${locEmp?.name}&locId=${locEmp?.id}`}
                    className="p-3 no-underline block text-black/80"
                  >
                    {locEmp?.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex flex-col flex-1">
              <h3 className="font-normal border-b pb-4">
                Welcome to our online booking site
              </h3>
              <h3 className="font-normal">Medical</h3>

              <div className="grid grid-cols-2">
                <div className=""></div>
                <div className="">
                  <p className="mb-2">Book by Practitioner</p>
                  {(employees || []).map((emp) => (
                    <EmployeeProfileCard
                      key={emp?.id}
                      path={`/clients/location?empId=${emp?.id}&&locId=${locId}`}
                      name={emp?.name}
                      image={emp?.image}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
            {authUserState.client ? (
              <Button type="submit" form="appointmentForm">
                Confirm
              </Button>
            ) : (
              <Link
                className="no-underline btn-primary"
                to={`/clients/signin${window.location.search}`}
              >
                Please sign in to book an appointment
              </Link>
            )}
          </div>
        }
      >
        <form
          id="appointmentForm"
          onSubmit={addAppointMentSubmit}
          className="text-lg flex flex-col gap-y-2"
        >
          <div className="flex flex-col gap-2">
            <span>Treatment</span>
            <span>
              {selectedTreatMent?.treatment?.name} -{" "}
              {selectedTreatMent?.treatment?.duration || 30}min
            </span>
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
    </ClientLayout>
  );
};

export default ClientLocation;
