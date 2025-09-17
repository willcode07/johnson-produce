'use client';

import { useState } from 'react';
import { products } from '@/lib/products';
import ProductCard from './ProductCard';
import BoxSizeSelector from './BoxSizeSelector';
import Cart from './Cart';

export default function ProductCatalog() {
  const [selectedBoxSize, setSelectedBoxSize] = useState('medium');
  const [cart, setCart] = useState<{[key: string]: number}>({});
  const [showCart, setShowCart] = useState(false);

  const addToCart = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Our Tropical Fruit Collection
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hand-picked, premium quality tropical fruits from our family farm
        </p>
      </div>

      <BoxSizeSelector 
        selectedBoxSize={selectedBoxSize}
        onBoxSizeChange={setSelectedBoxSize}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
            selectedBoxSize={selectedBoxSize}
          />
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setShowCart(true)}
            className="bg-amber-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
          >
            <span>View Cart ({cartCount})</span>
          </button>
        </div>
      )}

      <Cart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        selectedBoxSize={selectedBoxSize}
      />
    </div>
  );
}
