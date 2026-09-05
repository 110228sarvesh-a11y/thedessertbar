function $(selector, root=document){ return root.querySelector(selector); }
function $$(selector, root=document){ return Array.from(root.querySelectorAll(selector)); }

// ------------------------------
// Navigation
// ------------------------------
function toggleMenu(){
  const nav = $('#mainNav');
  if(nav) nav.classList.toggle('mobile-open');
}

document.addEventListener('click', function(e){
  const nav = $('#mainNav');
  const button = $('.menu-btn');
  if(nav && nav.classList.contains('mobile-open') && !nav.contains(e.target) && e.target !== button){
    nav.classList.remove('mobile-open');
  }
});
$$('#mainNav a').forEach(link => link.addEventListener('click', () => $('#mainNav')?.classList.remove('mobile-open')));

// ------------------------------
// Helpers
// ------------------------------
function localToday(){
  const d = new Date();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${d.getFullYear()}-${m}-${day}`;
}
function escapeHtml(text){
  const d = document.createElement('div');
  d.textContent = text == null ? '' : String(text);
  return d.innerHTML;
}
function openWhatsApp(text){
  window.open('https://wa.me/918667607462?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

// ------------------------------
// Order form
// ------------------------------
const form = $('#orderForm');
const dateInput = $('#date');
if(dateInput) dateInput.min = localToday();
if($('#year')) $('#year').textContent = new Date().getFullYear();

if(form){
  form.addEventListener('submit', function(event){
    event.preventDefault();
    const name = $('#name')?.value.trim() || 'Not specified';
    const type = $('#type')?.value || 'Not specified';
    const date = $('#date')?.value || 'Not specified';
    const quantity = $('#quantity')?.value.trim() || 'Not specified';
    const message = $('#message')?.value.trim() || 'Not specified';
    const text = `Hi The Dessert Bar! 🍰\n\nI'd like to place an order enquiry.\n\nName: ${name}\nLooking for: ${type}\nEvent date: ${date}\nQuantity / size: ${quantity}\nMy idea: ${message}\n\nPlease let me know the available options and details.\n\nThank you! ♡`;
    openWhatsApp(text);
  });
}

// Pre-fill enquiry form from product links
$$('[data-product]').forEach(button => {
  button.addEventListener('click', function(){
    const product = button.dataset.product;
    const type = $('#type');
    const message = $('#message');
    if(type){
      const option = Array.from(type.options).find(o => o.textContent.trim().toLowerCase() === product.trim().toLowerCase());
      type.value = option ? option.value : (product.toLowerCase().includes('stall') ? 'Event Dessert Stall' : 'Custom Cake');
    }
    if(message && !message.value.trim()) message.value = 'I am interested in: ' + product;
  });
});

// ------------------------------
// Signature menu filter
// ------------------------------
const signatureFilters = $$('.filter');
const signatureCards = $$('.signature-card');
signatureFilters.forEach(filter => filter.addEventListener('click', () => {
  signatureFilters.forEach(btn => btn.classList.remove('active'));
  filter.classList.add('active');
  const selected = filter.dataset.filter;
  signatureCards.forEach(card => {
    card.style.display = selected === 'all' || card.dataset.category === selected ? '' : 'none';
  });
}));

// ------------------------------
// Shop filtering + search
// ------------------------------
const shopCards = $$('.shop-card');
const shopFilters = $$('.shop-filter');
const shopSearch = $('#shopSearch');
const shopEmpty = $('#shopEmpty');
function applyShopFilters(){
  const active = $('.shop-filter.active')?.dataset.shopFilter || 'all';
  const q = (shopSearch?.value || '').trim().toLowerCase();
  let visible = 0;
  shopCards.forEach(card => {
    const categoryMatch = active === 'all' || card.dataset.shopCategory === active;
    const textMatch = !q || card.textContent.toLowerCase().includes(q);
    const show = categoryMatch && textMatch;
    card.classList.toggle('is-hidden', !show);
    if(show) visible++;
  });
  shopEmpty?.classList.toggle('show', visible === 0);
}
shopFilters.forEach(filter => filter.addEventListener('click', () => {
  shopFilters.forEach(btn => btn.classList.remove('active'));
  filter.classList.add('active');
  applyShopFilters();
}));
shopSearch?.addEventListener('input', applyShopFilters);

// ------------------------------
// Product modal + basket
// ------------------------------
let cart = [];
try{ cart = JSON.parse(localStorage.getItem('dessertBarCart') || '[]'); }catch(e){ cart = []; }
let selectedProduct = null;
const modal = $('#productModal');
const cartDrawer = $('#cartDrawer');

function saveCart(){ localStorage.setItem('dessertBarCart', JSON.stringify(cart)); }
function openProductModal(card){
  selectedProduct = {
    name: card.dataset.product,
    image: card.dataset.image,
    category: $('.shop-body span', card)?.textContent || 'DESSERT',
    description: $('.shop-body p', card)?.textContent || ''
  };
  $('#modalProductImage').src = selectedProduct.image;
  $('#modalProductImage').alt = selectedProduct.name;
  $('#modalProductName').textContent = selectedProduct.name;
  $('#modalProductCategory').textContent = selectedProduct.category;
  $('#modalProductDescription').textContent = selectedProduct.description;
  $('#modalFlavour').value = 'Chocolate';
  $('#modalSize').value = 'Small';
  $('#modalQty').value = 1;
  $('#modalNote').value = '';
  modal?.classList.add('open');
  modal?.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-lock');
}
function closeProductModal(){
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-lock');
}
$$('.customize-btn').forEach(btn => btn.addEventListener('click', () => openProductModal(btn.closest('.shop-card'))));
$('#closeModal')?.addEventListener('click', closeProductModal);
$('[data-close-modal]')?.addEventListener('click', closeProductModal);

$('#qtyMinus')?.addEventListener('click', () => {
  const input = $('#modalQty'); input.value = Math.max(1, Number(input.value || 1) - 1);
});
$('#qtyPlus')?.addEventListener('click', () => {
  const input = $('#modalQty'); input.value = Math.min(20, Number(input.value || 1) + 1);
});
$('#modalQty')?.addEventListener('change', () => {
  const input = $('#modalQty'); input.value = Math.max(1, Math.min(20, Number(input.value || 1)));
});

$('#addToCart')?.addEventListener('click', () => {
  if(!selectedProduct) return;
  const item = {
    ...selectedProduct,
    flavour: $('#modalFlavour').value,
    size: $('#modalSize').value,
    qty: Math.max(1, Math.min(20, Number($('#modalQty').value) || 1)),
    note: $('#modalNote').value.trim()
  };
  // Merge identical selections instead of creating duplicate basket lines.
  const existing = cart.find(x => x.name===item.name && x.flavour===item.flavour && x.size===item.size && x.note===item.note);
  if(existing) existing.qty = Math.min(20, existing.qty + item.qty);
  else cart.push(item);
  saveCart(); renderCart(); closeProductModal(); openCartDrawer();
});

function renderCart(){
  const box = $('#cartItems');
  if(!box) return;
  const count = cart.reduce((sum,item) => sum + Number(item.qty || 0), 0);
  if($('#cartCount')) $('#cartCount').textContent = count;
  if($('#cartTotalItems')) $('#cartTotalItems').textContent = count;
  if(!cart.length){
    box.innerHTML = '<div class="empty-cart">Your basket is empty.<br><span>Add a sweet treat to get started.</span></div>';
    return;
  }
  box.innerHTML = cart.map((item,index) => `
    <div class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div>
        <h4>${escapeHtml(item.name)}</h4>
        <p>Flavour: ${escapeHtml(item.flavour)}<br>Size: ${escapeHtml(item.size)}${item.note ? '<br>Note: '+escapeHtml(item.note) : ''}</p>
        <button class="remove-item" data-remove="${index}">Remove</button>
        <div class="cart-qty"><button type="button" data-cart-minus="${index}">−</button><span>${Number(item.qty || 1)}</span><button type="button" data-cart-plus="${index}">+</button></div>
      </div>
    </div>`).join('');
  $$('[data-remove]',box).forEach(btn => btn.addEventListener('click', () => { cart.splice(Number(btn.dataset.remove),1); saveCart(); renderCart(); }));
  $$('[data-cart-minus]',box).forEach(btn => btn.addEventListener('click', () => changeCartQuantity(Number(btn.dataset.cartMinus),-1)));
  $$('[data-cart-plus]',box).forEach(btn => btn.addEventListener('click', () => changeCartQuantity(Number(btn.dataset.cartPlus),1)));
}
function changeCartQuantity(index, delta){
  if(!cart[index]) return;
  cart[index].qty = Math.max(0, Math.min(20, Number(cart[index].qty || 1) + delta));
  if(cart[index].qty === 0) cart.splice(index,1);
  saveCart(); renderCart();
}
function openCartDrawer(){
  cartDrawer?.classList.add('open');
  cartDrawer?.setAttribute('aria-hidden','false');
  $('.cart-overlay')?.classList.add('show');
}
function closeCartDrawer(){
  cartDrawer?.classList.remove('open');
  cartDrawer?.setAttribute('aria-hidden','true');
  $('.cart-overlay')?.classList.remove('show');
}
$('#openCart')?.addEventListener('click', openCartDrawer);
$('#closeCart')?.addEventListener('click', closeCartDrawer);
$('#clearCart')?.addEventListener('click', () => { cart=[]; saveCart(); renderCart(); });
$('#checkoutCart')?.addEventListener('click', () => {
  if(!cart.length){ alert('Your basket is empty. Add a dessert first!'); return; }
  const lines = cart.map((item,i) => `${i+1}. ${item.name} — ${item.flavour}, ${item.size}, Qty ${item.qty}${item.note ? ' — '+item.note : ''}`).join('\n');
  openWhatsApp(`Hi The Dessert Bar! 🍰\n\nI'd like to enquire about these items from my basket:\n\n${lines}\n\nPlease let me know the prices, availability and delivery/pickup details.\n\nThank you! ♡`);
});

// Add an overlay for the basket if the markup doesn't already contain one.
if(!$('.cart-overlay')){
  const overlay = document.createElement('div');
  overlay.className='cart-overlay';
  document.body.appendChild(overlay);
  overlay.addEventListener('click',closeCartDrawer);
}

// ------------------------------
// Gallery lightbox
// ------------------------------
const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
const lightboxCaption = $('#lightboxCaption');
const zoomImages = $$('.zoomable');
let lightboxIndex = 0;
function openLightbox(index){
  if(!zoomImages.length) return;
  lightboxIndex = (index + zoomImages.length) % zoomImages.length;
  const img = zoomImages[lightboxIndex];
  lightboxImage.src = img.src;
  lightboxImage.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-lock');
}
function closeLightbox(){
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-lock');
}
function moveLightbox(delta){ openLightbox(lightboxIndex + delta); }
zoomImages.forEach((img,index) => img.addEventListener('click',() => openLightbox(index)));
$('#lightboxClose')?.addEventListener('click',closeLightbox);
$('#lightboxPrev')?.addEventListener('click',() => moveLightbox(-1));
$('#lightboxNext')?.addEventListener('click',() => moveLightbox(1));
lightbox?.addEventListener('click',e => { if(e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ closeProductModal(); closeCartDrawer(); closeLightbox(); }
  if(lightbox?.classList.contains('open')){
    if(e.key === 'ArrowLeft') moveLightbox(-1);
    if(e.key === 'ArrowRight') moveLightbox(1);
  }
});

renderCart();
applyShopFilters();
