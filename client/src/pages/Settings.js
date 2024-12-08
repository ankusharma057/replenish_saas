
import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import AsideLayout from "../components/Layouts/AsideLayout";
import { useAsideLayoutContext } from "../context/AsideLayoutContext";
import { useAuthContext } from "../context/AuthUserContext";
import Vendors from './Vendors';
import Payments from './Payments'; 
import Approvals from './Approvals';
import { Box } from "lucide-react";
import MapComponent from '../components/MapComponent';

const Settings = () => {
  const { authUserState } = useAuthContext();
  const { collapse } = useAsideLayoutContext();
  const [currentTab, setCurrentTab] = useState("locations");
  const [locations, setLocations] = useState([]); 
  const [showModal, setShowModal] = useState(false); 
  const [newLocation, setNewLocation] = useState({
    title: "",
    shortDescription: "",
    longDescription: "",
    email: "",
    phone: "",
    fax: "",
    streetAddress: "",
    apartmentSuite: "",
    city: "",
    country: "",
    province: "",
    postalCode: "",
    legalName: "Replenish",
    businessNumber: "",
    useBillingAddress: false,
    onlineBooking: false,
  });
  const [locationFilter, setLocationFilter] = useState('Active'); 

  useEffect(() => {
    setLocations([
      { title: 'Location 1', address: '123 Main St, City, Country' },
      { title: 'Location 2', address: '456 Another St, City, Country' },
    ]);
  }, []);

  const handleCreateLocation = () => {
    setLocations([...locations, newLocation]);
    setShowModal(false);
  };

  const handleFilterChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const countries = ["USA", "Canada", "UK", "Australia"]; 

  return (
    <AsideLayout
      asideContent={
        <div className="bg-white p-2 min-h-[90%] flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-center text-cyan-600">Settings</h1>
          {['Dashboard', 'Locations', 'Security', 'Branding'].map((item, index) => (
            <div
              key={index}
              role="button"
              onClick={() => {
                setCurrentTab(item.toLowerCase());
                if (window.innerWidth < 1024) {
                  collapse();
                }
              }}
              className={`p-2 flex gap-x-2 border-b cursor-pointer hover:bg-gray-200 rounded-md ${
                currentTab === item.toLowerCase() && 'bg-gray-200'
              }`}
            >
              <Box />
              {item}
            </div>
          ))}
        </div>
      }
    >
      <div className="container mt-4">
        {currentTab === "locations" && (
          <>
            <h2 className="text-center mb-4" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Locations</h2>
            <p className="text-center text-sm">
              Learn more about <a href="/locations" className="text-cyan-600">Locations</a>
            </p>

            <div className="d-flex justify-content-between mb-4">
              <Button variant="primary" onClick={() => setShowModal(true)}>
                + Create Location
              </Button>

              <div className="d-flex gap-2">
                <Form.Control as="select" value={locationFilter} onChange={handleFilterChange}>
                  <option>Active</option>
                  <option>All</option>
                  <option>Archived</option>
                </Form.Control>
                <Button variant="secondary">Reorder</Button>
              </div>
            </div>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location, index) => (
                  <tr key={index}>
                    <td><strong>{location.title}</strong></td>
                    <td><small>{location.address}</small></td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {showModal && (
              <div className="modal show" style={{ display: 'block' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Create New Location</h5>
                      <Button variant="close" onClick={() => setShowModal(false)} />
                    </div>
                    <div className="modal-body">
                      <Form>
                        <Form.Group controlId="locationTitle">
                          <Form.Label>Location Title</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter title"
                            required
                            value={newLocation.title}
                            onChange={(e) => setNewLocation({ ...newLocation, title: e.target.value })}
                          />
                        </Form.Group>

                        <h5 className="mt-4">Client Communication</h5>
                        <Form.Group controlId="shortDescription">
                          <Form.Label>Short Description</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter short description"
                            value={newLocation.shortDescription}
                            onChange={(e) => setNewLocation({ ...newLocation, shortDescription: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="longDescription">
                          <Form.Label>Long Description</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter long description"
                            value={newLocation.longDescription}
                            onChange={(e) => setNewLocation({ ...newLocation, longDescription: e.target.value })}
                          />
                        </Form.Group>

                        <h5 className="mt-4">Contact Info</h5>
                        <Form.Group controlId="email">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={newLocation.email}
                            onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="phone">
                          <Form.Label>Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter phone number"
                            value={newLocation.phone}
                            onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="fax">
                          <Form.Label>Fax</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter fax"
                            value={newLocation.fax}
                            onChange={(e) => setNewLocation({ ...newLocation, fax: e.target.value })}
                          />
                        </Form.Group>

                        <h5 className="mt-4">Location Address & Map</h5>
                        <Form.Group controlId="streetAddress">
                          <Form.Label>Street Address</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter street address"
                            required
                            value={newLocation.streetAddress}
                            onChange={(e) => setNewLocation({ ...newLocation, streetAddress: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="apartmentSuite">
                          <Form.Label>Apartment / Suite</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter apartment/suite"
                            value={newLocation.apartmentSuite}
                            onChange={(e) => setNewLocation({ ...newLocation, apartmentSuite: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="city">
                          <Form.Label>City</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter city"
                            value={newLocation.city}
                            onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="country">
                          <Form.Label>Country</Form.Label>
                          <Form.Control
                            as="select"
                            value={newLocation.country}
                            onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                          >
                            {countries.map((country, index) => (
                              <option key={index} value={country}>
                                {country}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="province">
                          <Form.Label>Province</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter province"
                            value={newLocation.province}
                            onChange={(e) => setNewLocation({ ...newLocation, province: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="postalCode">
                          <Form.Label>Postal/ZIP Code</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter postal/zip code"
                            required
                            value={newLocation.postalCode}
                            onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="map">
                          <Form.Label>Map</Form.Label>
                          <MapComponent newLocation={newLocation} setNewLocation={setNewLocation} />
                        </Form.Group>

                        <h5 className="mt-4">Billing Information</h5>
                        <Form.Group controlId="legalName">
                          <Form.Label>Legal Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={newLocation.legalName}
                            onChange={(e) => setNewLocation({ ...newLocation, legalName: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="businessNumber">
                          <Form.Label>Business/Tax Number</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter business/tax number"
                            value={newLocation.businessNumber}
                            onChange={(e) => setNewLocation({ ...newLocation, businessNumber: e.target.value })}
                          />
                        </Form.Group>
                        <Form.Group controlId="useBillingAddress">
                          <Form.Check
                            type="checkbox"
                            label="Use my location address for billing"
                            checked={newLocation.useBillingAddress}
                            onChange={() => setNewLocation({ ...newLocation, useBillingAddress: !newLocation.useBillingAddress })}
                          />
                        </Form.Group>

                        <h5 className="mt-4">Online Booking</h5>
                        <Form.Group controlId="onlineBooking">
                          <Form.Check
                            type="checkbox"
                            label="Location available to be booked online"
                            checked={newLocation.onlineBooking}
                            onChange={() => setNewLocation({ ...newLocation, onlineBooking: !newLocation.onlineBooking })}
                          />
                        </Form.Group>
                      </Form>
                    </div>
                    <div className="modal-footer">
                      <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                      <Button variant="primary" onClick={handleCreateLocation}>Save</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {currentTab === "dashboard" && <Vendors />}
        {currentTab === "security" && <Approvals />}
        {currentTab === "branding" && <Payments />}
      </div>
    </AsideLayout>
  );
};

export default Settings;
