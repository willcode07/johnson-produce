'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Lock } from 'lucide-react';
import { products } from '@/lib/products';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  cart: {[key: string]: number};
  selectedBoxSize: string;
  shippingCost: number;
  onOrderComplete: (orderId: string) => void;
}

interface CheckoutFormProps {
  total: number;
  onOrderComplete: (orderId: string) => void;
  onClose: () => void;
}

function CheckoutForm({ total, onOrderComplete, onClose }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: total,
          currency: 'usd',
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        setError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onOrderComplete(paymentIntent.id);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-lg p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Secure payment powered by Stripe
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay ${total.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function Checkout({ 
  isOpen, 
  onClose, 
  cart, 
  selectedBoxSize, 
  shippingCost, 
  onOrderComplete 
}: CheckoutProps) {
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    // This would normally fetch from products array
    return { productId, quantity };
  });

  const subtotal = 50; // This would be calculated from cart
  const boxPrice = selectedBoxSize === 'small' ? 15.99 : selectedBoxSize === 'medium' ? 24.99 : 34.99;
  const total = subtotal + boxPrice + shippingCost;

  const handleOrderComplete = async (orderId: string) => {
    try {
      // Calculate order details
      const cartItems = Object.entries(cart).map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.name || 'Unknown Product',
          quantity,
          pricePerPound: product?.pricePerPound || 0,
        };
      });

      const subtotal = cartItems.reduce((sum, item) => sum + (item.pricePerPound * item.quantity), 0);
      const boxPrice = selectedBoxSize === 'small' ? 15.99 : selectedBoxSize === 'medium' ? 24.99 : 34.99;
      const total = subtotal + boxPrice + shippingCost;

      // Save order to Notion
      const orderData = {
        orderId,
        customerInfo,
        items: cartItems,
        boxSize: selectedBoxSize,
        subtotal,
        boxPrice,
        shippingCost,
        total,
        paymentIntentId: orderId,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch('/api/orders/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        console.log('Order saved to Notion successfully');
      } else {
        console.error('Failed to save order to Notion');
      }

      onOrderComplete(orderId);
    } catch (error) {
      console.error('Error completing order:', error);
      onOrderComplete(orderId); // Still complete the order even if Notion save fails
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Checkout
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={customerInfo.state}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={customerInfo.zip}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, zip: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment</h3>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                total={total}
                onOrderComplete={handleOrderComplete}
                onClose={onClose}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}
