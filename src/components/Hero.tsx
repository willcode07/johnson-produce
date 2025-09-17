export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-100 to-green-200 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fresh Tropical Fruits
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Premium quality tropical fruits delivered fresh to your door. 
            From our family farm to your family table.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-800 transition-colors">
              Shop Now
            </button>
            <button className="border-2 border-amber-700 text-amber-700 px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 hover:text-white transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
