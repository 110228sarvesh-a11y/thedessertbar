/* =========================================
   THE DESSERT BAR
   PHONE-FRIENDLY JAVASCRIPT
========================================= */

const WHATSAPP_NUMBER = "918667607462";
const CART_KEY = "dessertBarCart";

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
let currentLightboxImages = [];
let currentLightboxIndex = 0;


/* =========================================
   MOBILE MENU
========================================= */

function toggleMenu() {
  const nav = document.getElementById("mainNav");
  const button = document.querySelector(".menu-btn");

  if (!nav) return;

  nav.classList.toggle("open");

  if (button) {
    const isOpen = nav.classList.contains("open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    button.textContent = isOpen ? "×" : "☰";
  }
}


/* Close mobile menu after clicking a link */

document.addEventListener("DOMContentLoaded", () => {

  const nav = document.getElementById("mainNav");

  if (nav) {
    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {

        nav.classList.remove("open");

        const button = document.querySelector(".menu-btn");

        if (button) {
          button.setAttribute("aria-expanded", "false");
          button.textContent = "☰";
        }

      });
    });
  }

});


/* =========================================
   WHATSAPP
========================================= */

function openWhatsApp(message) {

  const url =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

}


/* =========================================
   ORDER FORM PREFILL
========================================= */

function prefillOrder(product) {

  const type = document.getElementById("type");

  if (!type) return;

  const options = Array.from(type.options);

  const matchingOption = options.find(
    option => option.text.toLowerCase() === product.toLowerCase()
  );

  if (matchingOption) {
    type.value = matchingOption.value;
  }

  const message = document.getElementById("message");

  if (message) {

    if (
      message.value.trim() === "" ||
      message.value.toLowerCase().includes(product.toLowerCase())
    ) {
      message.value = `I'm interested in ${product}.`;
    }

  }

}


/* =========================================
   ORDER BUTTONS
========================================= */

document.addEventListener("click", event => {

  const button = event.target.closest(
    "[data-product]"
  );

  if (!button) return;

  const product = button.dataset.product;

  if (!product) return;

  prefillOrder(product);

});


/* =========================================
   PRODUCT FILTERS
========================================= */

function setupFilters() {

  const filters =
    document.querySelectorAll(".filter");

  const cards =
    document.querySelectorAll(".signature-card");

  if (!filters.length || !cards.length) return;

  filters.forEach(filter => {

    filter.addEventListener("click", () => {

      const selected =
        filter.dataset.filter || "all";

      filters.forEach(item => {
        item.classList.remove("active");
      });

      filter.classList.add("active");

      cards.forEach(card => {

        const category =
          card.dataset.category;

        if (
          selected === "all" ||
          category === selected
        ) {

          card.style.display = "";

        } else {

          card.style.display = "none";

        }

      });

    });

  });

}


/* =========================================
   SEARCH
========================================= */

function setupSearch() {

  const search =
    document.getElementById("productSearch");

  const cards =
    document.querySelectorAll(".signature-card");

  if (!search || !cards.length) return;

  search.addEventListener("input", () => {

    const query =
      search.value.trim().toLowerCase();

    cards.forEach(card => {

      const text =
        card.textContent.toLowerCase();

      card.style.display =
        text.includes(query) ? "" : "none";

    });

  });

}


/* =========================================
   CART
========================================= */

function saveCart() {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

}


function addToCart(product, flavour, size, quantity, note) {

  const existing =
    cart.find(item =>
      item.product === product &&
      item.flavour === flavour &&
      item.size === size &&
      item.note === note
    );

  if (existing) {

    existing.quantity += quantity;

  } else {

    cart.push({
      product,
      flavour,
      size,
      quantity,
      note
    });

  }

  saveCart();
  renderCart();

}


function removeFromCart(index) {

  cart.splice(index, 1);

  saveCart();
  renderCart();

}


function changeCartQuantity(index, amount) {

  if (!cart[index]) return;

  cart[index].quantity += amount;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();

}


function clearCart() {

  cart = [];

  saveCart();
  renderCart();

}


function renderCart() {

  const container =
    document.getElementById("cartItems");

  if (!container) return;

  if (!cart.length) {

    container.innerHTML = `
      <p class="empty-cart">
        Your basket is empty.
      </p>
    `;

    return;
  }


  container.innerHTML = cart.map((item, index) => {

    return `
      <div class="cart-item">

        <div class="cart-item-info">

          <strong>
            ${escapeHTML(item.product)}
          </strong>

          ${
            item.flavour
              ? `<small>Flavour: ${escapeHTML(item.flavour)}</small>`
              : ""
          }

          ${
            item.size
              ? `<small>Size: ${escapeHTML(item.size)}</small>`
              : ""
          }

          ${
            item.note
              ? `<small>${escapeHTML(item.note)}</small>`
              : ""
          }

        </div>

        <div class="cart-controls">

          <button
            type="button"
            onclick="changeCartQuantity(${index}, -1)">
            −
          </button>

          <span>
            ${item.quantity}
          </span>

          <button
            type="button"
            onclick="changeCartQuantity(${index}, 1)">
            +
          </button>

        </div>

        <button
          type="button"
          class="remove-cart"
          onclick="removeFromCart(${index})">
          ×
        </button>

      </div>
    `;

  }).join("");

}


/* =========================================
   CART PANEL
========================================= */

function openCart() {

  const panel =
    document.getElementById("cartPanel");

  if (panel) {
    panel.classList.add("open");
  }

}


function closeCart() {

  const panel =
    document.getElementById("cartPanel");

  if (panel) {
    panel.classList.remove("open");
  }

}


document.addEventListener("DOMContentLoaded", () => {

  const closeButton =
    document.getElementById("closeCart");

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      closeCart
    );
  }


  const clearButton =
    document.getElementById("clearCart");

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      clearCart
    );
  }


  const checkoutButton =
    document.getElementById("checkoutCart");

  if (checkoutButton) {

    checkoutButton.addEventListener(
      "click",
      () => {

        if (!cart.length) {

          alert("Your basket is empty.");

          return;

        }

        let message =
          "Hi The Dessert Bar! I'd like to enquire about these items:%0A";

        message = "";

        cart.forEach((item, index) => {

          message +=
            `${index + 1}. ${item.product}`;

          if (item.flavour) {
            message +=
              ` | Flavour: ${item.flavour}`;
          }

          if (item.size) {
            message +=
              ` | Size: ${item.size}`;
          }

          message +=
            ` | Qty: ${item.quantity}`;

          if (item.note) {
            message +=
              ` | Note: ${item.note}`;
          }

          message += "\n";

        });

        message +=
          "\nPlease let me know the price and availability.";

        openWhatsApp(message);

      }
    );

  }

});


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================
   ORDER FORM
========================================= */

function setupOrderForm() {

  const form =
    document.getElementById("orderForm");

  if (!form) return;

  form.addEventListener("submit", event => {

    event.preventDefault();

    const name =
      document.getElementById("name")?.value.trim() || "";

    const type =
      document.getElementById("type")?.value || "";

    const date =
      document.getElementById("date")?.value || "";

    const quantity =
      document.getElementById("quantity")?.value.trim() || "";

    const message =
      document.getElementById("message")?.value.trim() || "";


    let whatsappMessage =
      `Hi The Dessert Bar! I'd like to place an enquiry.\n\n`;

    whatsappMessage +=
      `Name: ${name}\n`;

    whatsappMessage +=
      `Looking for: ${type}\n`;

    if (date) {
      whatsappMessage +=
        `Event date: ${date}\n`;
    }

    if (quantity) {
      whatsappMessage +=
        `Quantity / size: ${quantity}\n`;
    }

    if (message) {
      whatsappMessage +=
        `Details: ${message}\n`;
    }

    whatsappMessage +=
      `\nPlease let me know the price and availability.`;

    openWhatsApp(whatsappMessage);

  });

}


/* =========================================
   DATE
========================================= */

function setupDate() {

  const dateInput =
    document.getElementById("date");

  if (!dateInput) return;

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1)
      .padStart(2, "0");

  const day =
    String(today.getDate())
      .padStart(2, "0");

  dateInput.min =
    `${year}-${month}-${day}`;

}


/* =========================================
   IMAGE LIGHTBOX
========================================= */

function createLightbox() {

  if (document.querySelector(".lightbox")) {
    return;
  }

  const lightbox =
    document.createElement("div");

  lightbox.className = "lightbox";

  lightbox.innerHTML = `

    <button
      class="lightbox-close"
      aria-label="Close image">
      ×
    </button>

    <button
      class="lightbox-prev"
      aria-label="Previous image">
      ‹
    </button>

    <img
      class="lightbox-image"
      src=""
      alt="">

    <button
      class="lightbox-next"
      aria-label="Next image">
      ›
    </button>

  `;

  document.body.appendChild(lightbox);

  lightbox
    .querySelector(".lightbox-close")
    .addEventListener(
      "click",
      closeLightbox
    );

  lightbox
    .querySelector(".lightbox-prev")
    .addEventListener(
      "click",
      showPreviousImage
    );

  lightbox
    .querySelector(".lightbox-next")
    .addEventListener(
      "click",
      showNextImage
    );

  lightbox.addEventListener(
    "click",
    event => {

      if (event.target === lightbox) {
        closeLightbox();
      }

    }
  );

}


function setupLightbox() {

  const images =
    document.querySelectorAll(
      ".zoomable"
    );

  if (!images.length) return;

  currentLightboxImages =
    Array.from(images);

  images.forEach((image, index) => {

    image.addEventListener(
      "click",
      () => {

        currentLightboxImages =
          Array.from(
            document.querySelectorAll(
              ".zoomable"
            )
          );

        currentLightboxIndex =
          currentLightboxImages.indexOf(
            image
          );

        openLightbox();

      }
    );

  });

}


function openLightbox() {

  createLightbox();

  const lightbox =
    document.querySelector(".lightbox");

  const image =
    lightbox.querySelector(
      ".lightbox-image"
    );

  const source =
    currentLightboxImages[
      currentLightboxIndex
    ];

  if (!source) return;

  image.src = source.src;
  image.alt = source.alt || "Dessert";

  lightbox.style.display = "flex";

  document.body.style.overflow = "hidden";

}


function closeLightbox() {

  const lightbox =
    document.querySelector(".lightbox");

  if (lightbox) {
    lightbox.style.display = "none";
  }

  document.body.style.overflow = "";

}


function showPreviousImage() {

  if (!currentLightboxImages.length) return;

  currentLightboxIndex--;

  if (currentLightboxIndex < 0) {
    currentLightboxIndex =
      currentLightboxImages.length - 1;
  }

  openLightbox();

}


function showNextImage() {

  if (!currentLightboxImages.length) return;

  currentLightboxIndex++;

  if (
    currentLightboxIndex >=
    currentLightboxImages.length
  ) {
    currentLightboxIndex = 0;
  }

  openLightbox();

}


/* =========================================
   KEYBOARD LIGHTBOX
========================================= */

document.addEventListener(
  "keydown",
  event => {

    const lightbox =
      document.querySelector(".lightbox");

    if (
      !lightbox ||
      lightbox.style.display === "none"
    ) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowLeft") {
      showPreviousImage();
    }

    if (event.key === "ArrowRight") {
      showNextImage();
    }

  }
);


/* =========================================
   YEAR
========================================= */

function setupYear() {
  const year = document.getElementById("year");

  if (year) {
    year.textContent = "2021";
  }
}


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupFilters();

    setupSearch();

    setupOrderForm();

    setupDate();

    setupLightbox();

    setupYear();

    renderCart();

  }
);
