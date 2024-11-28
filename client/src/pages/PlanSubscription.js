import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useAuthContext } from "../context/AuthUserContext";
import { toast } from "react-toastify";
import {
  fetchBillingPortal,
  fetchPricingPlans,
  createSubscriptionCheckoutSession,
  subscribeToFreePlan
} from "../Server";

const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="flex justify-center mb-6 gap-x-4">
    {["subscribed", "packages"].map((tab) => (
      <button
        key={tab}
        onClick={() => onTabChange(tab)}
        className={`px-6 py-2 font-semibold rounded-lg ${
          activeTab === tab
            ? "bg-cyan-500 text-white"
            : "bg-gray-200 text-gray-800"
        }`}
      >
        {tab === "subscribed" ? "Subscribed Plan" : "Available Plans"}
      </button>
    ))}
  </div>
);

const SubscriptionCard = ({
  title,
  price,
  description,
  features,
  buttonText,
  buttonAction,
  disabled,
}) => (
  <div className="rounded-lg shadow-lg bg-white text-black-500 p-8 w-96 transform hover:scale-105 transition-transform flex flex-col">
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-2xl font-semibold mb-6">{price}</p>
    <hr />
    <p className="text-lg font-light mb-6">{description}</p>
    <hr />
    <div className="text-left mb-8 space-y-4 flex-grow">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center text-gray-800 text-sm font-medium">
          <FaCheckCircle className="mr-2 text-cyan-500" />
          {feature}
        </li>
      ))}
    </div>
    <button
      onClick={buttonAction}
      disabled={disabled}
      className={`mt-auto font-bold py-2 px-4 rounded-lg transition ${
        disabled
          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
          : "bg-cyan-500 text-white hover:bg-cyan-600"
      }`}
    >
      {buttonText}
    </button>
  </div>
);

const PlanSubscription = () => {
  const { authUserState } = useAuthContext();
  const [activeTab, setActiveTab] = useState("subscribed");
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    endsAt: null,
    status: null,
    cancelAtPeriodEnd: false,
  });
  const [plans, setPlans] = useState([]);

  const employee = authUserState.user;

  const isSubscribedToFreePlan = employee.plan === "free";
  const isSubscribedToStripePlan = subscriptionDetails.status && subscriptionDetails.endsAt;

  useEffect(() => {
    const loadPricingPlans = async () => {
      try {
        const plansData = await fetchPricingPlans();
        setPlans(plansData.prices);
        setSubscriptionDetails({
          endsAt: plansData.subscription_ends_at,
          status: plansData.subscription_status,
          cancelAtPeriodEnd: plansData.cancel_at_period_end,
        });
      } catch (error) {
        toast.error("Unable to load pricing plans.");
      }
    };
    loadPricingPlans();
  }, []);

  const handleBillingPortal = async () => {
    try {
      const data = await fetchBillingPortal();
      if (data.url) window.open(data.url, "_blank");
      else toast.error(`Error opening billing portal: ${data.error}`);
    } catch (error) {
      toast.error(`Request failed: ${error}`);
    }
  };

  const handleSubscribe = async (priceId) => {
    try {
      const { url } = await createSubscriptionCheckoutSession(priceId);
      window.location.href = url;
    } catch (error) {
      toast.error("Unable to initiate checkout.");
    }
  };

  const handleFreePlanSubscription = async () => {
    try {
      await subscribeToFreePlan(employee.id);
      toast.success("Successfully subscribed to Free Plan!");
      window.location.reload();
    } catch (error) {
      toast.error("Error subscribing to Free Plan.");
    }
  };

  const freePlan = {
    name: "Replenish Provider",
    price: "Free",
    description: "Basic plan for individual providers.",
    features: ["Access to essential features", "No cost", "Easy to get started"],
    buttonText: isSubscribedToFreePlan ? "Subscribed" : "Subscribe Now",
    buttonAction: handleFreePlanSubscription,
  };

  return (
    <div className="w-5/6 mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
        Choose Your <span className="text-cyan-500">Subscription Plan</span>
      </h1>

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "subscribed" && (
        <div>
          {!authUserState.user.plan && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4">
                No Subscription Active
              </h2>
              <p className="text-lg text-yellow-700 mb-2">
                You don't have an active subscription. Choose a plan to get started with our services!
              </p>
              <button
                onClick={() => setActiveTab("packages")}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
              >
                Subscribe Now
              </button>
            </div>
          )}
          {isSubscribedToFreePlan && !isSubscribedToStripePlan && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-lg rounded-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                You are on the <span className="text-cyan-600 ml-2">Free Plan</span>
              </h2>
              <p className="text-lg text-gray-700 text-center mb-6">
                Enjoy limited features at no cost. Upgrade to unlock premium features and
                enhance your experience!
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveTab("packages")}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Upgrade to Paid Plan
                </button>
              </div>
            </div>
          )}
          {isSubscribedToStripePlan && (
            <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-center bg-green-100 text-green-700 p-4 rounded-lg shadow-md mb-6">
                <FaCheckCircle className="mr-3 text-green-600" />
                <h3 className="text-lg font-semibold">
                  You are subscribed to the Paid Plan
                </h3>
              </div>
              <div className="space-y-4 mb-2">
                <div className="text-lg text-gray-700">
                  {subscriptionDetails.cancelAtPeriodEnd === true ? (
                    <>
                      <strong>Subscription Ends At: </strong>
                      <span className="font-normal">
                        {
                          <span className="font-normal">
                            {subscriptionDetails.endsAt
                              ? new Date(subscriptionDetails.endsAt).toLocaleDateString()
                              : "N/A"
                            }
                          </span>
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Subscription Renewal Date: </strong>
                      <span className="font-normal">
                        {new Date(subscriptionDetails.endsAt).toLocaleDateString()} - Will be renewed after this date.
                      </span>
                    </>
                  )}
                </div>
                <div className="text-lg text-gray-700">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold capitalize ${
                      subscriptionDetails.cancelAtPeriodEnd
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}
                  >
                    {subscriptionDetails.cancelAtPeriodEnd
                      ? "Active (Cancelling at period end)"
                      : subscriptionDetails.status}
                  </span>
                </div>
              </div>
              <button
                onClick={handleBillingPortal}
                className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 w-full sm:w-auto my-2"
              >
                Manage Subscription
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "packages" && (
        <div className="flex flex-wrap justify-center gap-8 mt-5">
          <SubscriptionCard
            title={freePlan.name}
            price={freePlan.price}
            description={freePlan.description}
            features={freePlan.features}
            buttonText={freePlan.buttonText}
            buttonAction={freePlan.buttonAction}
            disabled={isSubscribedToFreePlan || isSubscribedToStripePlan}
          />

          {plans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              title={plan.product.name}
              price={`$${plan.unit_amount / 100}/mo`}
              description={plan.product.description}
              features={[
                "Premium features access",
                "Advanced tools for scaling your work",
                "Priority support",
              ]}
              buttonText="Subscribe Now"
              buttonAction={() => handleSubscribe(plan.id)}
              disabled={isSubscribedToStripePlan}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlanSubscription;
