# Soulinspire Store

React storefront for Soulinspire: catalogue with search, categories and sorting, saved items, product details with sizes, a shopping bag, and checkout with Nigerian delivery zones, 7.5% VAT, promo codes and payment options.

The store loads its products, categories, delivery zones and VAT rate from the Soulinspire API, and sends orders to it. For development, use the [Soulinspire mock API](https://github.com/PentWhite24/soulinspire-mock-api), which serves dummy data and never takes real payments.

## Run it

Requires Node.js 18 or newer.

Start the mock API first, in its own terminal:

```bash
git clone https://github.com/PentWhite24/soulinspire-mock-api.git
cd soulinspire-mock-api
npm install
npm start        # http://localhost:4000/api
```

Then start the store:

```bash
npm install
npm run dev      # local dev server at http://localhost:5173
npm run build    # production build in dist/
```

## Connect to an API

The store calls the API at `VITE_API_URL`, which defaults to `http://localhost:4000/api`.

To use another API, copy `.env.example` to `.env.local` for development or `.env.production` for a build, and set the address:

```
VITE_API_URL=https://soulinspire-api.example.com/api
```

Vite writes the value into the built JavaScript when you run `npm run build`, so rebuild after changing it, and never put a secret in it. `.env` files are ignored by Git.

If the API can't be reached, the shop shows an error with a **Try again** button instead of products.

## Project layout

```
src/
  data/intentions.js      daily intentions shown until the API sends its own
  lib/api.js              API client; reads VITE_API_URL
  lib/pricing.js          Naira formatting and bag totals from the API's settings
  lib/storage.js          safe localStorage helper
  context/StoreContext.jsx  catalogue from the API, bag and saved items (shared state)
  components/             Header, Shop, ProductCard, ProductArt, ProductModal,
                          CartDrawer, Checkout, Confirmation, Icons
  App.jsx                 page switching (shop → checkout → confirmation)
  styles.css              all styling, light and dark themes
```

## Changing products, prices, delivery fees or promo codes

Products, prices, stock, delivery fees, the free-delivery threshold, VAT and promo codes all come from the API. With the mock API, edit `src/data/catalog.js` and `src/pricing.js` in that project and restart it. Products without an `image` show an illustrated placeholder; an `image` can be any full URL.
