import { useEffect, useRef, useState } from "react";
import { BY_ID } from "../data/products.js";
import { useStore } from "../context/StoreContext.jsx";
import { computeTotals, formatNaira, FREE_DELIVERY_OVER, PROMO_CODES, ZONES } from "../lib/pricing.js";
import { storage } from "../lib/storage.js";

const AUTOCOMPLETE = { name: "name", phone: "tel", email: "email", addr: "street-address", city: "address-level2" };
const PAYMENTS = [
  ["card", "Debit or credit card", "Verve, Visa, Mastercard. You'll enter card details on the secure payment page."],
  ["transfer", "Bank transfer", "We'll show account details after you place the order."],
  ["pod", "Pay on delivery", "Cash or POS. Lagos, Port Harcourt and Abuja only."],
];

function validate(form, ship, pay, zone) {
  const e = {};
  if (form.name.trim().length < 2) e.name = "Enter your full name.";
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(form.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a Nigerian mobile number, e.g. 0803 123 4567.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter an email address like name@example.com.";
  if (ship !== "pickup") {
    if (form.addr.trim().length < 5) e.addr = "Enter a street address for delivery.";
    if (form.city.trim().length < 2) e.city = "Enter your city or town.";
  }
  if (pay === "pod" && zone === "other") e.pay = "Pay on delivery isn't available in this state. Choose card or bank transfer.";
  return e;
}

export default function Checkout({ onBack, onPlaced }) {
  const { cart, dispatch, notify } = useStore();
  const [form, setForm] = useState(() => storage.get("form", { name: "", phone: "", email: "", addr: "", city: "", notes: "" }));
  const [zone, setZone] = useState("lagos");
  const [ship, setShip] = useState("std");
  const [pay, setPay] = useState("card");
  const [promo, setPromo] = useState(null);
  const [promoInput, setPromoInput] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  useEffect(() => storage.set("form", form), [form]);
  useEffect(() => { if (zone === "other" && pay === "pod") setPay("card"); }, [zone, pay]);

  const t = computeTotals(cart, { promo, zone, ship });
  const z = ZONES[zone];
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (PROMO_CODES[code]) { setPromo({ code, pct: PROMO_CODES[code] }); notify("Promo applied"); }
    else { setPromo(null); notify(code ? "That code isn't valid" : "Enter a promo code"); }
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form, ship, pay, zone);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      if (errs.pay && Object.keys(errs).length === 1) notify(errs.pay);
      return;
    }
    const eta = new Date();
    eta.setDate(eta.getDate() + (ship === "exp" ? 1 : z.etaDays));
    onPlaced({
      no: "SI-" + String(Date.now() % 1000000).padStart(6, "0"),
      totals: t, lines: cart.map((l) => ({ ...l })), ship, zone, pay, name: form.name, email: form.email, eta,
    });
    dispatch({ type: "clear" });
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
    ["std", "Standard delivery", z.days, t.afterDiscount >= FREE_DELIVERY_OVER ? 0 : z.std],
    ["exp", "Express delivery", "Next working day in-city", z.exp],
    ["pickup", "Pick up in Lekki, Lagos", "Ready in 24 hours · Mon–Sat, 10am–6pm", 0],
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
                {Object.entries(ZONES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
                <input type="radio" name="pay" value={k} checked={pay === k} onChange={() => setPay(k)} disabled={k === "pod" && zone === "other"} />
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

        <button className="primary" type="submit" style={{ marginTop: 24, width: "100%", padding: 15 }} disabled={!cart.length}>
          Place order · <span className="num">{formatNaira(t.total)}</span>
        </button>
      </form>

      <aside className="summary">
        <h2>Order summary</h2>
        {cart.length ? cart.map((l) => {
          const p = BY_ID[l.id];
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
          <button type="button" onClick={applyPromo}>Apply</button>
        </div>
        {promo ? <p className="ok">{promo.code} applied · {promo.pct * 100}% off</p> : <p className="hint">Try SOUL10 for 10% off your first order.</p>}
        <div className="li"><span>Subtotal</span><span className="num">{formatNaira(t.subtotal)}</span></div>
        {t.discount > 0 && <div className="li" style={{ color: "var(--ok)" }}><span>Discount</span><span className="num">−{formatNaira(t.discount)}</span></div>}
        <div className="li"><span>Delivery</span><span className="num">{t.delivery ? formatNaira(t.delivery) : "Free"}</span></div>
        <div className="li"><span>VAT (7.5%)</span><span className="num">{formatNaira(t.vat)}</span></div>
        <hr />
        <div className="li sum big"><span>Total</span><span className="num">{formatNaira(t.total)}</span></div>
      </aside>
    </section>
  );
}
