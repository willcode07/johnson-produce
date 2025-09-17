'use client';

import { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { products, boxSizes } from '@/lib/products';
import ZellePayment from './ZellePayment';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: {[key: string]: number};
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  selectedBoxSize: string;
}

export default function Cart({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem, 
  selectedBoxSize 
}: CartProps) {
  const [shippingZip, setShippingZip] = useState('');
  const [shippingRates, setShippingRates] = useState<{service: string; price: number; days: string}[]>([]);
  const [selectedShipping, setSelectedShipping] = useState('');
  const [showZellePayment, setShowZellePayment] = useState(false);
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
    const product = products.find(p => p.id === productId);
    return { product, quantity };
  }).filter(item => item.product);

  const selectedBox = boxSizes.find(box => box.id === selectedBoxSize);
  
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product!.pricePerPound * item.quantity);
  }, 0);

  const total = subtotal + (selectedBox?.basePrice || 0);
  const shippingCost = selectedShipping ? shippingRates.find(r => r.service === selectedShipping)?.price || 0 : 0;
  const finalTotal = total + shippingCost;

  const handleOrderComplete = (orderId: string) => {
    console.log('Order completed:', orderId);
    setShowZellePayment(false);
    onClose();
    // Clear cart or show success message
  };

  const calculateShipping = async () => {
    if (!shippingZip || shippingZip.length < 5) return;
    
    // This would integrate with UPS API
    // For now, we'll simulate rates
    setShippingRates([
      { service: 'Ground', price: 12.99, days: '3-5' },
      { service: '2-Day Air', price: 24.99, days: '2' },
      { service: 'Next Day Air', price: 39.99, days: '1' }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {cartItems.length === 0 ? (
            <p className="text-gray-700 text-center py-8 font-medium">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product!.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg">{product!.name}</h3>
                      <p className="text-sm text-gray-800 font-medium">${product!.pricePerPound}/lb</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(product!.id, quantity - 1)}
                          className="p-2 rounded-full hover:bg-gray-100 border border-gray-300"
                        >
                          <Minus className="h-4 w-4 text-gray-700" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 text-lg">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product!.id, quantity + 1)}
                          className="p-2 rounded-full hover:bg-gray-100 border border-gray-300"
                        >
                          <Plus className="h-4 w-4 text-gray-700" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          ${(product!.pricePerPound * quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => onRemoveItem(product!.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-900">Subtotal:</span>
                    <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-900">Box ({selectedBox?.name}):</span>
                    <span className="font-bold text-gray-900">${selectedBox?.basePrice}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Shipping ZIP Code
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={shippingZip}
                      onChange={(e) => setShippingZip(e.target.value)}
                      placeholder="Enter ZIP code"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium"
                    />
                    <button
                      onClick={calculateShipping}
                      className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 font-medium"
                    >
                      Get Rates
                    </button>
                  </div>
                </div>

                {shippingRates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">Shipping Options</h3>
                    <div className="space-y-3">
                      {shippingRates.map((rate, index) => (
                        <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="shipping"
                            value={rate.service}
                            checked={selectedShipping === rate.service}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="text-amber-600 w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 text-lg">{rate.service}</span>
                            <span className="text-sm text-gray-800 ml-2 font-medium">
                              ({rate.days} business days)
                            </span>
                          </div>
                          <span className="font-bold text-gray-900 text-lg">${rate.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">Customer Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={customerInfo.state}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={customerInfo.zip}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, zip: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">
                      ${finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowZellePayment(true)}
                  className="w-full bg-amber-600 text-white py-4 rounded-lg font-bold hover:bg-amber-700 transition-colors mt-6 text-lg"
                >
                  Pay with Zelle
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ZellePayment
        isOpen={showZellePayment}
        onClose={() => setShowZellePayment(false)}
        cart={cart}
        selectedBoxSize={selectedBoxSize}
        shippingCost={shippingCost}
        customerInfo={customerInfo}
        onOrderComplete={handleOrderComplete}
      />
    </div>
  );
}