import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  createSaveCardCheckoutSession,
  fetchCreditCards as fetchCreditCardsAPI,
  removeCreditCard as removeCreditCardAPI,
  fetchConfig
} from "../Server";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { Mail, Printer, Settings, X } from "lucide-react";
import { Button, ButtonGroup, Col, Placeholder, Row } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import CountUp from 'react-countup';
const ClientBilling = ({ stripeClientId, clientId, setCurrentTab }) => {
  const hasFetchedSession = useRef(false);
  const [creditCards, setCreditCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');
  const [clientSecret, setClientSecret] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkoutSessionUrl, setCheckoutSessionUrl] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDetailDrawerOpen, setIsCardDetailDrawerOpen] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [flipLeftCardIndex, setflipLeftCardIndex] = useState(null)
  const [flipRightCardIndex, setFlipRightCardIndex] = useState(null)
  const topleftCardsData = [
    {
      id: 1,
      count: 6,
      label: "Total Booking",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 2,
      count: 0,
      label: "Upcomming appointment",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 3,
      count: 1,
      label: "No Shows",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
    {
      id: 4,
      count: 5,
      label: "Month since last visit",
      backLabel: "View Appointments",
      targetTab: "Appointments"
    },
  ];
  const topRightCardsData = [
    {
      id: 1,
      count: 685.00,
      label: "Total Booking",
      backLabel: "Recieve Payments",
      targetTab: "Appointments"
    },
    {
      id: 2,
      count: 0.00,
      label: "Upcomming appointment",
      backLabel: "View Credit",
      targetTab: "Billing"
    },
    {
      id: 3,
      count: 833.000,
      label: "No Shows",
      backLabel: "View Purchases",
      targetTab: "Billing"
    },
  ];
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawerHandler = () => {
    setIsOpen(!isOpen);
  };


  useEffect(() => {
      async function loadConfig() {
      const publicKey = await fetchConfig();
      setStripePublicKey(publicKey);
      }
      loadConfig();
  }, []);

  useEffect(() => {
      if (stripePublicKey) {
        setStripePromise(loadStripe(stripePublicKey));
      }
  }, [stripePublicKey]);
  
  const fetchCreditCards = async () => {
    try {
      const data = await fetchCreditCardsAPI(stripeClientId, clientId);
      setCreditCards(data);
    } catch (error) {
      handleError("Error fetching credit cards:", error);
    }
  };
  
  const removeCreditCard = async (paymentMethodId) => {
    try {
      await removeCreditCardAPI(paymentMethodId);
      setCreditCards(prevCards => prevCards.filter(card => card.id !== paymentMethodId));
      setIsCardDetailDrawerOpen(false);
      toast.success("Card Removed Successfully!");
    } catch (error) {
      handleError("Error removing credit card:", error);
    }
  };
  
  const handleError = (message, error) => {
    toast.error(`${message} ${error.message}`);
    setError(error.message);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'creditCards') {
      fetchCreditCards();
    }
  };

  const navigate = useNavigate()

  const toggleDrawer = async () => {
    try {
      const { clientSecret, checkoutUrl } = await createSaveCardCheckoutSession(stripeClientId, clientId);

      if (checkoutUrl) {
        setCheckoutSessionUrl(checkoutUrl);
      }

      if (clientSecret) {
        setClientSecret(clientSecret);
        setIsDrawerOpen(true);
      }
    } catch (error) {
      toast.error("Error creating checkout session:", error);
    }
  };


  const tabs = [
    { id: 'purchases', label: 'Purchases' },
    { id: 'payments', label: 'Payments' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'creditMemos', label: 'Credit Memos' },
    { id: 'giftCards', label: 'Gift Cards' },
    { id: 'creditCards', label: 'Credit Cards' },
    { id: 'packagesMemberships', label: 'Packages & Memberships' },
  ];
  const drawerStyles = {
    position: "absolute",
    top: "50px", // Adjust this to align with the button
    left: "0",
    width: "100%",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    transform: isOpen ? "translateY(0)" : "translateY(-100%)",
    transition: "transform 0.3s ease-in-out",
    zIndex: "10",
    padding: "10px",
  };
  const Purchases=()=>{
    return<div>
      <div  >
        <div className={"w-100 py-3 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div>
                <ButtonGroup style={{ border: "none" }}>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={toggleDrawerHandler}><Settings size={20} />Filter</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>0 Purchase Selected</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>Select All</Button>
                </ButtonGroup>
              </div>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div className='d-flex justify-content-end align-items-center gap-[10px] pr-3'>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Mail size={20} color='black' />Pay Balance</Button>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Printer size={20} color='#111' />Statement</Button>
              </div>
            </Col>
          </Row>
        </div>
        <div className={"w-100 py-3 rounded"} style={{ backgroundColor: "rgb(247 245 245)" }}>
          <Row>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div>
                <ButtonGroup style={{ border: "none" }}>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }} onClick={toggleDrawerHandler}><Settings size={20} />Filter</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>0 Purchase Selected</Button>
                  <Button className='bg-none d-flex align-items-center text-secondary gap-[5px]' style={{ backgroundColor: "transparent", border: "none" }}>Select All</Button>
                </ButtonGroup>
              </div>
            </Col>
            <Col xs={6} sm={6} md={6} lg={6}>
              <div className='d-flex justify-content-end align-items-center gap-[10px] pr-3'>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Mail size={20} color='black' />Pay Balance</Button>
                <Button variant="outline-secondary" className='border border-secondary w-[140px] bg-none d-flex align-items-center text-dark gap-[5px]'><Printer size={20} color='#111' />Statement</Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  }

  const tabContent = {
    purchases: <div><Purchases/></div>,
    payments: <div>Payments Content</div>,
    receipts: <div>Receipts Content</div>,
    creditMemos: <div>Credit Memos Content</div>,
    giftCards: <div>Gift Cards Content</div>,
    creditCards: (
      <div className="py-8">
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <button
              className="bg-[#22D3EE] text-white py-2 px-4 rounded hover:bg-[#1cb3cd] transition duration-200"
              onClick={toggleDrawer}
            >
              Add Credit Card
            </button>
          </div>
          <table className="min-w-full table-auto bg-white border border-gray-200 shadow-md">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 font-medium text-gray-600">Integration</th>
                <th className="px-4 py-2 font-medium text-gray-600">Nickname</th>
                <th className="px-4 py-2 font-medium text-gray-600">Card Type</th>
                <th className="px-4 py-2 font-medium text-gray-600">Card Number</th>
                <th className="px-4 py-2 font-medium text-gray-600">Expiry</th>
                <th className="px-4 py-2 font-medium text-gray-600">Last Used</th>
                <th className="px-4 py-2 font-medium text-gray-600">Locations</th>
                <th className="px-4 py-2 font-medium text-gray-600">Date Added</th>
                <th className="px-4 py-2 font-medium text-gray-600">Action</th>
              </tr>
            </thead>

            <tbody>
              {creditCards.length > 0 ? (
                creditCards.map((card) => (
                  <tr key={card.id} className="border-t">
                    <td className="px-4 py-2 text-gray-700">{card.name}</td>
                    <td className="px-4 py-2 text-gray-700">{card.nickname || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-700">{card.cardType}</td>
                    <td className="px-4 py-2 text-gray-700">**** **** **** {card.cardNumber}</td>
                    <td className="px-4 py-2 text-gray-700">{card.expiry}</td>
                    <td className="px-4 py-2 text-gray-700">{card.lastUsed || 'N/A'}</td>
                    <td className="px-4 py-2 text-gray-700">
                      <ul className="p-0">
                        {card.locations && card.locations.length > 0 ? (
                          card.locations.map((location, i) => (
                            <li key={i}>{location}</li>
                          ))
                        ) : (
                          <li>N/A</li>
                        )}
                      </ul>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{card.dateAdded}</td>
                    <td>
                      <button
                        className="border border-black px-2 py-1 rounded-md text-sm"
                        onClick={() => {
                          setSelectedCard(card);
                          setIsCardDetailDrawerOpen(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-2 text-center text-gray-700">No saved credit cards found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ),
    packagesMemberships: <div>Packages & Memberships Content</div>,
  };

  useEffect(() => {
    if (hasFetchedSession.current) return;
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      hasFetchedSession.current = true;
      fetch(`/api/client/stripe/card_success?session_id=${sessionId}`)
        .then((response) => {
          if (response.ok) {
            toast.success('Card Added Successfully');
            setActiveTab('creditCards');
            fetchCreditCards();

            urlParams.delete('session_id');
            navigate(`/customers/${clientId}?${urlParams.toString()}`, { replace: true });
          } else {
            toast.error('Error adding credit card');
          }
        })
        .catch((error) => toast.error('Error fetching payment details:', error));
    }
  }, [navigate]);

  useEffect(() => {
    if (checkoutSessionUrl) {
      window.location.href = checkoutSessionUrl;
    }
  }, [checkoutSessionUrl]);
  const handleLeftCardClick = (index) => {
    setflipLeftCardIndex(index)
};
const handleLeftCardOut = () => {
    setflipLeftCardIndex(null)
};
const handleRightCardClick = (index) => {
    setFlipRightCardIndex(index)
};
const handleRightCardOut = () => {
    setFlipRightCardIndex(null)
};
const handleClientProfileFlipCard=()=>{
  setCurrentTab("Appointments");
};
const formatAmount = (amount) => {
  const amountString = Number(amount).toFixed(2);
  const decimalPart = amountString.slice(-3);
  const mainAmount = amountString.slice(0, -3);
  return { mainAmount, decimalPart };
};


  return (
    <div className="">
      <Row xs={6} sm={6} md={6} lg={6} className="bg-white p-3 rounded">
        <Col className="w-50">
          <div className="d-flex justify-content-between align-items-center">
            {topleftCardsData.map((item, index) => {
              return <div onMouseOver={() => handleLeftCardClick(index)} onMouseOut={handleLeftCardOut} key={index} className="w-[110px] h-[110px] p-1">
                <ReactCardFlip isFlipped={flipLeftCardIndex === index} flipDirection="horizontal">
                  <div className="d-flex flex-column justify-content-between align-items-center">
                    <div className="h2 text-secondary">
                      <CountUp end={item.count} />
                    </div>
                    <div className="h6 text-center text-muted">{item.label}</div>
                  </div>
                  <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                    <p className=" fs-6 mb-0 text-center text-white">{item.backLabel}</p>
                  </div>
                </ReactCardFlip>
              </div>
            })}
          </div>
        </Col>
        <Col className="w-50">
          <div className="d-flex justify-content-end align-items-center gap-[40px]">
            {topRightCardsData.map((item, index) => {
              const { mainAmount, decimalPart } = formatAmount(item.count);
              return <div onMouseOver={() => handleRightCardClick(index)} onMouseOut={handleRightCardOut} key={index} className="w-[110px] h-[110px] p-1">
                <ReactCardFlip isFlipped={flipRightCardIndex === index} flipDirection="horizontal">
                  <div className="d-flex flex-column justify-content-between align-items-center">
                    <div className="h2 text-secondary d-flex justify-content-start">
                      <span className="fs-6 mt-[4px]">$</span>
                      <span className="large"> <CountUp end={mainAmount} />{ }</span>
                      <span className="fs-6  mt-[4px]">{decimalPart}</span>
                    </div>
                    <div className="h6 text-center text-muted">{item.label}</div>
                  </div>
                  <div className="w-[110px] h-[110px] d-flex justify-content-between align-items-center rounded" style={{ backgroundColor: "#0dcaf0" }} onClick={() => handleClientProfileFlipCard(item.targetTab)}>
                    <p className="w-100 fs-6 mb-0 text-center text-white">{item.backLabel}</p>
                  </div>
                </ReactCardFlip>
              </div>
            })}
          </div>
        </Col>
      </Row>
      <Row xs={6} sm={6} md={6} lg={6} className="bg-white p-3 rounded mt-2">
        <Col xs={12} sm={12} md={12} lg={12}>
          <div className='d-flex justify-content-between align-items-center'>
            <div className="flex space-x-4 w-100" >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-auto p-1 font-medium ${activeTab === tab.id
                    ? 'border-b-2 border-cyan-500 text-cyan-500'
                    : 'text-gray-500'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Button size='sm' className='w-[130px] h-[35px]'>New Purchase</Button>
          </div>
          <div className="mt-4 w-100">
            {tabContent[activeTab]}
          </div>
        </Col>
      </Row>
      <div className={`fixed top-0 right-0 h-full overflow-y-auto w-full lg:w-3/4 z-10 bg-[#EDEDED] shadow-lg p-6 transform transition-transform duration-300 ${isCardDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end items-center mb-4 pt-20">
          <button
            className="text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={() => setIsCardDetailDrawerOpen(false)}
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </div>

        {selectedCard ? (
          <div className='bg-white rounded-md p-4'>
            <h2 className="text-xl font-semibold text-[#696977]">MasterCard ending in {selectedCard.cardNumber.slice(-4)}</h2>

            <div className="grid grid-cols-4 gap-x-4 border-gray-200 pt-2">
              <div className="col-span-4">
                <span className="text-sm text-[#696977]">Card Number</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">XXXX XXXX XXXX {selectedCard.cardNumber.slice(-4)}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Expiry Month</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">{selectedCard.expiry.slice(0, 2)}</p>
              </div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Expiry Year</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">{selectedCard.expiry.slice(-4)}</p>
              </div>
              <div className="col-span-1"></div>
              <div className="col-span-1">
                <span className="text-sm text-[#696977]">Security Code</span>
                <p className="bg-[#EEEEEE] border shadow p-2 rounded-md">CCV</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
                onClick={() => removeCreditCard(selectedCard.paymentMethodId)}
                aria-label="Remove Credit Card"
              >
                Remove Credit Card
              </button>
            </div>
          </div>
        ) : (
          <p>Loading card details...</p>
        )}
      </div>

      <div className={`fixed top-0 right-0 h-full overflow-y-auto w-full lg:w-1/2 z-10 bg-white shadow-lg p-6 transform transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-end items-center mb-4 pt-20">
          <button
            className="text-gray-500 hover:text-red-500 focus:outline-none"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </div>

        {clientSecret ? (
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        ) : (
          <p>Loading payment details...</p>
        )}
      </div>
    </div>
  );
};

export default ClientBilling;