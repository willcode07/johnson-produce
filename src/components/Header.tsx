'use client';

import { ShoppingCart, Leaf } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [cartCount] = useState(0);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-500" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">
              Johnson Produce
            </h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-green-500 transition-colors">
              Products
            </a>
            <a href="#" className="text-gray-700 hover:text-green-500 transition-colors">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-green-500 transition-colors">
              Contact
            </a>
          </nav>

          <button className="relative p-2 text-gray-700 hover:text-green-500 transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
