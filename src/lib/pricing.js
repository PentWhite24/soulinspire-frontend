import { BY_ID } from "../data/products.js";

export const FREE_DELIVERY_OVER = 50000;
export const VAT_RATE = 0.075;

export const ZONES = {
  lagos: { label: "Lagos", std: 2500, exp: 4500, days: "1–2 days", etaDays: 2 },
  rivers: { label: "Rivers (Port Harcourt)", std: 3000, exp: 5500, days: "2–3 days", etaDays: 3 },
  fct: { label: "FCT (Abuja)", std: 3000, exp: 5500, days: "2–3 days", etaDays: 3 },
  other: { label: "Other states", std: 4500, exp: 8000, days: "3–6 days", etaDays: 6 },
};

export const PROMO_CODES = { SOUL10: 0.1 };

export const formatNaira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

export function computeTotals(cart, { promo = null, zone = "lagos", ship = "std" } = {}) {
  const subtotal = cart.reduce((s, l) => s + BY_ID[l.id].price * l.qty, 0);
  const items = cart.reduce((s, l) => s + l.qty, 0);
  const discount = promo ? Math.round(subtotal * promo.pct) : 0;
  const afterDiscount = subtotal - discount;
  const z = ZONES[zone];

  let delivery = 0;
  if (subtotal > 0 && ship === "exp") delivery = z.exp;
  if (subtotal > 0 && ship === "std") delivery = afterDiscount >= FREE_DELIVERY_OVER ? 0 : z.std;

  const vat = Math.round(afterDiscount * VAT_RATE);
  return { subtotal, items, discount, afterDiscount, delivery, vat, total: afterDiscount + delivery + vat };
}
