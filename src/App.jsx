import { useCallback, useEffect, useState } from "react";
import { useStore } from "./context/StoreContext.jsx";
import Header from "./components/Header.jsx";
import Shop from "./components/Shop.jsx";
import ProductModal from "./components/ProductModal.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Checkout from "./components/Checkout.jsx";
import Confirmation from "./components/Confirmation.jsx";
import { api } from "./lib/api.js";

export default function App() {
  const { toast, notify } = useStore();
  const [view, setView] = useState("shop"); // shop | checkout | done
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [openProduct, setOpenProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [order, setOrder] = useState(null);

  const go = (v) => { setView(v); window.scrollTo(0, 0); };

  // The card payment page sends the customer back with ?order=…&reference=…; confirm the payment with the API.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (!reference) return;
    window.history.replaceState(null, "", window.location.pathname);
    api.verifyPayment(reference)
      .then(({ order }) => { setOrder({ order, payment: {} }); go("done"); })
      .catch((err) => notify(err.message));
  }, [notify]);
  const resetFilters = () => { setQuery(""); setCategory("all"); setSavedOnly(false); };
  const closeCart = useCallback(() => setCartOpen(false), []);

  return (
    <>
      <Header
        query={query}
        onQuery={(q) => { setQuery(q); if (view !== "shop") go("shop"); }}
        onHome={() => { resetFilters(); go("shop"); }}
        onSaved={() => { setSavedOnly(true); setView("shop"); setTimeout(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })); }}
        onCart={() => setCartOpen(true)}
      />

      <main>
        {view === "shop" && (
          <Shop query={query} category={category} setCategory={setCategory}
            savedOnly={savedOnly} setSavedOnly={setSavedOnly}
            onOpen={setOpenProduct} onReset={resetFilters} />
        )}
        {view === "checkout" && <Checkout onBack={() => go("shop")} onPlaced={(o) => { setOrder(o); go("done"); }} />}
        {view === "done" && order && <Confirmation order={order.order} payment={order.payment} onContinue={() => { resetFilters(); go("shop"); }} />}
      </main>

      <footer className="site">
        <div className="wrap">
          <span>© 2026 Soulinspire · Mindful goods, made with intention</span>
          <span>Help: hello@soulinspire.ng · Returns within 14 days</span>
        </div>
      </footer>

      <ProductModal productId={openProduct} onClose={() => setOpenProduct(null)}
        onAdded={() => { setOpenProduct(null); setCartOpen(true); }} />
      <CartDrawer open={cartOpen} onClose={closeCart} onCheckout={() => { setCartOpen(false); go("checkout"); }} />
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
