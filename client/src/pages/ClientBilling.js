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
import { X } from "lucide-react";


const ClientBilling = ({ stripeClientId, clientId }) => {
  const stripePromise = loadStripe(config.STRIPE_PUBLIC_KEY);
  const [creditCards, setCreditCards] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('purchases');
  const [clientSecret, setClientSecret] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkoutSessionUrl, setCheckoutSessionUrl] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [isCardDetailDrawerOpen, setIsCardDetailDrawerOpen] = useState(false);
  
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

  const tabContent = {
    purchases: <div>Purchases Content</div>,
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
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      fetch(`/api/client/stripe/card_success?session_id=${sessionId}`)
        .then((response) => {
          if (response.ok) {
            toast.success('Card Added Successfully')
            setActiveTab('creditCards')
            fetchCreditCards();
          } else {
            toast.error('Error adding credit card:', error);
          }
        })
        .catch((error) => toast.error('Error fetching payment details:', error));
      }
    navigate(`/customers/${clientId}`)
  }, [navigate]);

  useEffect(() => {
    if (checkoutSessionUrl) {
      window.location.href = checkoutSessionUrl;
    }
  }, [checkoutSessionUrl]);

  return (
    <div className="py-8">
      <div className="flex space-x-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`py-2 px-4 font-medium ${activeTab === tab.id
              ? 'border-b-2 border-cyan-500 text-cyan-500'
              : 'text-gray-500'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabContent[activeTab]}
      </div>

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