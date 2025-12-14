"use client"
import { useState, useEffect } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '@clerk/nextjs';
import { ShippingFormInputs } from '@repo/types';
import useCartStore from '@/stores/cartStore';

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51SZZDXSFTrAiNCHtp3xhBTQ7BnMd2GsHXoKCYTd4o7JR2TTgDjs3Nd6L6FjNLdKeuczFMJ6pzre2YxuYHLQBW8P000EVEjWKEJ");

const StripeEmbeddedCheckout = ({ shippingForm }: { shippingForm: ShippingFormInputs }) => {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { cart } = useCartStore();

    const fetchClientSecret = async (userToken: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL}/sessions/create-checkout-session`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cart,
                        shippingInfo: shippingForm
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.checkoutSessionClientSecret) {
                throw new Error('No client secret received from server');
            }
            
            // Decode the URL-encoded secret
            return decodeURIComponent(data.checkoutSessionClientSecret);
        } catch (err) {
            console.error('Error fetching client secret:', err);
            throw err;
        }
    };

    useEffect(() => {
        const initializeCheckout = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check authentication
                if (!isLoaded) return;
                if (!isSignedIn) {
                    setError('Please sign in to proceed with payment');
                    setLoading(false);
                    return;
                }

                const userToken = await getToken();
                if (!userToken) {
                    setError('Authentication failed. Please try again.');
                    setLoading(false);
                    return;
                }

                const secret = await fetchClientSecret(userToken);
                setClientSecret(secret);
            } catch (err) {
                console.error('Error initializing checkout:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize payment');
            } finally {
                setLoading(false);
            }
        };

        initializeCheckout();
    }, [getToken, isLoaded, isSignedIn, cart, shippingForm]);

    // Loading and error states
    if (!isLoaded) {
        return <div className="flex justify-center items-center min-h-64">Loading authentication...</div>;
    }

    if (!isSignedIn) {
        return <div className="flex justify-center items-center min-h-64 text-red-600">Please sign in to continue</div>;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span>Setting up secure checkout...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-red-600 text-center max-w-md">
                    <div className="font-semibold mb-2">Error</div>
                    <div className="mb-4">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="flex justify-center items-center min-h-64 text-red-600">
                Failed to initialize checkout session
            </div>
        );
    }

    return (
        <div className="w-full">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
};

export default StripeEmbeddedCheckout;