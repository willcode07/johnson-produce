'use client';

import { useEffect, useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  formatProductPrice,
  inSeasonProducts,
  quantityLabel,
  type Product,
} from '@/lib/products';
import {
  ORDER_EMAIL,
  FORM_ACTION,
  ORDER_THANKS_URL,
  blankMailto,
  buildMailto,
  emptyQuantities,
  orderLines,
  validateOrder,
  type OrderDraft,
  type OrderErrors,
} from '@/lib/order';

const seasonalFruits = inSeasonProducts();

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3 py-3 text-base text-gray-900 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500';

function todayISO(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-red-700" role="alert">
      {message}
    </p>
  );
}

export default function OrderForm() {
  const formId = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>(() => emptyQuantities());
  const [fulfillment, setFulfillment] = useState<OrderDraft['fulfillment']>('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [honey, setHoney] = useState('');
  const [errors, setErrors] = useState<OrderErrors>({});
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const draft: OrderDraft = {
    name,
    phone,
    email,
    quantities,
    fulfillment,
    address,
    date,
    notes,
  };
  const mailtoHref = name.trim() || phone.trim() ? buildMailto(draft) : blankMailto();

  useEffect(() => {
    const item = new URLSearchParams(window.location.search).get('item');
    if (!item || !seasonalFruits.some((product) => product.id === item)) return;
    setQuantities((current) => {
      if ((current[item] ?? 0) >= 1) return current;
      return { ...current, [item]: 1 };
    });
    setHighlightedId(item);
    const frame = requestAnimationFrame(() => {
      document.getElementById(`order-item-${item}`)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function setQuantity(product: Product, next: number) {
    const qty = Number.isFinite(next) ? Math.floor(next) : 0;
    const clamped = Math.max(0, Math.min(99, qty));
    setQuantities((current) => ({ ...current, [product.id]: clamped }));
  }

  function focusFirstError(nextErrors: OrderErrors) {
    const order = ['name', 'phone', 'email', 'items', 'fulfillment', 'address', 'date'] as const;
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    const id = first === 'items' ? 'order-items' : `order-${first}`;
    document.getElementById(id)?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const nextErrors = validateOrder(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      focusFirstError(nextErrors);
    }
  }

  return (
    <form
      action={FORM_ACTION}
      method="POST"
      onSubmit={handleSubmit}
      noValidate
      className="relative bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6"
    >
      <input type="hidden" name="_subject" value={`New produce order from ${name.trim() || 'a customer'}`} />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_captcha" value="false" />
      <input type="hidden" name="_next" value={ORDER_THANKS_URL} />
      <input type="hidden" name="Order" value={orderLines(draft).join('\n')} />
      {email.trim() ? <input type="hidden" name="_replyto" value={email.trim()} /> : null}
      {seasonalFruits.map((product) => {
        const qty = quantities[product.id] ?? 0;
        if (qty <= 0) return null;
        return (
          <input
            key={product.id}
            type="hidden"
            name={product.name}
            value={`${qty} ${quantityLabel(product, qty)}`}
          />
        );
      })}
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input
            type="text"
            name="_honey"
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(event) => setHoney(event.target.value)}
          />
        </label>
      </div>

      <div>
        <label htmlFor="order-name" className="block text-sm font-medium text-gray-900 mb-2">
          Name
        </label>
        <input
          id="order-name"
          name="Name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          aria-invalid={errors.name ? true : undefined}
          required
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <label htmlFor="order-phone" className="block text-sm font-medium text-gray-900 mb-2">
          Phone
        </label>
        <input
          id="order-phone"
          name="Phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className={inputClass}
          aria-invalid={errors.phone ? true : undefined}
          required
        />
        <FieldError message={errors.phone} />
      </div>

      <div>
        <label htmlFor="order-email" className="block text-sm font-medium text-gray-900 mb-2">
          Email <span className="font-normal text-gray-600">(optional)</span>
        </label>
        <input
          id="order-email"
          name="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          aria-invalid={errors.email ? true : undefined}
        />
        <FieldError message={errors.email} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-gray-900 mb-2">Items</legend>
        <p id={`${formId}-items-hint`} className="text-sm text-gray-600 mb-3">
          Choose a quantity for each fruit you want.
        </p>
        {errors.items ? (
          <p id="order-items-error" className="mb-2 text-sm text-red-700" role="alert">
            {errors.items}
          </p>
        ) : null}
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {seasonalFruits.map((product, index) => {
            const qty = quantities[product.id] ?? 0;
            const inputId = index === 0 ? 'order-items' : `order-qty-${product.id}`;
            return (
              <div
                id={`order-item-${product.id}`}
                key={product.id}
                className={`flex items-center justify-between gap-3 px-3 py-3 ${highlightedId === product.id ? 'bg-amber-50' : ''}`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{formatProductPrice(product)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="h-11 w-11 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(product, qty - 1)}
                    disabled={qty <= 0}
                    aria-label={`Decrease ${product.name}`}
                  >
                    <Minus className="h-4 w-4 mx-auto" />
                  </button>
                  <input
                    id={inputId}
                    inputMode="numeric"
                    aria-label={`${product.name} quantity in ${quantityLabel(product, qty)}`}
                    aria-describedby={errors.items ? 'order-items-error' : `${formId}-items-hint`}
                    value={qty}
                    onChange={(event) => {
                      const raw = event.target.value;
                      if (raw === '') {
                        setQuantity(product, 0);
                        return;
                      }
                      if (!/^\d+$/.test(raw)) return;
                      setQuantity(product, Number(raw));
                    }}
                    className="w-14 h-11 text-center text-base text-gray-900 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    className="h-11 w-11 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => setQuantity(product, qty + 1)}
                    disabled={qty >= 99}
                    aria-label={`Increase ${product.name}`}
                  >
                    <Plus className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-900 mb-2">Pickup or delivery</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ['pickup', 'Pickup'],
            ['delivery', 'Delivery'],
          ] as const).map(([value, label]) => (
            <label
              key={value}
              className={`flex items-center gap-3 border rounded-lg p-4 cursor-pointer ${
                fulfillment === value ? 'border-amber-600 bg-amber-50' : 'border-gray-300'
              }`}
            >
              <input
                id={value === 'pickup' ? 'order-fulfillment' : undefined}
                type="radio"
                name="Fulfillment"
                value={label}
                checked={fulfillment === value}
                onChange={() => setFulfillment(value)}
                className="h-5 w-5 accent-amber-700"
              />
              <span className="font-medium text-gray-900">{label}</span>
            </label>
          ))}
        </div>
        <FieldError message={errors.fulfillment} />
      </fieldset>

      {fulfillment === 'delivery' && (
        <div>
          <label htmlFor="order-address" className="block text-sm font-medium text-gray-900 mb-2">
            Delivery address or area
          </label>
          <textarea
            id="order-address"
            name="Delivery address"
            rows={3}
            autoComplete="street-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className={inputClass}
            aria-invalid={errors.address ? true : undefined}
          />
          <FieldError message={errors.address} />
        </div>
      )}

      <div>
        <label htmlFor="order-date" className="block text-sm font-medium text-gray-900 mb-2">
          Preferred date
        </label>
        <input
          id="order-date"
          name="Preferred date"
          type="date"
          value={date}
          min={todayISO()}
          onChange={(event) => setDate(event.target.value)}
          className={inputClass}
          aria-invalid={errors.date ? true : undefined}
          required
        />
        <FieldError message={errors.date} />
      </div>

      <div>
        <label htmlFor="order-notes" className="block text-sm font-medium text-gray-900 mb-2">
          Notes <span className="font-normal text-gray-600">(optional)</span>
        </label>
        <textarea
          id="order-notes"
          name="Notes"
          rows={3}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-amber-700 transition-colors"
      >
        Send order
      </button>

      <p className="text-sm text-gray-700 text-center">
        Or email the order yourself:{' '}
        <a href={mailtoHref} className="text-amber-800 underline font-medium break-all">
          {ORDER_EMAIL}
        </a>
      </p>
    </form>
  );
}
