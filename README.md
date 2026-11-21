# H.I.M. Store

A mobile-first storefront for men's skin, hair and body care. Customers can browse eight products, filter by category, manage a shopping bag and prepare an order on WhatsApp.

## Open the website

Download the project, extract it if needed, and open `index.html` in your browser. The site uses plain HTML, CSS and JavaScript. It runs without a build step.

## Edit the store

- Edit product names, sizes, prices and image paths in `js/products.js`. Prices are in Indian rupees.
- Set the announcement, WhatsApp number, UPI ID and QR image path in the same file.
- Replace the placeholder product images in `images/`.
- Edit colours, typography and layout in `css/style.css`.
- The shopping bag and checkout code lives in `js/main.js`. Customers review the prepared message and tap Send in WhatsApp.

## Publish

Serve the repository root on a static host. Keep `index.html`, the other HTML pages and the asset folders together. Before launch, configure the payment details and check the order flow with the store's WhatsApp number.
