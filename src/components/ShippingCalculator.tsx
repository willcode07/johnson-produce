'use client';

import { useState } from 'react';
import { MapPin, Truck } from 'lucide-react';

export default function ShippingCalculator() {
  const [zipCode, setZipCode] = useState('');
  const [shippingRates, setShippingRates] = useState<{service: string; price: number; days: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calculateShipping = async () => {
    if (!zipCode || zipCode.length < 5) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock shipping rates - this would integrate with UPS API
    setShippingRates([
      { service: 'Ground', price: 12.99, days: '3-5' },
      { service: '2-Day Air', price: 24.99, days: '2' },
      { service: 'Next Day Air', price: 39.99, days: '1' }
    ]);
    
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Truck className="h-6 w-6 text-amber-600" />
          <h3 className="text-xl font-bold text-gray-900">Shipping Calculator</h3>
        </div>
        <p className="text-gray-700">Get instant shipping rates to your location</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            <MapPin className="inline h-4 w-4 mr-1" />
            Enter your ZIP code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              maxLength={5}
            />
            <button
              onClick={calculateShipping}
              disabled={!zipCode || zipCode.length < 5 || isLoading}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Calculating...' : 'Get Rates'}
            </button>
          </div>
        </div>

        {shippingRates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Available Shipping Options:</h4>
            {shippingRates.map((rate, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{rate.service}</span>
                  <span className="text-sm text-gray-700 ml-2">
                    ({rate.days} business days)
                  </span>
                </div>
                <span className="font-bold text-amber-600">${rate.price}</span>
              </div>
            ))}
            <p className="text-xs text-gray-600 text-center">
              * Rates are estimates. Final shipping cost may vary based on package weight and dimensions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
