import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthUserContext";
import EmployeeProfileCard from "../../components/Cards/EmployeeProfileCard";
import {
  getClientEmployeesList,
  getClientLocations,
  getLocationEmployee,
} from "../../Server";
import { CircleUser } from "lucide-react";

import SearchInput from "../../components/Input/SearchInput";
const ClientRoot = () => {
  const { authUserState } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [serviceLocation, setServiceLocation] = useState([]);
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get("location");

  const getAllEmployees = async () => {
    try {
      setLoading(true);

      let data;
      if (locationId) {
        data = await getLocationEmployee(locationId);
      } else {
        data = await getClientEmployeesList();
      }
      if (data.data?.length) {
        setEmployeeList(data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getAllLocation = async (refetch = false) => {
    try {
      const { data } = await getClientLocations(refetch);
      if (data?.length > 0) {
        setServiceLocation(
          data?.map((loc) => ({ ...loc, label: loc.name, value: loc.id }))
        );
      }
    } catch (error) {}
  };

  useEffect(() => {
    getAllLocation();
    getAllEmployees();
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  return (
    <div className="px-[1.25rem] sm:p-14 md:p-16 lg:!p-24 flex-1 flex flex-col gap-4">
      {/* <div className="w-full flex flex-col gap-y-8">
        <h1>Welcome to our online booking site</h1>
        <p className="text-lg">
          Book appointment by our practitioner
          {searchParams.get("location_name") &&
            ` at ${searchParams.get("location_name")}`}
        </p>
        <SearchInput
          onChange={(e) => setSearchEmployee(e.target.value)}
          placeholder="Search the practitioner..."
        />

        <div className="flex w-full flex-wrap gap-2">
          {(employeeList || [])
            .filter((empSearch) => empSearch?.name?.includes(searchEmployee))
            .map((emp) => (
              <EmployeeProfileCard
                key={emp?.id}
                id={emp.id}
                image={emp?.image}
                name={emp.name}
                email={emp.email}
              />
            ))}
        </div>
      </div> */}
      {authUserState.client && (
        <div className="flex ">
          <div className="bg-white shadow-md flex flex-col items-center gap-4 p-8 border transition-all hover:!border-blue-500 rounded-lg no-underline">
            <CircleUser className="w-24  col-span-1 h-24 text-black/50" />
            <div>
              <p className="break-words">
                Name:
                <span className="font-bold ml-2">
                  {authUserState.client?.name}
                </span>
              </p>
              <p className="text-sm break-words">
                Email:
                <span className="font-bold ml-2">
                  {authUserState.client?.email}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientRoot;
