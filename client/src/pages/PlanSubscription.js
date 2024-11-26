import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useAuthContext } from "../context/AuthUserContext";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";

const PlanSubscription = () => {
  const { authUserState } = useAuthContext();
  const [stripePublicKey, setStripePublicKey] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [plans, setPlans] = useState([]);

  const employee = authUserState.user;

  const isSubscribedToFreePlan =
    employee.plan === "free" &&
    !employee.subscription_status &&
    !employee.subscription_ends_at;

  const isSubscribedToStripePlan =
    employee.plan &&
    employee.subscription_status &&
    employee.subscription_ends_at;


  const handleFreePlanSubscription = async () => {
    try {
      const employeeId = employee.id;
      const response = await fetch(`api/employees/${employeeId}/update_plan`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan: "free" }),
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe to Free Plan");
      }

      toast.success("Successfully subscribed to Free Plan!");
      window.location.reload();
    } catch (error) {
      toast.error("There was an error subscribing to the Free Plan.", error.message);
    }
  };

  const freePlan = [
    {
      name: "Replenish Provider",
      price: "Free",
      description: "Basic plan for individual providers.",
      features: ["Access to essential features", "No cost", "Easy to get started"],
      buttonText: isSubscribedToFreePlan ? "Subscribed" : "Subscribe Now",
      buttonAction: handleFreePlanSubscription,
    },
  ];

  return (
    <div className="w-3/4 mx-auto p-8">
      <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-800">
        Choose Your <span className="text-cyan-500">Subscription Plan</span>
      </h1>
      <hr />
      {authUserState.user.plan === "free" && (
        <div className="flex items-center bg-green-100 text-green-700 p-4 rounded-lg shadow-md mb-6">
          <FaCheckCircle className="mr-3 text-green-600" />
          <h3 className="text-lg font-semibold">You are subscribed to the Free Plan</h3>
        </div>
      )}

      <hr />
      <div className="flex flex-wrap justify-center gap-8 mt-5">
        {freePlan.map((plan, index) => (
          <div
            key={index}
            className="rounded-lg shadow-lg bg-white text-black-500 p-8 w-96 transform hover:scale-105 transition-transform flex flex-col"
          >
            <h2 className="text-3xl font-bold mb-4">{plan.name}</h2>
            <p className="text-2xl font-semibold mb-6">{plan.price}</p>
            <hr />
            <p className="text-lg font-light mb-6">{plan.description}</p>
            <hr />
            <div className="text-left mb-8 space-y-4 flex-grow">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <FaCheckCircle color="#22d3ee" className="mr-2" />
                  {feature}
                </li>
              ))}
            </div>
            <button
              onClick={plan.buttonAction}
              disabled={isSubscribedToFreePlan || isSubscribedToStripePlan}
              className={`mt-auto font-bold py-2 px-4 rounded-lg transition ${
                isSubscribedToFreePlan || isSubscribedToStripePlan
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-cyan-500 text-white hover:bg-cyan-600"
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanSubscription;