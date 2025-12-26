'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageSliderProps {
  images: string[];
  primaryImageIndex?: number;
  productName: string;
}

export default function ProductImageSlider({ 
  images, 
  primaryImageIndex = 0, 
  productName 
}: ProductImageSliderProps) {
  // Ensure primaryImageIndex is valid
  const validPrimaryIndex = Math.max(0, Math.min(primaryImageIndex, images.length - 1));
  const [currentIndex, setCurrentIndex] = useState(validPrimaryIndex);

  // Update current index if primaryImageIndex changes
  useEffect(() => {
    setCurrentIndex(validPrimaryIndex);
  }, [validPrimaryIndex]);

  // If no images or only one image, just show it
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
        <span className="text-6xl">🥭</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="w-full h-48 bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center overflow-hidden relative">
        <img 
          src={images[0]} 
          alt={productName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
            if (fallback) {
              (fallback as HTMLElement).style.display = 'flex';
            }
          }}
        />
        <div className="image-fallback absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
          <span className="text-6xl">🥭</span>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-48 bg-gradient-to-br from-green-50 to-amber-50 overflow-hidden group">
      {/* Main Image */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={image} 
              alt={`${productName} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.image-fallback');
                if (fallback) {
                  (fallback as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="image-fallback absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
              <span className="text-6xl">🥭</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Image Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-6 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Image Counter */}
      <div className="absolute top-2 right-2 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
}

