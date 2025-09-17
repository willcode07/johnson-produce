export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePerPound: number;
  availability: boolean;
  season: string;
  origin: string;
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
