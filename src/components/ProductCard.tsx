import Link from 'next/link';
import { Product, formatOptionPrice, formatProductPrice, hasChoiceOptions, isInSeason, productOptions } from '@/lib/products';
import ProductImageSlider from './ProductImageSlider';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const available = isInSeason(product);
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${available ? '' : 'opacity-80'}`}>
      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
        <ProductImageSlider
          images={productImages}
          primaryImageIndex={product.primaryImageIndex ?? 0}
          productName={product.name}
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <p className="text-gray-700 mb-4 text-sm">
          {product.description}
        </p>

        <div className="space-y-2 mb-4 text-sm">
          {hasChoiceOptions(product) ? (
            <div className="space-y-2">
              <span className="text-gray-700">Price</span>
              <ul className="space-y-2">
                {productOptions(product).map((option) => (
                  <li key={option.id} className="rounded-lg bg-green-50 px-3 py-2">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium text-gray-900">{option.name}</span>
                      <span className="font-semibold text-gray-900 text-right">{formatOptionPrice(option)}</span>
                    </div>
                    {option.detail ? (
                      <p className="text-gray-600 mt-1">{option.detail}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex justify-between gap-4">
              <span className="text-gray-700">Price</span>
              <span className="font-semibold text-gray-900 text-right">{formatProductPrice(product)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Season</span>
            <span className={available ? 'text-green-700 font-medium' : 'text-gray-500'}>
              {product.season}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-700">Origin</span>
            <span className="text-gray-900">{product.origin}</span>
          </div>
        </div>

        {available ? (
          <Link
            href={`/order?item=${product.id}`}
            className="block w-full text-center bg-amber-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Order
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full bg-gray-200 text-gray-600 px-4 py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            Out of season
          </button>
        )}
      </div>
    </div>
  );
}
