# Soulinspire Store

React storefront for Soulinspire: catalogue with search, categories and sorting, saved items, product details with sizes, a shopping bag, and checkout with Nigerian delivery zones, 7.5% VAT, promo codes and payment options.

Front end only. Orders are not sent anywhere and no payment is taken.

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
```

## Project layout

```
src/
  data/products.js        catalogue, categories, daily intentions
  lib/pricing.js          Naira formatting, delivery zones, VAT, promo codes, totals
  lib/storage.js          safe localStorage helper
  context/StoreContext.jsx  bag and saved items (shared state)
  components/             Header, Shop, ProductCard, ProductArt, ProductModal,
                          CartDrawer, Checkout, Confirmation, Icons
  App.jsx                 page switching (shop → checkout → confirmation)
  styles.css              all styling, light and dark themes
```

## Adding real product photos

1. Put the photo in `public/products/`, e.g. `public/products/rooted-journal.jpg`.
2. In `src/data/products.js`, add `image: "products/rooted-journal.jpg"` to that product.

Products without an `image` show an illustrated placeholder. Portrait photos (4:5) fit the cards best.

## Changing prices, delivery fees or promo codes

- Prices and product details: `src/data/products.js`
- Delivery fees, free-delivery threshold, VAT and promo codes: `src/lib/pricing.js`
