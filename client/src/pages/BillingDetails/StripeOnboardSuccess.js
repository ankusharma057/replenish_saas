import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { stripeOnboardComplete } from "../../Server";

const StripeOnboardSuccess = () => {
    const { employee_id, stripe_account_id } = useParams();
    const calledRef = React.useRef(false);

    useEffect(() => {
        if (!calledRef.current) {
            completeOnboard();
            calledRef.current = true;
        }
    }, [employee_id, stripe_account_id]);
    const completeOnboard = async () => {
        try {
            let payload = {
                employee_id,
                stripe_account_id,
            };
            let response = await stripeOnboardComplete(payload);
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <div className="bg-gray-100 h-[89vh]">
            <div className="bg-white p-6  md:mx-auto h-[89vh] d-flex flex-column align-items-center justify-content-center">
                <svg
                    viewBox="0 0 24 24"
                    className="text-green-600 w-16 h-16 mx-auto my-6"
                >
                    <path
                        fill="currentColor"
                        d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
                    ></path>
                </svg>
                <div className="text-center">
                    <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">
                        Stripe Onboarding Done!
                    </h3>
                    <p className="text-gray-600 my-2">
                        Thank you for onboarding on stripe.
                    </p>
                    <p> Have a great day!</p>
                    <div className="py-10 text-center">
                        <Link
                            to="/invoices-to-pay"
                            state={"success"}
                            className="px-12 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
                        >
                            Check your invoices
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StripeOnboardSuccess;
