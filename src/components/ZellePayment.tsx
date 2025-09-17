'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';
import { products } from '@/lib/products';

interface ZellePaymentProps {
  isOpen: boolean;
  onClose: () => void;
  cart: {[key: string]: number};
  selectedBoxSize: string;
  shippingCost: number;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  onOrderComplete: (orderId: string) => void;
}

export default function ZellePayment({ 
  isOpen, 
  onClose, 
  cart, 
  selectedBoxSize, 
  shippingCost, 
  customerInfo,
  onOrderComplete 
}: ZellePaymentProps) {
  const [orderId, setOrderId] = useState('');
  const [isOrderSaved, setIsOrderSaved] = useState(false);

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

  // Generate order ID and save to Notion when component mounts
  useEffect(() => {
    if (isOpen && !orderId) {
      const newOrderId = `JP-${Date.now()}`;
      setOrderId(newOrderId);
      saveOrderToNotion(newOrderId);
    }
  }, [isOpen, orderId]);

  const saveOrderToNotion = async (orderId: string) => {
    try {
      const orderData = {
        orderId,
        customerInfo,
        items: cartItems,
        boxSize: selectedBoxSize,
        subtotal,
        boxPrice,
        shippingCost,
        total,
        paymentIntentId: 'Zelle Payment',
        status: 'pending',
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
        setIsOrderSaved(true);
      } else {
        console.error('Failed to save order to Notion');
      }
    } catch (error) {
      console.error('Error saving order to Notion:', error);
    }
  };

  const handlePaymentComplete = () => {
    onOrderComplete(orderId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            Complete Payment with Zelle
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Box ({selectedBoxSize}):</span>
                <span className="font-medium">${boxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Shipping:</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Order ID: {orderId}</p>
          </div>

          {/* Zelle Payment Instructions */}
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Send Payment via Zelle
              </h3>
              <p className="text-gray-700 mb-4">
                Send <span className="font-bold text-lg">${total.toFixed(2)}</span> to:
              </p>
              
              <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mb-4">
                <p className="text-lg font-mono font-bold text-blue-600">
                  johnsonproduce@email.com
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Johnson Produce
                </p>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-gray-200 inline-block">
                <div className="w-40 h-40 sm:w-48 sm:h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">QR Code</span>
                    </div>
                    <p className="text-xs text-gray-500">Scan with Zelle app</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>• Include Order ID: <span className="font-mono font-bold">{orderId}</span></p>
                <p>• Payment will be confirmed within 24 hours</p>
                <p>• You'll receive email confirmation once processed</p>
              </div>
            </div>

            {/* Order Status */}
            {isOrderSaved && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Order saved! Check your email for confirmation.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                I'll Pay Later
              </button>
              <button
                onClick={handlePaymentComplete}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Clock className="h-4 w-4" />
                I've Sent Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
