import { useEffect, useRef } from "react";
import { BY_ID } from "../data/products.js";
import { useStore } from "../context/StoreContext.jsx";
import { computeTotals, formatNaira, FREE_DELIVERY_OVER } from "../lib/pricing.js";
import ProductArt from "./ProductArt.jsx";

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { cart, dispatch } = useStore();
  const closeRef = useRef(null);
  const t = computeTotals(cart);
  const left = Math.max(0, FREE_DELIVERY_OVER - t.afterDiscount);

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
          {cart.length ? cart.map((l, i) => {
            const p = BY_ID[l.id];
            return (
              <div className="item" key={l.id + (l.size || "")}>
                <div className="thumb" style={{ background: p.bg }}><ProductArt product={p} /></div>
                <div style={{ minWidth: 0 }}>
                  <h4>{p.name}</h4>
                  <small>{l.size && `Size ${l.size} · `}{formatNaira(p.price)}</small>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                    <div className="qty">
                      <button onClick={() => dispatch({ type: "setQty", index: i, qty: l.qty - 1 })} aria-label="Decrease">−</button>
                      <span className="num">{l.qty}</span>
                      <button onClick={() => dispatch({ type: "setQty", index: i, qty: l.qty + 1 })} aria-label="Increase">+</button>
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

        {cart.length > 0 && (
          <footer>
            <p className="hint">
              {left > 0 ? <>Add <b className="num">{formatNaira(left)}</b> more for free standard delivery</> : "You've unlocked free standard delivery"}
            </p>
            <div className="meter"><i style={{ width: `${Math.min(100, (t.afterDiscount / FREE_DELIVERY_OVER) * 100)}%` }} /></div>
            <div className="sum"><span>Subtotal ({t.items} {t.items === 1 ? "item" : "items"})</span><span className="num">{formatNaira(t.subtotal)}</span></div>
            <p className="hint">Delivery and 7.5% VAT are calculated at checkout.</p>
            <button className="primary" onClick={onCheckout}>Checkout</button>
          </footer>
        )}
      </aside>
    </>
  );
}
