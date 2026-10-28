import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import OrderForm from '@/components/OrderForm';

export const metadata: Metadata = {
  title: 'Order — Johnson Produce',
  description: 'Order in-season tropical fruit from Johnson Produce for pickup or delivery.',
};

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Place an order</h1>
        <p className="text-gray-700 mb-8">
          Tell us what you want and whether you prefer pickup or delivery. We will confirm by phone.
        </p>
        <OrderForm />
        <p className="mt-6 text-center">
          <Link href="/#products" className="text-amber-800 underline font-medium">
            Back to fruit
          </Link>
        </p>
      </main>
    </div>
  );
}
