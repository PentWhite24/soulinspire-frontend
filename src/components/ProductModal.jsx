import { Fragment, useEffect, useRef, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { formatNaira } from "../lib/pricing.js";
import ProductArt from "./ProductArt.jsx";

export default function ProductModal({ productId, onClose, onAdded }) {
  const ref = useRef(null);
  const { addToCart, catalogue } = useStore();
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);
  const p = productId ? catalogue.byId[productId] ?? null : null;

  useEffect(() => {
    const d = ref.current;
    if (p) {
      setQty(1); setSize(null); setSizeError(false);
      if (!d.open) d.showModal();
    } else if (d.open) d.close();
  }, [p]);

  const add = () => {
    if (p.sizes && !size) return setSizeError(true);
    if (addToCart(p.id, size, qty)) onAdded();
  };

  return (
    <dialog ref={ref} aria-labelledby="pdTitle" onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}>
      {p && (
        <>
          <button className="close" onClick={() => ref.current.close()} aria-label="Close">×</button>
          <div className="pd">
            <div className="art" style={{ background: p.bg }}><ProductArt product={p} /></div>
            <div className="pd-body">
              <span className="eyebrow">{catalogue.categories.find((c) => c.id === p.cat)?.label ?? p.cat}</span>
              <h2 id="pdTitle">{p.name}</h2>
              <p className="line">“{p.line}”</p>
              <div className="price num" style={{ fontSize: 20 }}>{formatNaira(p.price)}</div>
              <p>{p.desc}</p>
              <dl className="facts">
                {p.facts.map(([k, v]) => (<Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>))}
                <dt>Stock</dt>
                <dd style={{ color: p.stock <= 5 ? "var(--bad)" : "var(--ok)" }}>{p.stock <= 5 ? `Only ${p.stock} left` : "In stock"}</dd>
              </dl>

              {p.sizes && (
                <div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>Size</div>
                  <div className="sizes">
                    {p.sizes.map((s) => (
                      <button key={s} className="size" aria-pressed={size === s} onClick={() => { setSize(s); setSizeError(false); }}>{s}</button>
                    ))}
                  </div>
                  {sizeError && <p className="err" style={{ marginTop: 6 }}>Choose a size to add this to your bag.</p>}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: "auto" }}>
                <div className="qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                  <span className="num">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <button className="primary" style={{ flex: 1 }} onClick={add}>Add to bag · {formatNaira(p.price * qty)}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
