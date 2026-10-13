import { useStore } from "../context/StoreContext.jsx";
import { formatNaira } from "../lib/pricing.js";
import { HeartIcon } from "./Icons.jsx";
import ProductArt from "./ProductArt.jsx";

export default function ProductCard({ product: p, onOpen }) {
  const { saved, toggleSaved, addToCart } = useStore();
  const low = p.stock <= 5;

  return (
    <article className="card">
      <div style={{ position: "relative" }}>
        <button className="art" style={{ background: p.bg }} onClick={() => onOpen(p.id)} aria-label={`View ${p.name}`}>
          <ProductArt product={p} />
          {low ? <span className="badge low">Only {p.stock} left</span> : p.badge && <span className="badge">{p.badge}</span>}
        </button>
        <button className="heart" aria-pressed={saved.has(p.id)} aria-label={`Save ${p.name}`} onClick={() => toggleSaved(p.id)}>
          <HeartIcon />
        </button>
      </div>
      <h3>{p.name}</h3>
      <p className="line">“{p.line}”</p>
      <div className="row">
        <span className="price num">{formatNaira(p.price)}</span>
        <button className="add" onClick={() => (p.sizes ? onOpen(p.id) : addToCart(p.id, null, 1))}>
          {p.sizes ? "Choose size" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}
