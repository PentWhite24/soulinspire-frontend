import { useEffect, useRef } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { computeTotals, formatNaira } from "../lib/pricing.js";
import ProductArt from "./ProductArt.jsx";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch, catalogue } = useStore();
  const { byId, config } = catalogue;
  const closeRef = useRef(null);
  const lines = cart.filter((l) => byId[l.id]);
  const t = computeTotals(lines, byId, config);
  const freeOver = config?.freeDeliveryOver ?? 0;
  const left = Math.max(0, freeOver - t.afterDiscount);
  const vatPct = config ? `${+(config.vatRate * 100).toFixed(2)}%` : "";

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div className="scrim" hidden={!open} onClick={onClose} />
      <aside className={`drawer${open ? " open" : ""}`} aria-label="Shopping bag" aria-hidden={!open}>
        <header>
          <h2>Your bag</h2>
          <button ref={closeRef} className="close" onClick={onClose} aria-label="Close bag">×</button>
        </header>

        <div className="items">
          {catalogue.status === "loading" && cart.length > 0 ? (
            <p className="hint" style={{ padding: "48px 0", textAlign: "center" }}>Loading your bag…</p>
          ) : lines.length ? cart.map((l, i) => {
            const p = byId[l.id];
            if (!p) return null;
            return (
              <div className="item" key={l.id + (l.size || "")}>
                <div className="thumb" style={{ background: p.bg }}><ProductArt product={p} /></div>
                <div style={{ minWidth: 0 }}>
                  <h4>{p.name}</h4>
                  <small>{l.size && `Size ${l.size} · `}{formatNaira(p.price)}</small>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                    <div className="qty">
                      <button onClick={() => dispatch({ type: "setQty", index: i, qty: l.qty - 1, max: p.stock })} aria-label="Decrease">−</button>
                      <span className="num">{l.qty}</span>
                      <button onClick={() => dispatch({ type: "setQty", index: i, qty: l.qty + 1, max: p.stock })} aria-label="Increase">+</button>
                    </div>
                    <button className="rm" onClick={() => dispatch({ type: "remove", index: i })}>Remove</button>
                  </div>
                </div>
                <div className="num" style={{ fontWeight: 600 }}>{formatNaira(p.price * l.qty)}</div>
              </div>
            );
          }) : (
            <div className="empty" style={{ padding: "48px 0" }}>
              <h3 style={{ fontSize: 24, color: "var(--ink)" }}>Your bag is empty</h3>
              <p>Start with something that makes room for you.</p>
              <button className="ghost" onClick={onClose}>Keep shopping</button>
            </div>
          )}
        </div>

        {lines.length > 0 && config && (
          <footer>
            <p className="hint">
              {left > 0 ? <>Add <b className="num">{formatNaira(left)}</b> more for free standard delivery</> : "You've unlocked free standard delivery"}
            </p>
            <div className="meter"><i style={{ width: `${Math.min(100, (t.afterDiscount / freeOver) * 100)}%` }} /></div>
            <div className="sum"><span>Subtotal ({t.items} {t.items === 1 ? "item" : "items"})</span><span className="num">{formatNaira(t.subtotal)}</span></div>
            <p className="hint">Delivery and {vatPct} VAT are calculated at checkout.</p>
            <button className="primary" onClick={onCheckout}>Checkout</button>
          </footer>
        )}
      </aside>
    </>
  );
}
