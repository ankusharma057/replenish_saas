import React, { useEffect, useState } from "react";
import AsideLayout from "../../components/Layouts/AsideLayout";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthUserContext";
import LabelInput from "../../components/Input/LabelInput";
import Loadingbutton from "../../components/Buttons/Loadingbutton";
import EmployeeProfileCard from "../../components/Cards/EmployeeProfileCard";
import { getEmployeesList, getLocations } from "../../Server";
import Select from "react-select";
import SearchInput from "../../components/Input/SearchInput";
const ClientStaff = () => {
  const { authUserState } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [serviceLocation, setServiceLocation] = useState([]);
  const getAllEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await getEmployeesList();
      if (data?.length) {
        setEmployeeList(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getAllLocation = async (refetch = false) => {
    try {
      const { data } = await getLocations(refetch);
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
  }, []);

  return (
    <AsideLayout
      asideContent={
        <>
          <div className="bg-white p-2 flex flex-col justify-center">
            {serviceLocation?.length > 0 && (
              <div className="flex items-center gap-x-2">
                <Select
                  className="w-80"
                  options={serviceLocation}
                  placeholder="Search Places"
                  // onChange={onLocationChange}
                />
              </div>
            )}
          </div>
        </>
      }
    >
      <div className="p-20 flex-1 flex flex-col gap-4">
        <div className="w-full flex flex-col gap-y-8">
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
        </div>
      </div>
    </AsideLayout>
  );
};

export default ClientStaff;
