import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { storage } from "../lib/storage.js";

const StoreContext = createContext(null);

function initialCart() {
  // Example bag on first visit so the checkout flow is visible straight away.
  return storage.get("cart", null) ?? [
    { id: "journal-rooted", size: null, qty: 1 },
    { id: "candle-still", size: null, qty: 1 },
  ];
}

function cartReducer(cart, action) {
  switch (action.type) {
    case "add": {
      const { id, size, qty } = action;
      const i = cart.findIndex((l) => l.id === id && l.size === size);
      if (i === -1) return [...cart, { id, size, qty }];
      return cart.map((l, j) => (j === i ? { ...l, qty: l.qty + qty } : l));
    }
    case "setQty":
      return cart.map((l, j) => (j === action.index ? { ...l, qty: Math.max(1, Math.min(action.max ?? l.qty, action.qty)) } : l));
    case "remove":
      return cart.filter((_, j) => j !== action.index);
    case "prune": // drop lines for products the API no longer sells
      return cart.filter((l) => action.byId[l.id]);
    case "clear":
      return [];
    default:
      return cart;
  }
}

// Products, categories and shop settings, loaded from the API when the store opens.
function useCatalogue() {
  const [state, setState] = useState({ status: "loading", products: [], categories: [], config: null, error: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: "loading", error: null }));
    try {
      const [products, categories, config] = await Promise.all([api.products(), api.categories(), api.config()]);
      setState({ status: "ready", products, categories, config, error: null });
    } catch (error) {
      setState((s) => ({ ...s, status: "error", error }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const byId = useMemo(() => Object.fromEntries(state.products.map((p) => [p.id, p])), [state.products]);
  return { ...state, byId, reload: load };
}

export function StoreProvider({ children }) {
  const catalogue = useCatalogue();
  const { byId, status } = catalogue;
  const [cart, dispatch] = useReducer(cartReducer, undefined, initialCart);
  const [saved, setSaved] = useState(() => new Set(storage.get("saved", [])));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  useEffect(() => storage.set("cart", cart), [cart]);
  useEffect(() => storage.set("saved", [...saved]), [saved]);
  useEffect(() => { if (status === "ready") dispatch({ type: "prune", byId }); }, [status, byId]);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addToCart = useCallback(
    (id, size, qty = 1) => {
      const p = byId[id];
      if (!p) return false;
      const inBag = cart.find((l) => l.id === id && l.size === size)?.qty ?? 0;
      const allowed = Math.min(qty, p.stock - inBag);
      if (allowed <= 0) {
        notify(`Only ${p.stock} in stock`);
        return false;
      }
      dispatch({ type: "add", id, size, qty: allowed });
      notify(`Added to bag · ${p.name}`);
      return true;
    },
    [byId, cart, notify]
  );

  const toggleSaved = useCallback(
    (id) => {
      setSaved((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        notify(next.has(id) ? "Saved for later" : "Removed from saved");
        return next;
      });
    },
    [notify]
  );

  const value = useMemo(
    () => ({ catalogue, cart, dispatch, addToCart, saved, toggleSaved, toast, notify }),
    [catalogue, cart, addToCart, saved, toggleSaved, toast, notify]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
