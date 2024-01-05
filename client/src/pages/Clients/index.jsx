import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthUserContext";
import EmployeeProfileCard from "../../components/Cards/EmployeeProfileCard";
import {
  getAllLocationAndEmployee,
  getClientEmployeesList,
  getClientLocations,
  getLocationEmployee,
} from "../../Server";
import { CircleUser } from "lucide-react";

import SearchInput from "../../components/Input/SearchInput";
import ClientLayout from "../../components/Layouts/ClientLayout";
import LocationCard from "../../components/Cards/LocationCard";
import Heading from "../../components/Headers/Heading";
import LogoHeader from "../../components/Headers/LogoHeader";
const ClientRoot = () => {
  const { authUserState } = useAuthContext();
  const [locationAndEmployee, setLocationAndEmployee] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [employeeList, setEmployeeList] = useState([]);
  // const [searchEmployee, setSearchEmployee] = useState("");
  // const [serviceLocation, setServiceLocation] = useState([]);
  // const [searchParams] = useSearchParams();
  // const locationId = searchParams.get("location");

  // const getAllEmployees = async () => {
  //   try {
  //     setLoading(true);

  //     let data;
  //     if (locationId) {
  //       data = await getLocationEmployee(locationId);
  //     } else {
  //       data = await getClientEmployeesList();
  //     }
  //     if (data.data?.length) {
  //       setEmployeeList(data.data);
  //     }
  //   } catch (error) {
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const getAllLocation = async (refetch = false) => {
  //   try {
  //     const { data } = await getClientLocations(refetch);
  //     if (data?.length > 0) {
  //       setServiceLocation(
  //         data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
  //       );
  //     }
  //   } catch (error) {}
  // };

  // useEffect(() => {
  //   getAllLocation();
  //   getAllEmployees();

  //   getAllLocationAndEmployee()
  //     .then((d) => console.log(JSON.stringify(d.data , null ,2)))
  //     .catch((e) => console.log(e));

  //   return () => {};
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [locationId]);

  useEffect(() => {
    getLocEmp();
    return () => {};
  }, []);

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

  return (
    <ClientLayout>
      <div className="shadow-md bg-white  flex flex-col rounded-lg p-4">
        <LogoHeader />
        <Heading text="Welcome to our online booking site" />
        <div className="flex flex-col gap-4">
          {(locationAndEmployee || []).map((locEmp) => (
            <div
              key={locEmp?.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4"
            >
              <LocationCard
                id={locEmp?.id}
                name={locEmp?.name}
                path={`/clients/location?locations=${locEmp?.name}&locId=${locEmp?.id}`}
              />
              <div className="flex gap-2 flex-wrap">
                {locEmp?.employees?.map((emp) => (
                  <EmployeeProfileCard
                    key={emp?.id}
                    path={`/clients/location?locations=${locEmp?.name}&locId=${locEmp?.id}&empId=${emp?.id}`}
                    image={emp?.image}
                    name={emp?.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientRoot;
