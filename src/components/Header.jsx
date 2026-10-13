import { useStore } from "../context/StoreContext.jsx";
import { BagIcon, HeartIcon, Logo, SearchIcon } from "./Icons.jsx";

export default function Header({ query, onQuery, onHome, onSaved, onCart }) {
  const { cart, saved } = useStore();
  const items = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <>
      <div className="ribbon">Free delivery on orders over ₦50,000 · Lagos, Port Harcourt &amp; Abuja same-week dispatch</div>
      <header className="bar">
        <div className="wrap">
          <button className="logo" onClick={onHome} aria-label="Soulinspire home">
            <Logo /> Soulinspire
          </button>
          <label className="search">
            <SearchIcon />
            <input id="q" type="search" placeholder="Search journals, candles, tees…" aria-label="Search products"
              value={query} onChange={(e) => onQuery(e.target.value)} />
          </label>
          <button className="iconbtn" onClick={onSaved} aria-label="Saved items">
            <HeartIcon /><span className="lbl">Saved</span>
            <span className="count num" data-zero={saved.size ? 0 : 1}>{saved.size}</span>
          </button>
          <button className="iconbtn" onClick={onCart} aria-label="Open bag">
            <BagIcon /><span className="lbl">Bag</span>
            <span className="count num" data-zero={items ? 0 : 1}>{items}</span>
          </button>
        </div>
      </header>
    </>
  );
}
