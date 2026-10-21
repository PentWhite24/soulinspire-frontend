import { useStore } from "../context/StoreContext.jsx";
import { INTENTIONS as FALLBACK_INTENTIONS } from "../data/intentions.js";
import { formatNaira } from "../lib/pricing.js";
import { CheckIcon } from "./Icons.jsx";

// Shows the order exactly as the API recorded it.
export default function Confirmation({ order: o, payment = {}, onContinue }) {
  const { catalogue } = useStore();
  const intentions = catalogue.config?.intentions?.length ? catalogue.config.intentions : FALLBACK_INTENTIONS;
  const eta = new Date(o.delivery.eta + "T12:00:00").toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });
  const t = o.totals;
  const pay = o.payment.method;
  const unpaidCard = pay === "card" && o.status === "pending_payment";
  const bank = payment.bankDetails;
  const pickup = payment.pickup ?? catalogue.config?.pickup;
  const vatPct = catalogue.config ? `${+(catalogue.config.vatRate * 100).toFixed(2)}%` : "";

  return (
    <section className="wrap">
      <div className="done">
        <div className="seal"><CheckIcon /></div>
        <span className="eyebrow">Order {o.orderNo}</span>
        <h1>{unpaidCard ? "Payment not completed" : `Thank you, ${o.customer.name.split(" ")[0]}.`}</h1>
        <p className="hint" style={{ fontSize: 15 }}>
          {unpaidCard
            ? "We've kept your order, but the card payment didn't go through. Contact us to pay another way."
            : <>A confirmation is on its way to {o.customer.email}.{" "}
              {o.delivery.method === "pickup"
                ? `Your order will be ready for pickup at ${pickup?.address ?? "our Lekki store"} within 24 hours.`
                : <>Expected {o.delivery.method === "exp" && "express "}delivery by <b>{eta}</b> to {o.delivery.zoneLabel}.</>}
              {pay === "card" && " Your card payment was received."}
              {pay === "pod" && " Have cash or a card ready when your rider arrives."}</>}
        </p>

        {pay === "transfer" && bank && (
          <div className="receipt">
            <span className="eyebrow">Pay by bank transfer</span>
            <dl className="bank">
              <dt>Bank</dt><dd>{bank.bankName}</dd>
              <dt>Account name</dt><dd>{bank.accountName}</dd>
              <dt>Account number</dt><dd className="num">{bank.accountNumber}</dd>
              <dt>Amount</dt><dd className="num">{formatNaira(bank.amount)}</dd>
              <dt>Reference</dt><dd>{bank.reference}</dd>
            </dl>
            <p className="hint">Use the reference so we can match your payment. We dispatch once it arrives.</p>
          </div>
        )}

        <div className="receipt">
          {o.items.map((l) => (
            <div className="li" key={l.productId + (l.size || "")}>
              <span>{l.name}{l.size && ` (${l.size})`} × {l.qty}</span><span className="num">{formatNaira(l.lineTotal)}</span>
            </div>
          ))}
          <hr />
          {t.discount > 0 && <div className="li"><span>Discount{o.promoCode && ` (${o.promoCode})`}</span><span className="num">−{formatNaira(t.discount)}</span></div>}
          <div className="li"><span>Delivery</span><span className="num">{t.delivery ? formatNaira(t.delivery) : "Free"}</span></div>
          <div className="li"><span>VAT{vatPct && ` (${vatPct})`}</span><span className="num">{formatNaira(t.vat)}</span></div>
          <div className="li" style={{ fontWeight: 700, fontSize: 17 }}><span>Total</span><span className="num">{formatNaira(t.total)}</span></div>
        </div>

        <div className="intent">
          <span className="eyebrow">A note from us</span>
          <q>{intentions[new Date().getDay() % intentions.length]}</q>
        </div>
        <button className="primary" onClick={onContinue} style={{ justifySelf: "start" }}>Continue shopping</button>
      </div>
    </section>
  );
}
