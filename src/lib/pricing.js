// Client-side estimate of the bag and checkout totals, using the delivery zones, VAT rate
// and free-delivery threshold from the API's /config. The API recalculates every order,
// and the confirmation page shows the API's figures.

export const formatNaira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");

export function computeTotals(cart, byId, config, { promo = null, zone = "lagos", ship = "std" } = {}) {
  const subtotal = cart.reduce((s, l) => s + (byId[l.id]?.price ?? 0) * l.qty, 0);
  const items = cart.reduce((s, l) => s + l.qty, 0);
  const discount = promo ? Math.round(subtotal * promo.pct) : 0;
  const afterDiscount = subtotal - discount;
  const z = config?.zones?.[zone];
  const freeOver = config?.freeDeliveryOver ?? Infinity;

  let delivery = 0;
  if (z && subtotal > 0 && ship === "exp") delivery = z.exp;
  if (z && subtotal > 0 && ship === "std") delivery = afterDiscount >= freeOver ? 0 : z.std;

  const vat = Math.round(afterDiscount * (config?.vatRate ?? 0));
  return { subtotal, items, discount, afterDiscount, delivery, vat, total: afterDiscount + delivery + vat };
}
