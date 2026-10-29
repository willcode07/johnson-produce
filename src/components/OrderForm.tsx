'use client';

import { useEffect, useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import {
  formatOptionPrice,
  hasChoiceOptions,
  inSeasonProducts,
  optionKey,
  productOptions,
  quantityLabelForUnit,
  type Product,
  type ProductOption,
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

function OptionRow({
  product,
  option,
  qty,
  inputId,
  describedBy,
  onQuantity,
}: {
  product: Product;
  option: ProductOption;
  qty: number;
  inputId: string;
  describedBy: string;
  onQuantity: (next: number) => void;
}) {
  const choice = hasChoiceOptions(product);
  const label = choice ? `${product.name} ${option.name}` : product.name;
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{choice ? option.name : product.name}</p>
        <p className="text-sm text-gray-600">{formatOptionPrice(option)}</p>
        {option.detail ? <p className="text-sm text-gray-600">{option.detail}</p> : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="h-11 w-11 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onQuantity(qty - 1)}
          disabled={qty <= 0}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-4 w-4 mx-auto" />
        </button>
        <input
          id={inputId}
          inputMode="numeric"
          aria-label={`${label} quantity in ${quantityLabelForUnit(option.unit, qty)}`}
          aria-describedby={describedBy}
          value={qty}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === '') {
              onQuantity(0);
              return;
            }
            if (!/^\d+$/.test(raw)) return;
            onQuantity(Number(raw));
          }}
          className="w-14 h-11 text-center text-base text-gray-900 border border-gray-300 rounded-lg"
        />
        <button
          type="button"
          className="h-11 w-11 rounded-full border border-gray-300 text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={() => onQuantity(qty + 1)}
          disabled={qty >= 99}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-4 w-4 mx-auto" />
        </button>
      </div>
    </div>
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
  const [shipName, setShipName] = useState('');
  const [shipStreet, setShipStreet] = useState('');
  const [shipApt, setShipApt] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');
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
    shipName,
    shipStreet,
    shipApt,
    shipCity,
    shipState,
    shipZip,
    date,
    notes,
  };
  const mailtoHref = name.trim() || phone.trim() ? buildMailto(draft) : blankMailto();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const item = params.get('item');
    const product = seasonalFruits.find((entry) => entry.id === item);
    if (!product) return;
    const options = productOptions(product);
    const requested = options.find((option) => option.id === params.get('option'));
    const chosen = requested ?? (options.length === 1 ? options[0] : undefined);
    if (chosen) {
      const key = optionKey(product.id, chosen.id);
      setQuantities((current) => {
        if ((current[key] ?? 0) >= 1) return current;
        return { ...current, [key]: 1 };
      });
    }
    setHighlightedId(product.id);
    const frame = requestAnimationFrame(() => {
      document.getElementById(`order-item-${product.id}`)?.scrollIntoView({ block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function setQuantity(key: string, next: number) {
    const qty = Number.isFinite(next) ? Math.floor(next) : 0;
    const clamped = Math.max(0, Math.min(99, qty));
    setQuantities((current) => ({ ...current, [key]: clamped }));
  }

  function focusFirstError(nextErrors: OrderErrors) {
    const order = [
      'name', 'phone', 'email', 'items', 'fulfillment', 'address',
      'shipName', 'shipStreet', 'shipCity', 'shipState', 'shipZip', 'date',
    ] as const;
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
      {seasonalFruits.flatMap((product) => (
        productOptions(product).map((option) => {
          const key = optionKey(product.id, option.id);
          const qty = quantities[key] ?? 0;
          if (qty <= 0) return null;
          return (
            <input
              key={key}
              type="hidden"
              name={hasChoiceOptions(product) ? `${product.name} — ${option.name}` : product.name}
              value={`${qty} ${quantityLabelForUnit(option.unit, qty)}`}
            />
          );
        })
      ))}
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
          Choose an option and a quantity for each fruit you want.
        </p>
        {errors.items ? (
          <p id="order-items-error" className="mb-2 text-sm text-red-700" role="alert">
            {errors.items}
          </p>
        ) : null}
        <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {seasonalFruits.map((product) => (
            <div
              id={`order-item-${product.id}`}
              key={product.id}
              className={highlightedId === product.id ? 'bg-amber-50' : undefined}
            >
              {hasChoiceOptions(product) ? (
                <p className="px-3 pt-3 font-medium text-gray-900">{product.name}</p>
              ) : null}
              {productOptions(product).map((option, optionIndex) => (
                <OptionRow
                  key={option.id}
                  product={product}
                  option={option}
                  qty={quantities[optionKey(product.id, option.id)] ?? 0}
                  inputId={product.id === seasonalFruits[0]?.id && optionIndex === 0 ? 'order-items' : `order-qty-${optionKey(product.id, option.id)}`}
                  describedBy={errors.items ? 'order-items-error' : `${formId}-items-hint`}
                  onQuantity={(next) => setQuantity(optionKey(product.id, option.id), next)}
                />
              ))}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-900 mb-2">Pickup, delivery, or shipping</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            ['pickup', 'Pickup'],
            ['delivery', 'Delivery'],
            ['shipping', 'Shipping'],
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

      {fulfillment === 'shipping' && (
        <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-900">Shipping address</legend>
          <div>
            <label htmlFor="order-shipName" className="block text-sm font-medium text-gray-900 mb-2">
              Name
            </label>
            <input
              id="order-shipName"
              name="Shipping name"
              type="text"
              autoComplete="shipping name"
              value={shipName}
              onChange={(event) => setShipName(event.target.value)}
              className={inputClass}
              aria-invalid={errors.shipName ? true : undefined}
            />
            <FieldError message={errors.shipName} />
          </div>
          <div>
            <label htmlFor="order-shipStreet" className="block text-sm font-medium text-gray-900 mb-2">
              Street
            </label>
            <input
              id="order-shipStreet"
              name="Street"
              type="text"
              autoComplete="shipping address-line1"
              value={shipStreet}
              onChange={(event) => setShipStreet(event.target.value)}
              className={inputClass}
              aria-invalid={errors.shipStreet ? true : undefined}
            />
            <FieldError message={errors.shipStreet} />
          </div>
          <div>
            <label htmlFor="order-ship-apt" className="block text-sm font-medium text-gray-900 mb-2">
              Apt <span className="font-normal text-gray-600">(optional)</span>
            </label>
            <input
              id="order-ship-apt"
              name={shipApt.trim() ? 'Apt' : undefined}
              type="text"
              autoComplete="shipping address-line2"
              value={shipApt}
              onChange={(event) => setShipApt(event.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="order-shipCity" className="block text-sm font-medium text-gray-900 mb-2">
                City
              </label>
              <input
                id="order-shipCity"
                name="City"
                type="text"
                autoComplete="shipping address-level2"
                value={shipCity}
                onChange={(event) => setShipCity(event.target.value)}
                className={inputClass}
                aria-invalid={errors.shipCity ? true : undefined}
              />
              <FieldError message={errors.shipCity} />
            </div>
            <div>
              <label htmlFor="order-shipState" className="block text-sm font-medium text-gray-900 mb-2">
                State
              </label>
              <input
                id="order-shipState"
                name="State"
                type="text"
                autoComplete="shipping address-level1"
                value={shipState}
                onChange={(event) => setShipState(event.target.value)}
                className={inputClass}
                aria-invalid={errors.shipState ? true : undefined}
              />
              <FieldError message={errors.shipState} />
            </div>
          </div>
          <div>
            <label htmlFor="order-shipZip" className="block text-sm font-medium text-gray-900 mb-2">
              ZIP
            </label>
            <input
              id="order-shipZip"
              name="ZIP"
              type="text"
              inputMode="numeric"
              autoComplete="shipping postal-code"
              value={shipZip}
              onChange={(event) => setShipZip(event.target.value)}
              className={inputClass}
              aria-invalid={errors.shipZip ? true : undefined}
            />
            <FieldError message={errors.shipZip} />
          </div>
        </fieldset>
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
