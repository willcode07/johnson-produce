import ProductCatalog from '@/components/ProductCatalog';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ShippingCalculator from '@/components/ShippingCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      <Hero />
      
      {/* Shipping Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md mx-auto">
          <ShippingCalculator />
        </div>
      </section>
      
      <ProductCatalog />
    </div>
  );
}
