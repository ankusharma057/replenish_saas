import React, { useEffect, useState } from "react";
import Employee from "./Employee";
import Header from "./Header";
export default function EmployeeList({ userProfile, productList }) {
  const [invoiceList, setInvoiceList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    // Fetch the invoice list from the API
    fetch("/api/invoices")
      .then((response) => response.json())
      .then((data) => {
        setInvoiceList(data); // Update the state with the fetched data
      })
      .catch((error) => {
        console.log(error);
      });
    // Fetch the employee list from the API
    fetch("/api/employees")
      .then((response) => response.json())
      .then((data) => {
        setEmployeeList(data); // Update the state with the fetched data
      })
      .catch((error) => {
        console.log(error);
      });
  }, []); // Empty dependency array to run the effect only once

  return (
    <div>
      <Header userProfile={userProfile} />
      <div className="mt-3 mb-3 mx-1 flex justify-center flex-wrap gap-3">
        {employeeList?.sort((a, b) => a?.name?.localeCompare(b?.name))?.map((employee) => (
          <div key={employee?.id} className=" ">
            <Employee
              employeeList={employeeList}
              employee={employee}
              invoiceList={invoiceList}
              productList={productList}
              userProfile={userProfile}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
