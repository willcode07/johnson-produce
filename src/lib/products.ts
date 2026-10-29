export type SaleUnit = 'lb' | 'bag' | 'each' | 'dozen';

/** One way a fruit is sold. Add more than one to let customers choose. */
export interface ProductOption {
  id: string;
  /** Short label, such as "U-pick" or "Frozen bag". */
  name: string;
  /** Dollar price. null shows "Ask for price". Do not guess. */
  price: number | null;
  unit?: SaleUnit | null;
  /** Extra line under the price, such as bag size. */
  detail?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image: string; // Deprecated - kept for backward compatibility
  images?: string[]; // Array of image URLs
  primaryImageIndex?: number; // Index of the primary image to show first (default: 0)
  /**
   * Dollar price shown to customers.
   * `null` means the price is not set — the site says "Ask for price".
   * Leave this null until you know the real price. Do not guess.
   * When this is a number it wins over pricePerPound.
   */
  price?: number | null;
  /**
   * How the item is sold. Controls the price label and the order-form quantity.
   * 'lb' | 'bag' | 'each'. Null shows a plain quantity and no "per lb" label.
   */
  unit?: SaleUnit | null;
  /**
   * Ways this fruit is sold. When this list is present it replaces `price` and `unit`.
   * One entry is a single price. Two or more are shown on the card and the order form
   * so the customer can choose. Other fruits can use this the same way as ackee.
   */
  options?: ProductOption[];
  /**
   * Flip this to move a fruit in or out of season.
   * true: shown as available and included on the order form.
   * false: shown as out of season and left off the order form.
   */
  inSeason?: boolean;
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

export function isInSeason(product: Product): boolean {
  if (typeof product.inSeason === 'boolean') return product.inSeason;
  return product.availability;
}

/** Price to show when a fruit has no `options` list. Null means "Ask for price". */
export function getListedPrice(product: Product): number | null {
  if (product.price === null) return null;
  if (typeof product.price === 'number') return product.price;
  return product.pricePerPound;
}

export function formatDollars(price: number): string {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export function formatOptionPrice(option: ProductOption): string {
  if (option.price === null) return 'Ask for price';
  const amount = formatDollars(option.price);
  if (option.unit === 'lb') return `${amount} per lb`;
  if (option.unit === 'bag') return `${amount} per bag`;
  if (option.unit === 'each') return `${amount} each`;
  if (option.unit === 'dozen') return `${amount} per dozen`;
  return amount;
}

/** Options to sell. A fruit with no `options` array is treated as one option. */
export function productOptions(product: Product): ProductOption[] {
  if (product.options && product.options.length > 0) return product.options;
  return [{
    id: 'standard',
    name: product.name,
    price: getListedPrice(product),
    unit: product.unit ?? null,
  }];
}

export function hasChoiceOptions(product: Product): boolean {
  return (product.options?.length ?? 0) > 1;
}

export function optionKey(productId: string, optionId: string): string {
  return `${productId}__${optionId}`;
}

/** Source text for the admin product writer so an options list is not dropped. */
export function optionsLiteral(options: ProductOption[] | undefined): string {
  if (!options || options.length === 0) return '';
  const rows = options.map((option) => {
    const detail = option.detail
      ? `,\n        detail: '${option.detail.replace(/'/g, "\\'")}'`
      : '';
    return `      {
        id: '${option.id.replace(/'/g, "\\'")}',
        name: '${option.name.replace(/'/g, "\\'")}',
        price: ${option.price === null ? 'null' : option.price},
        unit: ${option.unit ? `'${option.unit}'` : 'null'}${detail}
      }`;
  }).join(',\n');
  return `\n    options: [\n${rows}\n    ],`;
}

export function formatProductPrice(product: Product): string {
  if (hasChoiceOptions(product)) {
    return productOptions(product)
      .map((option) => `${option.name}: ${formatOptionPrice(option)}`)
      .join('; ');
  }
  return formatOptionPrice(productOptions(product)[0]);
}

export function quantityLabelForUnit(unit: SaleUnit | null | undefined, count: number): string {
  if (unit === 'bag') return count === 1 ? 'bag' : 'bags';
  if (unit === 'lb') return 'lb';
  if (unit === 'each') return count === 1 ? 'piece' : 'pieces';
  if (unit === 'dozen') return 'dozen';
  return count === 1 ? 'item' : 'items';
}

export function quantityLabel(product: Product, count: number): string {
  return quantityLabelForUnit(product.unit, count);
}

export function inSeasonProducts(list: Product[] = products): Product[] {
  return list.filter(isInSeason);
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

/**
 * FRUIT LIST — this is the file to edit when the season or prices change.
 * Path: src/lib/products.ts  (the `products` array below)
 *
 * inSeason   true = customers can order it. false = shown as out of season.
 * price      dollars to display when there is one way to buy the fruit.
 *            null = "Ask for price". Do not invent a number.
 * unit       'bag' | 'lb' | 'each' | 'dozen', or null for a plain quantity.
 * options    optional list of ways to buy the fruit. When set, it replaces
 *            price and unit. Copy ackee's list to give another fruit choices.
 * pricePerPound  keep this equal to `price`, or 0 when price is null or options are used.
 * availability   keep this equal to `inSeason`.
 *
 * Jackfruit $5.99 per lb, Naseberry (was Sapodilla) $7.99 per lb,
 * Mango $4.99, Avocado $3.99, Papaya $3.49.
 * Starfruit had no price, so it stays "Ask for price".
 * Ackee is sold two ways: U-pick $6 per dozen, and frozen 2 lb bags at $30 per bag.
 *
 * Older season notes, so they are not lost:
 *   Mango May–September, Avocado year round, Papaya year round,
 *   Ackee January–March and June–August, Jackfruit March–September,
 *   Sapodilla September–December.
 */
export const products: Product[] = [
  {
    id: 'ackee',
    name: 'Ackee',
    description: 'Jamaica\'s national fruit, for traditional ackee and saltfish. Choose u-pick fruit or a frozen bag.',
    image: '/images/ackee.jpg',
    images: ['/images/ackee.jpg', '/images/screenshot_20251117_114143_photos.jpg', '/images/20250816_111749.jpg'],
    primaryImageIndex: 1,
    price: null,
    unit: null,
    options: [
      {
        id: 'u-pick',
        name: 'U-pick',
        price: 6,
        unit: 'dozen',
      },
      {
        id: 'frozen-bag',
        name: 'Frozen bag',
        price: 30,
        unit: 'bag',
        detail: '2 lb bags, cleaned, vacuum sealed, and frozen',
      },
    ],
    inSeason: true,
    pricePerPound: 0,
    availability: true,
    season: 'In season',
    origin: 'Jamaica'
  },
  {
    id: 'jackfruit',
    name: 'Jackfruit',
    description: 'Large, sweet tropical fruit perfect as a meat substitute when young',
    image: '/images/jackfruit.jpg',
    images: ['/images/20230521_102439.jpg', '/images/20230521_102419.jpg', '/images/20210608_124416.jpg'],
    primaryImageIndex: 1,
    price: 5.99,
    unit: 'lb',
    inSeason: true,
    pricePerPound: 5.99,
    availability: true,
    season: 'In season',
    origin: 'Florida'
  },
  {
    id: 'starfruit',
    name: 'Starfruit (Carambola)',
    description: 'Crisp, star-shaped carambola with a sweet-tart flavor. Eaten fresh.',
    image: '/images/starfruit.jpg',
    images: ['/images/starfruit.jpg'],
    primaryImageIndex: 0,
    price: null,
    unit: null,
    inSeason: true,
    pricePerPound: 0,
    availability: true,
    season: 'In season',
    origin: 'Florida'
  },
  {
    id: 'naseberry',
    name: 'Naseberry (Sapodilla)',
    description: 'Sweet, brown fruit with a soft, grainy texture. Also called sapodilla.',
    image: '/images/sapodilla.jpg',
    images: ['/images/sapodilla.jpg'],
    primaryImageIndex: 0,
    price: 7.99,
    unit: 'lb',
    inSeason: true,
    pricePerPound: 7.99,
    availability: true,
    season: 'In season',
    origin: 'Florida'
  },
  {
    id: 'mango',
    name: 'Mango',
    description: 'Sweet, juicy tropical mangoes perfect for eating fresh or in smoothies',
    image: '/images/mango.jpg',
    images: ['/images/mango-tree.jpg', '/images/mango-tree-2.jpg'],
    primaryImageIndex: 2,
    price: 4.99,
    unit: 'lb',
    inSeason: false,
    pricePerPound: 4.99,
    availability: false,
    season: 'Out of season',
    origin: 'Florida'
  },
  {
    id: 'avocado',
    name: 'Avocado',
    description: 'Creamy, rich avocados ideal for guacamole, toast, or salads',
    image: '/images/avocado.jpg',
    images: ['/images/avocado-box.jpg', '/images/avocado-tree.jpg', '/images/avocado-slice.jpg'],
    primaryImageIndex: 1,
    price: 3.99,
    unit: 'lb',
    inSeason: false,
    pricePerPound: 3.99,
    availability: false,
    season: 'Out of season',
    origin: 'California'
  },
  {
    id: 'papaya',
    name: 'Papaya',
    description: 'Sweet, orange-fleshed fruit rich in vitamins and perfect for breakfast',
    image: '/images/papaya.jpg',
    images: ['/images/papaya.jpg'],
    primaryImageIndex: 0,
    price: 3.49,
    unit: 'lb',
    inSeason: false,
    pricePerPound: 3.49,
    availability: false,
    season: 'Out of season',
    origin: 'Hawaii'
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
