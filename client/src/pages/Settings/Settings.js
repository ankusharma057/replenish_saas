import React from "react";
import AsideLayout from "../../components/Layouts/AsideLayout";
import { ListGroup } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";

const Settings = () => {
    const sidebarRoutes = [
        {
          title: "",
          subHeadings: [
            { title: "Dashboard", route: "/settings/dashboard"},
            { title: "Account Recommendations", route: "/users/all"},
            { title: "Jane Payments", route: "/users/all"},
          ]
        },
        {
          title: "Settings",
          subHeadings: [
            { title: "Clinic Info", route: "/users/all"},
            { title: "Locations", route: "/settings/locations"},
            { title: "Security", route: "/users/all"},
            { title: "Branding", route: "/users/all"},
            { title: "Emails", route: "/users/all"},
            { title: "Mass Welcome Email", route: "/users/all"},
            { title: "Online Booking", route: "/users/all"},
            { title: "Reminders & Notifications", route: "/users/all"},
            { title: "Schedule Settings", route: "/users/all"},
            { title: "Form & Survey", route: "/users/all"},
            { title: "Integrations", route: "/users/all"},
            { title: "Experimental Features", route: "/users/all"},
            { title: "Language", route: "/users/all"},
            { title: "Staff Permission", route: "/users/all"},
            { title: "Dashboard Permission", route: "/users/all"},
            { title: "Supervision", route: "/users/all"},
            { title: "Wait Lists", route: "/users/all"},
            { title: "Client Form Fields", route: "/users/all"},
            { title: "Test Client", route: "/users/all"},
          ]
        },
        {
          title: "Offerings",
          subHeadings: [
            { title: "Disciplines", route: "/users/all"},
            { title: "Treatments, Classes & Group Appointments", route: "/users/all"},
            { title: "Treatment Add-ons", route: "/users/all"},
            { title: "Products", route: "/users/all"},
            { title: "Packages & Memberships", route: "/users/all"},
          ]
        },
        {
          title: "Advanced Scheduling",
          subHeadings: [
            { title: "Room Scheduling", route: "report-Summary"},
            { title: "Resources", route: "/users/all"},
            { title: "Tags", route: "/users/all"},
          ]
        },
        {
            title: "Billing",
            subHeadings: [
              { title: "Billing Settings", route: "/users/all"},
              { title: "Reconciliation Date", route: "/users/all"},
              { title: "Adjustments", route: "/users/all"},
              { title: "Fees", route: "/users/all"},
              { title: "Payment Methods", route: "/users/all"},
              { title: "Income Categories", route: "/users/all"},
              { title: "Taxes", route: "/users/all"},
            ]
          },
        {
            title: "",
            subHeadings: [
              { title: "Merge History", route: "/users/all"},
            ]
          },
        {
            title: "",
            subHeadings: [
              { title: "Schedule an Import", route: "/users/all"},
            ]
          },
      ];
      
  return (
    <>
      <AsideLayout
        asideContent={
          <>
            <h2 className="fs-3 text-black-50 font-weight-bold">Settings</h2>
            {sidebarRoutes.map((item,index)=>{
                return <div key={index}>
                    <h6 className="fs-5 text-black-50 font-weight-light">{item.title}</h6>
                    {
                        item.subHeadings.map((subheadingItem,index)=>{
                            return <ListGroup key={index}>
                                <Link to={subheadingItem.route} className="text-decoration-none fs-6"><ListGroup.Item className="" style={{fontSize:"14px"}}>{subheadingItem.title}</ListGroup.Item></Link>
                          </ListGroup>
                        })
                    }
                </div>
            })}
          </>
        }
      >
        <div className="p-3 w-100">
        <Outlet/>
        </div>
      </AsideLayout>
    </>
  );
};

export default Settings;
