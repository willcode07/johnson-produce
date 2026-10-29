import {
  formatOptionPrice,
  hasChoiceOptions,
  inSeasonProducts,
  isInSeason,
  optionKey,
  productOptions,
  quantityLabelForUnit,
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

export type Fulfillment = '' | 'pickup' | 'delivery' | 'shipping';

export interface OrderDraft {
  name: string;
  phone: string;
  email: string;
  /** Keys are optionKey(productId, optionId). */
  quantities: Record<string, number>;
  fulfillment: Fulfillment;
  address: string;
  shipName: string;
  shipStreet: string;
  shipApt: string;
  shipCity: string;
  shipState: string;
  shipZip: string;
  date: string;
  notes: string;
}

export type OrderErrors = Partial<Record<
  'name' | 'phone' | 'email' | 'items' | 'fulfillment' | 'address' | 'date'
  | 'shipName' | 'shipStreet' | 'shipCity' | 'shipState' | 'shipZip',
  string
>>;

export function emptyQuantities(list: Product[] = inSeasonProducts()): Record<string, number> {
  const quantities: Record<string, number> = {};
  for (const product of list.filter(isInSeason)) {
    for (const option of productOptions(product)) {
      quantities[optionKey(product.id, option.id)] = 0;
    }
  }
  return quantities;
}

export function lineLabel(product: Product, optionName: string): string {
  return hasChoiceOptions(product) ? `${product.name} — ${optionName}` : product.name;
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
    for (const option of productOptions(product)) {
      const qty = draft.quantities[optionKey(product.id, option.id)] ?? 0;
      if (!Number.isInteger(qty) || qty < 0 || qty > 99) {
        itemError = 'Quantities must be whole numbers from 0 to 99.';
        break;
      }
      total += qty;
    }
    if (itemError) break;
  }
  if (!itemError && total < 1) {
    itemError = 'Add a quantity for at least one fruit.';
  }
  if (itemError) errors.items = itemError;

  if (draft.fulfillment !== 'pickup' && draft.fulfillment !== 'delivery' && draft.fulfillment !== 'shipping') {
    errors.fulfillment = 'Choose pickup, delivery, or shipping.';
  }

  if (draft.fulfillment === 'delivery' && draft.address.trim().length < 3) {
    errors.address = 'Enter a delivery address or area.';
  }

  if (draft.fulfillment === 'shipping') {
    if (draft.shipName.trim().length < 2) errors.shipName = 'Enter the recipient name.';
    if (draft.shipStreet.trim().length < 3) errors.shipStreet = 'Enter a street address.';
    if (draft.shipCity.trim().length < 2) errors.shipCity = 'Enter a city.';
    if (draft.shipState.trim().length < 2) errors.shipState = 'Enter a state.';
    if (!/^\d{5}(-\d{4})?$/.test(draft.shipZip.trim())) {
      errors.shipZip = 'Enter a 5-digit ZIP code.';
    }
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
  return list.filter(isInSeason).flatMap((product) => (
    productOptions(product).flatMap((option) => {
      const qty = draft.quantities[optionKey(product.id, option.id)] ?? 0;
      if (qty <= 0) return [];
      const noun = quantityLabelForUnit(option.unit, qty);
      return [
        `${lineLabel(product, option.name)}: ${qty} ${noun} (${formatOptionPrice(option)})`,
      ];
    })
  ));
}

function shippingBlock(draft: OrderDraft): string {
  const apt = draft.shipApt.trim();
  const street = apt ? `${draft.shipStreet.trim()}, ${apt}` : draft.shipStreet.trim();
  return [
    draft.shipName.trim(),
    street,
    `${draft.shipCity.trim()}, ${draft.shipState.trim()} ${draft.shipZip.trim()}`,
  ].filter(Boolean).join('\n');
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
    for (const option of productOptions(product)) {
      const qty = draft.quantities[optionKey(product.id, option.id)] ?? 0;
      if (qty > 0) {
        body[lineLabel(product, option.name)] = `${qty} ${quantityLabelForUnit(option.unit, qty)}`;
      }
    }
  }

  if (draft.fulfillment === 'pickup') {
    body.Fulfillment = 'Pickup';
  } else if (draft.fulfillment === 'delivery') {
    body.Fulfillment = 'Delivery';
    body['Delivery address'] = draft.address.trim();
  } else if (draft.fulfillment === 'shipping') {
    body.Fulfillment = 'Shipping';
    body['Shipping name'] = draft.shipName.trim();
    body.Street = draft.shipStreet.trim();
    if (draft.shipApt.trim()) body.Apt = draft.shipApt.trim();
    body.City = draft.shipCity.trim();
    body.State = draft.shipState.trim();
    body.ZIP = draft.shipZip.trim();
    body['Shipping address'] = shippingBlock(draft);
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
