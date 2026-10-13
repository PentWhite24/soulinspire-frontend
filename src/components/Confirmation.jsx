import { BY_ID, INTENTIONS } from "../data/products.js";
import { formatNaira, ZONES } from "../lib/pricing.js";
import { CheckIcon } from "./Icons.jsx";

export default function Confirmation({ order: o, onContinue }) {
  const eta = o.eta.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  const t = o.totals;

  return (
    <section className="wrap">
      <div className="done">
        <div className="seal"><CheckIcon /></div>
        <span className="eyebrow">Order {o.no}</span>
        <h1>Thank you, {o.name.split(" ")[0]}.</h1>
        <p className="hint" style={{ fontSize: 15 }}>
          A confirmation is on its way to {o.email}.{" "}
          {o.ship === "pickup"
            ? "Your order will be ready for pickup in Lekki within 24 hours."
            : <>Expected {o.ship === "exp" && "express "}delivery by <b>{eta}</b> to {ZONES[o.zone].label}.</>}
          {o.pay === "transfer" && " Bank details for your transfer are in the email."}
          {o.pay === "pod" && " Have cash or a card ready when your rider arrives."}
        </p>

        <div className="receipt">
          {o.lines.map((l) => {
            const p = BY_ID[l.id];
            return (
              <div className="li" key={l.id + (l.size || "")}>
                <span>{p.name}{l.size && ` (${l.size})`} × {l.qty}</span><span className="num">{formatNaira(p.price * l.qty)}</span>
              </div>
            );
          })}
          <hr />
          {t.discount > 0 && <div className="li"><span>Discount</span><span className="num">−{formatNaira(t.discount)}</span></div>}
          <div className="li"><span>Delivery</span><span className="num">{t.delivery ? formatNaira(t.delivery) : "Free"}</span></div>
          <div className="li"><span>VAT (7.5%)</span><span className="num">{formatNaira(t.vat)}</span></div>
          <div className="li" style={{ fontWeight: 700, fontSize: 17 }}><span>Total</span><span className="num">{formatNaira(t.total)}</span></div>
        </div>

        <div className="intent">
          <span className="eyebrow">A note from us</span>
          <q>{INTENTIONS[new Date().getDay() % INTENTIONS.length]}</q>
        </div>
        <button className="primary" onClick={onContinue} style={{ justifySelf: "start" }}>Continue shopping</button>
      </div>
    </section>
  );
}
