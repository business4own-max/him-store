// Both scripts load with defer, so the page and product array are ready.
'use strict';
const $ = selector => document.querySelector(selector);
const money = amount => '₹' + amount.toLocaleString('en-IN');
const findProduct = id => products.find(product => product.id === Number(id));
const cartKey = 'him-store-cart-v1';
const localPreview = location.protocol === 'file:';
const previewKey = cartKey + new URL('.', location.href).pathname + '|';

// Some browsers isolate storage for each local HTML file. Keep a second,
// tab-scoped copy of product IDs and quantities for double-click previews.
function readCart() {
  try {
    const raw = localPreview && window.name.startsWith(previewKey)
      ? window.name.slice(previewKey.length) : localStorage.getItem(cartKey);
    const saved = JSON.parse(raw || '{}');
    return Object.fromEntries(Object.entries(saved).filter(([id, quantity]) =>
      findProduct(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99));
  } catch { return {}; }
}
let cart = readCart();
const entries = () => Object.entries(cart).map(([id, quantity]) => ({product: findProduct(id), quantity}));
const total = () => entries().reduce((sum, line) => sum + line.product.price * line.quantity, 0);
function updateCount() {
  $('#count').textContent = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}
function saveCart() {
  const data = JSON.stringify(cart);
  if (localPreview) window.name = previewKey + data;
  try { localStorage.setItem(cartKey, data); }
  catch { notify('Browser storage is unavailable. Keep this tab open.'); }
  updateCount();
}
let noticeTimer;
function notify(message) {
  $('#notice').textContent = message;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => $('#notice').textContent = '', 2500);
}
$('#announcement').textContent = store.announcement;
document.querySelectorAll('.chat').forEach(link => {
  link.href = 'https://wa.me/' + store.whatsapp;
  link.target = '_blank';
  link.rel = 'noopener';
});
$('#menu').onclick = () => {
  const open = $('#navigation').classList.toggle('open');
  $('#menu').setAttribute('aria-expanded', String(open));
  $('#menu').setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#navigation').classList.contains('open')) {
    $('#menu').click();
    $('#menu').focus();
  }
});

// Only catalogue data (edited by the store owner) enters these templates.
const detailUrl = product => 'product.html?id=' + product.id;
function card(product) {
  return `<article class="card"><a href="${detailUrl(product)}"><span class="photo">
    <img loading="lazy" width="600" height="640" style="height:auto" src="${product.image}" alt="H.I.M. ${product.formula} packaging"></span>
    <span class="category">${product.category} care</span><h3>${product.name}</h3></a>
    <small>${product.size}</small><span class="price">${money(product.price)}</span>
    <button class="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag +</button></article>`;
}
if ($('#featured')) $('#featured').innerHTML = products.slice(0, 4).map(card).join('');
if ($('#catalog')) {
  const categories = ['All', ...new Set(products.map(p => p.category))];
  $('#filters').innerHTML = categories.map(c => `<button data-filter="${c}" aria-pressed="${c === 'All'}">${c}</button>`).join('');
  $('#catalog').innerHTML = products.map(card).join('');
  $('#filters').onclick = event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    $('#filters').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    const category = button.dataset.filter;
    $('#catalog').innerHTML = products.filter(p => category === 'All' || p.category === category).map(card).join('');
  };
}
if ($('#detail')) {
  const product = findProduct(new URLSearchParams(location.search).get('id'));
  if (product) {
    const title = product.name + ' | H.I.M.';
    const description = product.formula + ' for men, ' + product.size + ' · ' + money(product.price);
    document.title = title;
    for (const [tag, value] of Object.entries({title, description, image: 'https://himscience.store/' + product.image,
      url: 'https://himscience.store/' + detailUrl(product), 'image:alt': product.formula + ' packaging'})) {
      document.querySelector(`[property="og:${tag}"]`).content = value;
    }
    $('[name=description]').content = description;
    $('#detail').innerHTML = `<a class="back" href="shop.html">← Collection</a><div class="split">
      <img src="${product.image}" alt="H.I.M. ${product.formula} packaging">
      <div><span class="kicker">${product.category} care</span><h1>${product.name}</h1>
      <p>${product.formula} for Men</p><p>${product.size} · <strong>${money(product.price)}</strong></p>
      <button class="button gold" data-add="${product.id}">Add to bag +</button> <a class="button" href="cart.html">View bag</a></div></div>`;
  } else $('#detail').innerHTML = '<h1>Product unavailable</h1><p>Select an essential from the collection.</p><a class="button" href="shop.html">Browse products</a>';
}
const emptyBag = '<p>Your bag is empty.</p><a class="button gold" href="shop.html">Shop the collection ↗</a>';
function renderCart() {
  if (!$('#cart')) return;
  $('#cart').innerHTML = entries().length ? entries().map(({product:p, quantity:q}) => `<article class="cart-row">
    <img src="${p.image}" alt="${p.formula} packaging"><div><h3><a href="${detailUrl(p)}">${p.name}</a></h3>
    <p>${p.size} · ${money(p.price)} each · <strong>${money(p.price*q)}</strong></p><div class="qty">
    <button data-change="-1" data-id="${p.id}" aria-label="Decrease ${p.name} quantity" ${q === 1 ? 'disabled' : ''}>−</button>
    <span>${q}</span><button data-change="1" data-id="${p.id}" aria-label="Increase ${p.name} quantity" ${q === 99 ? 'disabled' : ''}>+</button>
    <button class="remove" data-remove="${p.id}" aria-label="Remove ${p.name}">Remove</button></div></div></article>`).join('') +
    `<div class="total"><span>Total</span>${money(total())}</div><a class="button gold" href="checkout.html">Checkout ↗</a>` : emptyBag;
}
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const {add, remove, change, id} = button.dataset;
  if (add) {
    if (cart[add] === 99) return notify('Maximum 99 per product.');
    cart[add] = (cart[add] || 0) + 1;
    notify(findProduct(add).name + ' added to bag');
  } else if (remove) delete cart[remove];
  else if (change) cart[id] = Math.min(99, Math.max(1, cart[id] + Number(change)));
  else return;
  saveCart();
  renderCart();
});
function renderSummary() {
  if (!$('#summary')) return;
  $('#order').hidden = !entries().length;
  $('#summary').innerHTML = entries().length ? entries().map(({product:p, quantity:q}) =>
    `<div class="summary-line"><span>${p.name} × ${q}</span><strong>${money(p.price*q)}</strong></div>`).join('') +
    `<div class="total">Total <span>${money(total())}</span></div><a href="cart.html">Edit bag</a>` : emptyBag;
}
if ($('#order')) {
  $('#upi').innerHTML = store.upiId ? `<p>UPI ID: ${store.upiId}</p>` : '<p>UPI ID pending. Contact us on WhatsApp for payment details.</p>';
  $('#upi').innerHTML += store.qrImage ? `<img src="${store.qrImage}" alt="Scan the H.I.M. UPI payment QR code">` : '<div class="qr">UPI QR<br>placeholder</div>';
  $('#order').onsubmit = event => {
    event.preventDefault();
    const form = event.currentTarget;
    for (const input of [form.elements.customer, form.elements.address]) {
      if (!input.value.trim()) { input.setCustomValidity('Please enter your details.'); input.reportValidity(); input.setCustomValidity(''); return; }
    }
    if (!entries().length) return renderSummary();
    const lines = entries().map(({product:p,quantity:q}) => `${p.name} (${p.size}) × ${q} — ${money(p.price*q)}`);
    const message = ['Hello H.I.M., I would like to order:', ...lines, 'Total: ' + money(total()), '',
      'Name: ' + form.elements.customer.value.trim(), 'Phone: ' + form.elements.phone.value.trim(),
      'Address: ' + form.elements.address.value.trim()].join('\n');
    window.open('https://wa.me/' + store.whatsapp + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
  };
}
// Refresh totals after browser Back or a cart edit in another hosted tab.
function refresh() { cart = readCart(); updateCount(); renderCart(); renderSummary(); }
window.addEventListener('pageshow', refresh);
window.addEventListener('storage', event => { if (event.key === cartKey) refresh(); });
refresh();
