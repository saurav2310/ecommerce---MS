"use client"

import { ShippingFormInputs } from "@repo/types";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FormEvent, useState, useEffect } from "react";

const CheckoutForm = ({ shippingForm }: { shippingForm: ShippingFormInputs }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canSubmit, setCanSubmit] = useState(false);

    // Check if Stripe is loaded and ready
    useEffect(() => {
        if (stripe && elements) {
            setCanSubmit(true);
        }
    }, [stripe, elements]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!stripe || !elements) {
            setError("Payment system is not ready. Please try again.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                    payment_method_data: {
                        billing_details: {
                            email: shippingForm.email,
                            name: shippingForm.name,
                            phone: shippingForm.phone,
                            address: {
                                line1: shippingForm.address,
                                city: shippingForm.city,
                                country: "India" // You might want to make this dynamic
                            }
                        }
                    }
                },
            });

            if (stripeError) {
                setError(stripeError.message || "An error occurred during payment.");
            }
            // If successful, the user will be redirected to return_url
        } catch (err) {
            console.error("Payment error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium">Name:</span>
                        <p>{shippingForm.name}</p>
                    </div>
                    <div>
                        <span className="font-medium">Email:</span>
                        <p>{shippingForm.email}</p>
                    </div>
                    <div>
                        <span className="font-medium">Phone:</span>
                        <p>{shippingForm.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="font-medium">Address:</span>
                        <p>{shippingForm.address}, {shippingForm.city}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-6">Payment Details</h3>
                
                <div className="mb-6">
                    <PaymentElement 
                        options={{ 
                            layout: 'accordion',
                            defaultValues: {
                                billingDetails: {
                                    name: shippingForm.name,
                                    email: shippingForm.email,
                                    phone: shippingForm.phone,
                                    address: {
                                        line1: shippingForm.address,
                                        city: shippingForm.city,
                                    }
                                }
                            }
                        }} 
                    />
                </div>
                
                <button 
                    type="submit" 
                    disabled={!canSubmit || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
                >
                    {loading ? 'Processing...' : 'Pay Now'}
                </button>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}
            </div>
        </form>
    );
}

export default CheckoutForm;