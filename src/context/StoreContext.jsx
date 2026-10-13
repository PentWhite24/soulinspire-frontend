import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { BY_ID } from "../data/products.js";
import { storage } from "../lib/storage.js";

const StoreContext = createContext(null);

function initialCart() {
  const saved = storage.get("cart", null);
  if (saved) return saved.filter((l) => BY_ID[l.id]);
  // Example bag on first visit so the checkout flow is visible straight away.
  return [
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
      return cart.map((l, j) => (j === action.index ? { ...l, qty: Math.max(1, Math.min(BY_ID[l.id].stock, action.qty)) } : l));
    case "remove":
      return cart.filter((_, j) => j !== action.index);
    case "clear":
      return [];
    default:
      return cart;
  }
}

export function StoreProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, initialCart);
  const [saved, setSaved] = useState(() => new Set(storage.get("saved", [])));
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  useEffect(() => storage.set("cart", cart), [cart]);
  useEffect(() => storage.set("saved", [...saved]), [saved]);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const addToCart = useCallback(
    (id, size, qty = 1) => {
      const p = BY_ID[id];
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
    [cart, notify]
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
    () => ({ cart, dispatch, addToCart, saved, toggleSaved, toast, notify }),
    [cart, addToCart, saved, toggleSaved, toast, notify]
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
