export interface Product {
  id: string;
  name: string;
  description: string;
  image: string; // Deprecated - kept for backward compatibility
  images?: string[]; // Array of image URLs
  primaryImageIndex?: number; // Index of the primary image to show first (default: 0)
  pricePerPound: number;
  availability: boolean;
  season: string;
  origin: string;
}

/**
 * Get the images array for a product, with primary image first
 * @param product - The product object
 * @returns Array of image URLs with primary image at index 0
 */
export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  // Fallback to single image
  return [product.image];
}

/**
 * Get the primary image index for a product
 * @param product - The product object
 * @returns The index of the primary image (default: 0)
 */
export function getPrimaryImageIndex(product: Product): number {
  if (product.primaryImageIndex !== undefined) {
    const images = getProductImages(product);
    // Ensure the index is valid
    return Math.max(0, Math.min(product.primaryImageIndex, images.length - 1));
  }
  return 0;
}

export interface BoxSize {
  id: string;
  name: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number; // in pounds
  maxItems: number;
  basePrice: number;
}

export const products: Product[] = [
  {
    id: 'mango',
    name: 'Mango',
    description: 'Sweet, juicy tropical mangoes perfect for eating fresh or in smoothies',
    image: '/images/mango.jpg',
    images: ['/images/mango-tree.jpg', '/images/mango-tree-2.jpg'],
    primaryImageIndex: 2,
    pricePerPound: 4.99,
    availability: true,
    season: 'May - September',
    origin: 'Florida'
  },
  {
    id: 'avocado',
    name: 'Avocado',
    description: 'Creamy, rich avocados ideal for guacamole, toast, or salads',
    image: '/images/avocado.jpg',
    images: ['/images/avocado-box.jpg', '/images/avocado-tree.jpg', '/images/avocado-slice.jpg'],
    primaryImageIndex: 1,
    pricePerPound: 3.99,
    availability: true,
    season: 'Year Round',
    origin: 'California'
  },
  {
    id: 'ackee',
    name: 'Ackee',
    description: 'Jamaica\'s national fruit, perfect for traditional ackee and saltfish',
    image: '/images/ackee.jpg',
    images: ['/images/ackee.jpg', '/images/screenshot_20251117_114143_photos.jpg', '/images/20250816_111749.jpg'],
    primaryImageIndex: 1,
    pricePerPound: 6.99,
    availability: true,
    season: 'January - March, June - August',
    origin: 'Jamaica'
  },
  {
    id: 'jackfruit',
    name: 'Jackfruit',
    description: 'Large, sweet tropical fruit perfect as a meat substitute when young',
    image: '/images/jackfruit.jpg',
    images: ['/images/20230521_102439.jpg', '/images/20230521_102419.jpg', '/images/20210608_124416.jpg'],
    primaryImageIndex: 1,
    pricePerPound: 5.99,
    availability: true,
    season: 'March - September',
    origin: 'Florida'
  },
  {
    id: 'papaya',
    name: 'Papaya',
    description: 'Sweet, orange-fleshed fruit rich in vitamins and perfect for breakfast',
    image: '/images/papaya.jpg',
    images: ['/images/papaya.jpg'],
    primaryImageIndex: 0,
    pricePerPound: 3.49,
    availability: true,
    season: 'Year Round',
    origin: 'Hawaii'
  },
  {
    id: 'sapodilla',
    name: 'Sapodilla',
    description: 'Sweet, brown fruit with a grainy texture, perfect for desserts',
    image: '/images/sapodilla.jpg',
    images: ['/images/sapodilla.jpg'],
    primaryImageIndex: 0,
    pricePerPound: 7.99,
    availability: true,
    season: 'September - December',
    origin: 'Florida'
  }
];

export const boxSizes: BoxSize[] = [
  {
    id: 'small',
    name: 'Small Box',
    dimensions: {
      length: 12,
      width: 9,
      height: 6
    },
    weight: 8,
    maxItems: 4,
    basePrice: 15.99
  },
  {
    id: 'medium',
    name: 'Medium Box',
    dimensions: {
      length: 16,
      width: 12,
      height: 8
    },
    weight: 12,
    maxItems: 8,
    basePrice: 24.99
  },
  {
    id: 'large',
    name: 'Large Box',
    dimensions: {
      length: 20,
      width: 16,
      height: 10
    },
    weight: 18,
    maxItems: 12,
    basePrice: 34.99
  }
];
