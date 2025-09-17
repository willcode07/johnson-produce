'use client';

import { useState } from 'react';
import { Product } from '@/lib/products';
import { Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
  selectedBoxSize: string;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <div className="w-full h-48 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
          <span className="text-6xl">🥭</span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        
        <p className="text-gray-700 mb-4 text-sm">
          {product.description}
        </p>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Price per lb:</span>
            <span className="font-semibold text-gray-900">${product.pricePerPound}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Season:</span>
            <span className="text-gray-900">{product.season}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Origin:</span>
            <span className="text-gray-900">{product.origin}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.availability}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {product.availability ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}
