'use client';

import { boxSizes } from '@/lib/products';

interface BoxSizeSelectorProps {
  selectedBoxSize: string;
  onBoxSizeChange: (boxSize: string) => void;
}

export default function BoxSizeSelector({ selectedBoxSize, onBoxSizeChange }: BoxSizeSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Box Size</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {boxSizes.map((box) => (
          <div
            key={box.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedBoxSize === box.id
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 hover:border-amber-200'
            }`}
            onClick={() => onBoxSizeChange(box.id)}
          >
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">{box.name}</h4>
              <p className="text-sm text-gray-800 mb-2">
                {box.dimensions.length}&quot; × {box.dimensions.width}&quot; × {box.dimensions.height}&quot;
              </p>
              <p className="text-sm text-gray-800 mb-2">
                Up to {box.maxItems} items • {box.weight} lbs
              </p>
              <p className="text-lg font-bold text-amber-600">
                ${box.basePrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
