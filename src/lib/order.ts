import {
  formatProductPrice,
  inSeasonProducts,
  isInSeason,
  quantityLabel,
  type Product,
} from '@/lib/products';

/**
 * Orders are emailed with FormSubmit. No API key is stored in the repo.
 * The form posts to https://formsubmit.co/produce@junltd.com (a normal
 * browser form post). FormSubmit's AJAX endpoint is behind a Cloudflare
 * check that blocks fetch() from this site.
 *
 * One-time step: the first submission sends an activation email to
 * ORDER_EMAIL. That message has to be confirmed before later orders arrive.
 * The first submission often only triggers activation and is not delivered
 * as an order. After confirming, send one test order.
 */
export const ORDER_EMAIL = 'produce@junltd.com';

export const FORM_ACTION = `https://formsubmit.co/${ORDER_EMAIL}`;

/** Where FormSubmit sends the customer after a successful post. */
export const ORDER_THANKS_URL = 'https://willcode07.github.io/johnson-produce/order/thanks/';

export interface OrderDraft {
  name: string;
  phone: string;
  email: string;
  quantities: Record<string, number>;
  fulfillment: '' | 'pickup' | 'delivery';
  address: string;
  date: string;
  notes: string;
}

export type OrderErrors = Partial<Record<
  'name' | 'phone' | 'email' | 'items' | 'fulfillment' | 'address' | 'date',
  string
>>;

export function emptyQuantities(list: Product[] = inSeasonProducts()): Record<string, number> {
  return Object.fromEntries(list.filter(isInSeason).map((product) => [product.id, 0]));
}

export function validateOrder(draft: OrderDraft, list: Product[] = inSeasonProducts()): OrderErrors {
  const errors: OrderErrors = {};
  const available = list.filter(isInSeason);

  if (draft.name.trim().length < 2) {
    errors.name = 'Enter your name.';
  }

  const digits = draft.phone.replace(/\D/g, '');
  if (digits.length < 10) {
    errors.phone = 'Enter a phone number with at least 10 digits.';
  }

  const email = draft.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email, or leave it blank.';
  }

  let itemError: string | undefined;
  let total = 0;
  for (const product of available) {
    const qty = draft.quantities[product.id] ?? 0;
    if (!Number.isInteger(qty) || qty < 0 || qty > 99) {
      itemError = 'Quantities must be whole numbers from 0 to 99.';
      break;
    }
    total += qty;
  }
  if (!itemError && total < 1) {
    itemError = 'Add a quantity for at least one fruit.';
  }
  if (itemError) errors.items = itemError;

  if (draft.fulfillment !== 'pickup' && draft.fulfillment !== 'delivery') {
    errors.fulfillment = 'Choose pickup or delivery.';
  }

  if (draft.fulfillment === 'delivery' && draft.address.trim().length < 3) {
    errors.address = 'Enter a delivery address or area.';
  }

  if (!draft.date) {
    errors.date = 'Choose a preferred date.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
    errors.date = 'Choose a valid date.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(`${draft.date}T00:00:00`);
    if (Number.isNaN(chosen.getTime()) || chosen < today) {
      errors.date = 'Choose today or a future date.';
    }
  }

  return errors;
}

export function orderLines(draft: OrderDraft, list: Product[] = inSeasonProducts()): string[] {
  return list.filter(isInSeason).flatMap((product) => {
    const qty = draft.quantities[product.id] ?? 0;
    if (qty <= 0) return [];
    return [
      `${product.name}: ${qty} ${quantityLabel(product, qty)} (${formatProductPrice(product)})`,
    ];
  });
}

/** Fields FormSubmit turns into the email table. Keys starting with _ are service fields. */
export function buildSubmission(
  draft: OrderDraft,
  list: Product[] = inSeasonProducts(),
): Record<string, string> {
  const name = draft.name.trim();
  const body: Record<string, string> = {
    Name: name,
    Phone: draft.phone.trim(),
    _subject: `New produce order from ${name || 'a customer'}`,
    _template: 'table',
    _captcha: 'false',
  };

  const email = draft.email.trim();
  if (email) {
    body.Email = email;
    body._replyto = email;
  }

  const lines = orderLines(draft, list);
  body.Order = lines.join('\n');

  for (const product of list.filter(isInSeason)) {
    const qty = draft.quantities[product.id] ?? 0;
    if (qty > 0) {
      body[product.name] = `${qty} ${quantityLabel(product, qty)}`;
    }
  }

  body.Fulfillment = draft.fulfillment === 'delivery' ? 'Delivery' : 'Pickup';
  if (draft.fulfillment === 'delivery') {
    body['Delivery address'] = draft.address.trim();
  }
  body['Preferred date'] = draft.date;
  if (draft.notes.trim()) body.Notes = draft.notes.trim();
  body._honey = '';
  return body;
}

export function buildMailto(draft: OrderDraft, list: Product[] = inSeasonProducts()): string {
  const submission = buildSubmission(draft, list);
  const lines = Object.entries(submission)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => `${key}: ${value}`);
  const subject = submission._subject || 'Produce order';
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

export function blankMailto(): string {
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent('Produce order')}`;
}
