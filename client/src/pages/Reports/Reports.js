import React from "react";
import AsideLayout from "../../components/Layouts/AsideLayout";
import { ListGroup } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

const Reports = () => {
    const sidebarRoutes = [
        {
          title: "Clients",
          subHeadings: [
            { title: "Client List",route: "/reports"},
            { title: "Email Marketing subscribers", route: "/reports"},
            { title: "Top Clients", route: "/reports"},
            { title: "Invalid Email", route: "/reports"},
            { title: "Notes", route: "/reports"},
            { title: "Potential Description", route: "/reports"},
            { title: "Referral", route: "/reports"},
          ]
        },
        {
          title: "Appointments",
          subHeadings: [
            { title: "Appointments", route: "/reports"},
            { title: "Online Appointments", route: "/reports"},
            { title: "Client Retention", route: "/reports"},
            { title: "Rating & Reviews", route: "/reports"},
            { title: "Phone Reminders", route: "/reports"},
            { title: "Return Visit Reminders", route: "/reports"},
            { title: "Unschedule Clients(Last visit)", route: "/reports"},
            { title: "Wait List", route: "/reports"},
            { title: "Hour Schedule/Booked", route: "/reports"},
          ]
        },
        {
          title: "Payroll",
          subHeadings: [
            { title: "Compensation", route: "/reports"},
            { title: "Time Sheet", route: "/reports"},
          ]
        },
        {
          title: "Billing",
          subHeadings: [
            { title: "Summary", route: "report-Summary"},
            { title: "Sales", route: "/reports"},
            { title: "Sales by Staff Member", route: "/reports"},
            { title: "Account Receivable", route: "/reports"},
            { title: "Credit", route: "/reports"},
            { title: "Credit Memos", route: "/reports"},
            { title: "Gift Cards", route: "/reports"},
            { title: "Gift Cards Transactions", route: "/reports"},
            { title: "Package & membership Sales", route: "/reports"},
            { title: "Package & membership Usage", route: "/reports"},
            { title: "Transactions", route: "/reports"},
            { title: "Daily Transactions", route: "/reports"},
            { title: "Applied & Unapplied Payments", route: "/reports"},
            { title: "Replanish Payments Monthly Processing", route: "/reports"},
            { title: "Replanish Payments Monthly Processing", route: "/reports"},
            { title: "Replanish Payments Payouts", route: "/reports"},
            { title: "Tips", route: "/reports"},
            { title: "Adjustments", route: "/reports"},
            { title: "Write Offs", route: "/reports"},
            { title: "Products Performance", route: "/reports"},
            { title: "Inventory", route: "/reports"},
          ]
        },
        {
            title: "",
            subHeadings: [
              { title: "Activity Log", route: "/reports"},
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
