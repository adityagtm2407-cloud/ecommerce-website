
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.querySelector(".main-nav");
const searchButton = document.getElementById("searchButton");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");

// Mobile navigation
if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    // Close the mobile menu after selecting a section
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open menu");
        });
    });
}

// Search bar interaction

if (searchButton && searchBox && searchInput) {
    searchButton.addEventListener("click", () => {
        const isHidden = searchBox.hidden;

        searchBox.hidden = !isHidden;

        if (isHidden) {
            searchInput.focus();
        } else {
            searchInput.value = "";
        }
    });
}



/* Product search */
if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;

        const term = searchInput.value
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

        if (!term) return;

        const normalizedTerm = term.replace(/[^a-z0-9]/g, "");
        const productCards = document.querySelectorAll(".product-card");

        const matchingCard = Array.from(productCards).find((card) => {
            const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
            const category = card.querySelector(".product-label")?.textContent.toLowerCase() || "";
            const collection = card.querySelector(".product-info p")?.textContent.toLowerCase() || "";

            const searchableText = `${title} ${category} ${collection}`
    .replace(/[^a-z0-9]/g, "");

return searchableText.includes(normalizedTerm);
        });

        if (matchingCard) {
            matchingCard.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } else {
            alert("No matching product found. Try another jersey name or category.");
        }
    });
}



/* Update active navigation link based on the section in view */

const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
const sections = ["football", "basketball", "baseball", "collections"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

if (navLinks.length && sections.length) {
    // Update active link immediately when clicked
navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        navLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
    });
});
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            const visibleSections = entries
                .filter((entry) => entry.isIntersecting)
                .sort(
                    (a, b) =>
                        b.intersectionRatio - a.intersectionRatio
                );

            if (visibleSections.length) {
                const activeId = visibleSections[0].target.id;

                navLinks.forEach((link) => {
                    const isActive = link.getAttribute("href") === `#${activeId}`;
                    link.classList.toggle("active", isActive);
                });
            }
        },
        {
            rootMargin: "-20% 0px -55% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    sections.forEach((section) => sectionObserver.observe(section));
}



/* Shopping Cart Products */
const addToBagButtons = document.querySelectorAll(".add-to-bag");
const cartCount = document.getElementById("cartCount");
const cartPanelCount = document.getElementById("cartPanelCount");
const cartItemsContainer = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");

const CART_STORAGE_KEY = "goatJerseyCart";

let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );

    if (Array.isArray(savedCart)) {
        cart = savedCart.filter((item) =>
            item &&
            Number.isInteger(item.id) &&
            typeof item.name === "string" &&
            typeof item.category === "string" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );
    }
} catch (error) {
    cart = [];
}

function renderCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
} catch (error) {
    console.warn("Cart could not be saved.", error);
}

    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    if (cartPanelCount) {
        cartPanelCount.textContent = totalItems;
    }

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            '<p class="cart-empty">Your bag is waiting for greatness.</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item) => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.category}</p>
                    
<div class="cart-quantity">
    <button
        class="quantity-btn"
        type="button"
        data-action="decrease"
        data-product-id="${item.id}"
        aria-label="Decrease quantity"
    >−</button>

    <span>${item.quantity}</span>

    <button
        class="quantity-btn"
        type="button"
        data-action="increase"
        data-product-id="${item.id}"
        aria-label="Increase quantity"
    >+</button>
</div>

                </div>
                <button
                    class="cart-remove"
                    type="button"
                    data-product-id="${item.id}"
                >
                    REMOVE
                </button>
            </div>
        `).join("");
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = "Price not set";
    }
}

addToBagButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const card = button.closest(".product-card");

        if (!card) return;

        const name = card.querySelector("h3")?.textContent.trim() || "Jersey";
        const category = card.querySelector(".product-label")?.textContent.trim() || "SPORTSWEAR";

        const existingItem = cart.find((item) => item.id === index);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: index,
                name,
                category,
                quantity: 1
            });
        }

        renderCart();

        const originalText = button.textContent;
        button.textContent = "ADDED TO BAG ✓";

        setTimeout(() => {
            button.textContent = originalText;
        }, 1200);
    });
});


if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
        const removeButton = event.target.closest(".cart-remove");
        const quantityButton = event.target.closest(".quantity-btn");

        if (quantityButton) {
            const productId = Number(quantityButton.dataset.productId);
            const action = quantityButton.dataset.action;
            const item = cart.find((product) => product.id === productId);

            if (!item) return;

            if (action === "increase") {
                item.quantity++;
            } else if (action === "decrease") {
                item.quantity--;

                if (item.quantity <= 0) {
                    cart.splice(cart.indexOf(item), 1);
                }
            }

            renderCart();
            return;
        }

        if (removeButton) {
            const productId = Number(removeButton.dataset.productId);
            const itemIndex = cart.findIndex((item) => item.id === productId);

            if (itemIndex !== -1) {
                cart.splice(itemIndex, 1);
                renderCart();
            }
        }
    });
}


renderCart();



/* Shopping Cart Panel Open / Close */
const bagLink = document.querySelector(".bag-link");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartClose = document.getElementById("cartClose");

function openCart() {
    if (!cartPanel || !cartOverlay) return;

    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
    cartPanel.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
}

function closeCart() {
    if (!cartPanel || !cartOverlay) return;

    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
    cartPanel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
}

if (bagLink) {
    bagLink.addEventListener("click", (event) => {
        event.preventDefault();
        openCart();
    });
}

if (cartClose) {
    cartClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCart);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeCart();
    }
});
