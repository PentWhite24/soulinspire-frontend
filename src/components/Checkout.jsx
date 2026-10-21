import { useEffect, useRef, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { api, newIdempotencyKey } from "../lib/api.js";
import { computeTotals, formatNaira } from "../lib/pricing.js";
import { storage } from "../lib/storage.js";

const AUTOCOMPLETE = { name: "name", phone: "tel", email: "email", addr: "street-address", city: "address-level2" };
const PAYMENTS = [
  ["card", "Debit or credit card", "Verve, Visa, Mastercard. You'll enter card details on the secure payment page."],
  ["transfer", "Bank transfer", "We'll show account details after you place the order."],
  ["pod", "Pay on delivery", "Cash or POS. Lagos, Port Harcourt and Abuja only."],
];
// The API reports field errors by path; these are the form fields they belong to.
const FIELD_FROM_API = {
  "customer.name": "name", "customer.phone": "phone", "customer.email": "email",
  "delivery.address": "addr", "delivery.city": "city", "payment.method": "pay",
};

function validate(form, ship, pay, zone, podZones) {
  const e = {};
  if (form.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a Nigerian mobile number, e.g. 0803 123 4567.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter an email address like name@example.com.";
  if (ship !== "pickup") {
    if (form.addr.trim().length < 5) e.addr = "Enter a street address for delivery.";
    if (form.city.trim().length < 2) e.city = "Enter your city or town.";
  }
  if (pay === "pod" && !podZones.includes(zone)) e.pay = "Pay on delivery isn't available in this state. Choose card or bank transfer.";
  return e;
}

function describeCartProblem(err, byId) {
  const d = err.details?.[0];
  const name = byId[d?.productId]?.name ?? "An item";
  if (d?.reason === "insufficient_stock") return `${name}: only ${d.available} left. Reduce the quantity in your bag.`;
  if (d?.reason === "size_required") return `${name}: choose a size before ordering.`;
  return err.message;
}

export default function Checkout({ onBack, onPlaced }) {
  const { cart, dispatch, notify, catalogue } = useStore();
  const { byId, config, status } = catalogue;
  const [form, setForm] = useState(() => storage.get("form", { name: "", phone: "", email: "", addr: "", city: "", notes: "" }));
  const [zone, setZone] = useState("lagos");
  const [ship, setShip] = useState("std");
  const [pay, setPay] = useState("card");
  const [promo, setPromo] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [placing, setPlacing] = useState(false);
  const idempotencyKey = useRef(newIdempotencyKey());
  const formRef = useRef(null);

  const podZones = config?.payOnDeliveryZones ?? [];
  useEffect(() => storage.set("form", form), [form]);
  useEffect(() => { if (config && pay === "pod" && !podZones.includes(zone)) setPay("card"); }, [config, zone, pay, podZones]);

  if (status !== "ready") {
    return (
      <section className="wrap checkout">
        <div>
          <button type="button" className="back" onClick={onBack}>← Back to shop</button>
          <h1>Checkout</h1>
          {status === "error"
            ? <><p className="formerr" role="alert">{catalogue.error.message}</p><button className="ghost" style={{ marginTop: 16 }} onClick={catalogue.reload}>Try again</button></>
            : <p className="hint">Loading delivery options…</p>}
        </div>
      </section>
    );
  }

  const lines = cart.filter((l) => byId[l.id]);
  const t = computeTotals(lines, byId, config, { promo, zone, ship });
  const z = config.zones[zone];
  const vatPct = `${+(config.vatRate * 100).toFixed(2)}%`;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyPromo = async () => {
    const code = promoInput.trim();
    if (!code) return notify("Enter a promo code");
    setCheckingPromo(true);
    try {
      const p = await api.validatePromo(code);
      setPromo({ code: p.code, pct: p.pct });
      notify("Promo applied");
    } catch (err) {
      setPromo(null);
      notify(err.code === "invalid_promo" ? "That code isn't valid" : err.message);
    } finally {
      setCheckingPromo(false);
    }
  };

  const focusFirstError = () => requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());

  const submit = async (e) => {
    e.preventDefault();
    if (placing) return;
    setFormError("");
    const errs = validate(form, ship, pay, zone, podZones);
    setErrors(errs);
    if (Object.keys(errs).length) {
      focusFirstError();
      if (errs.pay && Object.keys(errs).length === 1) notify(errs.pay);
      return;
    }

    setPlacing(true);
    try {
      const { order, payment } = await api.placeOrder({
        customer: { name: form.name, phone: form.phone, email: form.email },
        delivery: { method: ship, zone, address: form.addr, city: form.city },
        payment: { method: pay },
        items: lines.map((l) => ({ productId: l.id, size: l.size, qty: l.qty })),
        promoCode: promo?.code,
        notes: form.notes,
      }, idempotencyKey.current);

      dispatch({ type: "clear" });
      storage.set("cart", []);
      catalogue.reload(); // stock has changed

      if (payment.authorizationUrl) {
        // Card payments continue on the payment page, which sends the customer back here.
        window.location.assign(payment.authorizationUrl);
        return;
      }
      onPlaced({ order, payment });
    } catch (err) {
      if (err.code === "validation_failed") {
        const mapped = {};
        for (const [path, msg] of Object.entries(err.fields)) if (FIELD_FROM_API[path]) mapped[FIELD_FROM_API[path]] = msg;
        setErrors(mapped);
        setFormError(Object.keys(mapped).length ? "Some details need fixing." : err.message);
        focusFirstError();
      } else if (err.code === "cart_unavailable") {
        setFormError(describeCartProblem(err, byId));
        catalogue.reload();
      } else {
        setFormError(err.message);
      }
      idempotencyKey.current = newIdempotencyKey();
      setPlacing(false);
    }
  };

  const field = (k, label, type = "text", full = false) => (
    <div className={`f${full ? " full" : ""}`}>
      <label htmlFor={`f_${k}`}>{label}</label>
      <input id={`f_${k}`} name={k} type={type} value={form[k]} onChange={set(k)} autoComplete={AUTOCOMPLETE[k]}
        aria-invalid={errors[k] ? "true" : undefined} />
      {errors[k] && <p className="err">{errors[k]}</p>}
    </div>
  );

  const shipOptions = [
    ["std", "Standard delivery", z.days, t.afterDiscount >= config.freeDeliveryOver ? 0 : z.std],
    ["exp", "Express delivery", "Next working day in-city", z.exp],
    ["pickup", `Pick up in ${config.pickup?.address ?? "Lekki, Lagos"}`, `Ready in 24 hours · ${config.pickup?.hours ?? "Mon–Sat, 10am–6pm"}`, 0],
  ];

  return (
    <section className="wrap checkout">
      <form id="co" ref={formRef} noValidate onSubmit={submit}>
        <button type="button" className="back" onClick={onBack}>← Back to shop</button>
        <h1>Checkout</h1>
        <p className="hint">Orders placed before 2pm WAT dispatch the same working day.</p>

        <fieldset>
          <legend>Contact</legend>
          <div className="fields">
            {field("name", "Full name", "text", true)}
            {field("phone", "Phone number", "tel")}
            {field("email", "Email", "email")}
          </div>
        </fieldset>

        <fieldset>
          <legend>Delivery</legend>
          <div className="fields">
            {field("addr", "Street address", "text", true)}
            {field("city", "City or town")}
            <div className="f">
              <label htmlFor="f_zone">State</label>
              <select id="f_zone" value={zone} onChange={(e) => setZone(e.target.value)}>
                {Object.entries(config.zones).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="opts" role="radiogroup" aria-label="Delivery method">
            {shipOptions.map(([k, label, detail, amt]) => (
              <label className="opt" key={k}>
                <input type="radio" name="ship" value={k} checked={ship === k} onChange={() => setShip(k)} />
                <span><b>{label}</b><small>{detail}</small></span>
                <span className="amt num">{amt === 0 ? "Free" : formatNaira(amt)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Payment</legend>
          <div className="opts" role="radiogroup" aria-label="Payment method">
            {PAYMENTS.map(([k, label, detail]) => (
              <label className="opt" key={k}>
                <input type="radio" name="pay" value={k} checked={pay === k} onChange={() => setPay(k)} disabled={k === "pod" && !podZones.includes(zone)} />
                <span><b>{label}</b><small>{detail}</small></span>
              </label>
            ))}
          </div>
          {errors.pay && <p className="err">{errors.pay}</p>}
        </fieldset>

        <fieldset>
          <div className="f full">
            <label htmlFor="f_notes">Gift note or delivery instructions (optional)</label>
            <textarea id="f_notes" name="notes" rows={2} value={form.notes} onChange={set("notes")} />
          </div>
        </fieldset>

        {formError && <p className="formerr" role="alert">{formError}</p>}
        <button className="primary" type="submit" style={{ marginTop: 24, width: "100%", padding: 15 }} disabled={!lines.length || placing}>
          {placing ? "Placing your order…" : <>Place order · <span className="num">{formatNaira(t.total)}</span></>}
        </button>
      </form>

      <aside className="summary">
        <h2>Order summary</h2>
        {lines.length ? lines.map((l) => {
          const p = byId[l.id];
          return (
            <div className="li" key={l.id + (l.size || "")}>
              <span>{p.name}{l.size && ` (${l.size})`} × {l.qty}</span><span className="num">{formatNaira(p.price * l.qty)}</span>
            </div>
          );
        }) : <p className="hint">Your bag is empty.</p>}
        <hr />
        <div className="promo">
          <input id="promo" placeholder="Promo code" aria-label="Promo code" value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())} />
          <button type="button" onClick={applyPromo} disabled={checkingPromo}>{checkingPromo ? "Checking…" : "Apply"}</button>
        </div>
        {promo ? <p className="ok">{promo.code} applied · {Math.round(promo.pct * 100)}% off</p> : <p className="hint">Try SOUL10 for 10% off your first order.</p>}
        <div className="li"><span>Subtotal</span><span className="num">{formatNaira(t.subtotal)}</span></div>
        {t.discount > 0 && <div className="li" style={{ color: "var(--ok)" }}><span>Discount</span><span className="num">−{formatNaira(t.discount)}</span></div>}
        <div className="li"><span>Delivery</span><span className="num">{t.delivery ? formatNaira(t.delivery) : "Free"}</span></div>
        <div className="li"><span>VAT ({vatPct})</span><span className="num">{formatNaira(t.vat)}</span></div>
        <hr />
        <div className="li sum big"><span>Total</span><span className="num">{formatNaira(t.total)}</span></div>
      </aside>
    </section>
  );
}
