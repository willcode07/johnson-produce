import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { ORDER_EMAIL } from '@/lib/order';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          <Link href="/" className="flex items-center min-w-0">
            <Leaf className="h-8 w-8 text-green-500 shrink-0" />
            <span className="ml-2 text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Johnson Produce
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-8">
            <Link
              href="/#products"
              className="hidden sm:inline text-gray-700 hover:text-green-600 transition-colors"
            >
              In season
            </Link>
            <a
              href={`mailto:${ORDER_EMAIL}`}
              className="hidden md:inline text-gray-700 hover:text-green-600 transition-colors"
            >
              Contact
            </a>
            <Link
              href="/order"
              className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-sm sm:text-base"
            >
              Order
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
