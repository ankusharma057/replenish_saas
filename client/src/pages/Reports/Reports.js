import React from "react";
import AsideLayout from "../../components/Layouts/AsideLayout";
import { ListGroup } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

const Reports = () => {
    const sidebarRoutes = [
        {
          title: "Clients",
          subHeadings: [
            { title: "Client List", route: "/users/all"},
            { title: "Email Marketing subscribers", route: "/users/all"},
            { title: "Top Clients", route: "/users/all"},
            { title: "Invalid Email", route: "/users/all"},
            { title: "Notes", route: "/users/all"},
            { title: "Potential Description", route: "/users/all"},
            { title: "Referral", route: "/users/all"},
          ]
        },
        {
          title: "Appointments",
          subHeadings: [
            { title: "Appointments", route: "/users/all"},
            { title: "Online Appointments", route: "/users/all"},
            { title: "Client Retention", route: "/users/all"},
            { title: "Rating & Reviews", route: "/users/all"},
            { title: "Phone Reminders", route: "/users/all"},
            { title: "Return Visit Reminders", route: "/users/all"},
            { title: "Unschedule Clients(Last visit)", route: "/users/all"},
            { title: "Wait List", route: "/users/all"},
            { title: "Hour Schedule/Booked", route: "/users/all"},
          ]
        },
        {
          title: "Payroll",
          subHeadings: [
            { title: "Compensation", route: "/users/all"},
            { title: "Time Sheet", route: "/users/all"},
          ]
        },
        {
          title: "Billing",
          subHeadings: [
            { title: "Summary", route: "report-Summary"},
            { title: "Sales", route: "/users/all"},
            { title: "Sales by Staff Member", route: "/users/all"},
            { title: "Account Receivable", route: "/users/all"},
            { title: "Credit", route: "/users/all"},
            { title: "Credit Memos", route: "/users/all"},
            { title: "Gift Cards", route: "/users/all"},
            { title: "Gift Cards Transactions", route: "/users/all"},
            { title: "Package & membership Sales", route: "/users/all"},
            { title: "Package & membership Usage", route: "/users/all"},
            { title: "Transactions", route: "/users/all"},
            { title: "Daily Transactions", route: "/users/all"},
            { title: "Applied & Unapplied Payments", route: "/users/all"},
            { title: "Replanish Payments Monthly Processing", route: "/users/all"},
            { title: "Replanish Payments Monthly Processing", route: "/users/all"},
            { title: "Replanish Payments Payouts", route: "/users/all"},
            { title: "Tips", route: "/users/all"},
            { title: "Adjustments", route: "/users/all"},
            { title: "Write Offs", route: "/users/all"},
            { title: "Products Performance", route: "/users/all"},
            { title: "Inventory", route: "/users/all"},
          ]
        },
        {
            title: "",
            subHeadings: [
              { title: "Activity Log", route: "/users/all"},
            ]
          },
      ];
      
  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <h2 className="fs-3 text-black-50 font-weight-bold">Reports</h2>
            {sidebarRoutes.map((item,index)=>{
                return <div key={index}>
                    <h6 className="fs-5 text-black-50 font-weight-semibold">{item.title}</h6>
                    {
                        item.subHeadings.map((subheadingItem,index)=>{
                            return <ListGroup key={index}>
                                <Link to={subheadingItem.route} className="text-decoration-none fs-6"><ListGroup.Item className="fs-6">{subheadingItem.title}</ListGroup.Item></Link>
                            </ListGroup>
                        })
                    }
                </div>
            })}
          </>
        }
      >
        <Outlet/>
      </AsideLayout>
    </>
  );
};

export default Reports;
