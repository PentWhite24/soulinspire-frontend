import { useMemo, useState } from "react";
import { INTENTIONS as FALLBACK_INTENTIONS } from "../data/intentions.js";
import { useStore } from "../context/StoreContext.jsx";
import ProductCard from "./ProductCard.jsx";

const SORTS = {
  featured: (a, b) => a.rank - b.rank,
  new: (a, b) => (b.badge === "New") - (a.badge === "New") || a.rank - b.rank,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
};

export default function Shop({ query, category, setCategory, savedOnly, setSavedOnly, onOpen, onReset }) {
  const { saved, catalogue } = useStore();
  const { status, products, categories, config, error, reload } = catalogue;
  const INTENTIONS = config?.intentions?.length ? config.intentions : FALLBACK_INTENTIONS;
  const [sort, setSort] = useState("featured");
  const [intent, setIntent] = useState(() => new Date().getDate());

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => category === "all" || p.cat === category)
      .filter((p) => !savedOnly || saved.has(p.id))
      .filter((p) => !q || `${p.name} ${p.line} ${p.desc} ${p.cat}`.toLowerCase().includes(q))
      .sort(SORTS[sort]);
  }, [products, query, category, savedOnly, saved, sort]);

  return (
    <>
      <section className="wrap hero">
        <div>
          <div className="eyebrow">Autumn edit · 2026</div>
          <h1>Goods for a life lived <em>on purpose.</em></h1>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          <p>Journals, candles, apparel and small rituals that help you slow down and show up. Designed in Nigeria, packed by hand.</p>
          <div className="intent">
            <span className="eyebrow">Today's intention</span>
            <q>{INTENTIONS[intent % INTENTIONS.length]}</q>
            <button onClick={() => setIntent((i) => i + 1)}>Draw another</button>
          </div>
        </div>
      </section>

      <section className="wrap" id="products">
        <div className="filters">
          <div className="chips" role="group" aria-label="Category">
            {categories.map((c) => (
              <button key={c.id} className="chip" aria-pressed={category === c.id && !savedOnly}
                onClick={() => { setCategory(c.id); setSavedOnly(false); }}>
                {c.label}
              </button>
            ))}
            <button className="chip" aria-pressed={savedOnly} onClick={() => setSavedOnly(!savedOnly)}>♡ Saved</button>
          </div>
          <select id="sort" aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="new">New in</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>

        <div className="resultnote num" aria-live="polite">
          {status === "ready" && <>{list.length} {list.length === 1 ? "product" : "products"}{query && ` matching “${query}”`}</>}
          {status === "loading" && "Loading products…"}
        </div>

        <div className="grid" aria-busy={status === "loading"}>
          {status === "error" ? (
            <div className="empty" role="alert">
              <h3 style={{ fontSize: 26, color: "var(--ink)" }}>The shop couldn't load</h3>
              <p>{error.message}</p>
              <button className="ghost" onClick={reload}>Try again</button>
            </div>
          ) : status === "loading" ? (
            Array.from({ length: 6 }, (_, i) => <div key={i} className="card skeleton" aria-hidden="true" />)
          ) : list.length ? (
            list.map((p) => <ProductCard key={p.id} product={p} onOpen={onOpen} />)
          ) : (
            <div className="empty">
              <h3 style={{ fontSize: 26, color: "var(--ink)" }}>Nothing here yet</h3>
              <p>{savedOnly ? "Tap the heart on any product to save it for later." : "Try a different search or category."}</p>
              <button className="ghost" onClick={onReset}>Show all products</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
