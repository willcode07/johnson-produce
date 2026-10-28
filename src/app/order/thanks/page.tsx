import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import { ORDER_EMAIL } from '@/lib/order';

export const metadata: Metadata = {
  title: 'Order sent — Johnson Produce',
  description: 'Your produce order was sent to Johnson Produce.',
};

export default function OrderThanksPage() {
  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8" role="status">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you</h1>
          <p className="text-gray-700 mb-4">
            Your order was sent to Johnson Produce. We will confirm by phone.
          </p>
          <p className="text-gray-700 mb-6">
            If you do not hear back, email{' '}
            <a href={`mailto:${ORDER_EMAIL}`} className="text-amber-800 underline font-medium">
              {ORDER_EMAIL}
            </a>
            .
          </p>
          <Link
            href="/order"
            className="inline-block bg-amber-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
          >
            Send another order
          </Link>
        </div>
      </main>
    </div>
  );
}
