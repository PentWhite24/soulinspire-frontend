// Talks to the Soulinspire API. Set VITE_API_URL at build time to point the store at
// another API, for example VITE_API_URL=https://<front-door-host>/api in .env.production.
// Without it, the store uses the mock API running on this computer.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(status, body) {
    const e = body?.error || {};
    super(e.message || `The store couldn't reach the API (HTTP ${status}).`);
    this.status = status;
    this.code = e.code || "network_error";
    this.fields = e.fields || {};
    this.details = e.details || [];
  }
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, { error: { code: "network_error", message: `The store couldn't reach the API at ${API_URL}. Check that it is running and try again.` } });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export const api = {
  products: () => request("/products").then((d) => d.products),
  categories: () => request("/categories").then((d) => d.categories),
  config: () => request("/config"),
  validatePromo: (code) => request("/promo/validate", { method: "POST", body: { code } }).then((d) => d.promo),
  placeOrder: (order, idempotencyKey) =>
    request("/orders", { method: "POST", body: order, headers: { "Idempotency-Key": idempotencyKey } }),
  verifyPayment: (reference) => request(`/payments/verify/${encodeURIComponent(reference)}`),
};

export function newIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
