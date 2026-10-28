import Link from 'next/link';
import { products, inSeasonProducts, isInSeason } from '@/lib/products';
import ProductCard from './ProductCard';

export default function ProductCatalog() {
  const available = inSeasonProducts();
  const unavailable = products.filter((product) => !isInSeason(product));

  return (
    <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          In season now
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {available.map((product) => product.name).join(', ')}. Hand-picked tropical fruit from our family farm.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {available.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/order"
          className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
        >
          Order
        </Link>
      </div>

      {unavailable.length > 0 && (
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Out of season
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These fruits are not available to order right now.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {unavailable.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
