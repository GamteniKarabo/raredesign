/**
 * ============================================================
 *  RARE DESIGNS — Main Application Logic (FIXED)
 * ============================================================
 */

const STORAGE_KEYS = {
    wishlist: 'rd_wishlist_v2',
    cart: 'rd_cart_v2',
    checkoutDraft: 'rd_checkout_draft_v1',
    lastOrder: 'rd_last_order_v1'
};

const state = {
    wishlist: [],
    cart: [],
    checkoutDraft: {},
};

const ui = {
    currentPage: null,
    toastTimer: null,
    isInitialized: false  // Prevent double initialization
};

// ============================================================
// CRITICAL FIX: Reset localStorage on page load to fix corrupted data
// ============================================================
function resetAndFixLocalStorage() {
    console.log('Checking and fixing localStorage data...');

    // Check if we have valid cart data
    let cartData = localStorage.getItem(STORAGE_KEYS.cart);
    let wishlistData = localStorage.getItem(STORAGE_KEYS.wishlist);

    let needsReset = false;

    // Validate cart data
    if (cartData) {
        try {
            const parsed = JSON.parse(cartData);
            if (!Array.isArray(parsed)) {
                console.warn('Cart data is not an array, resetting');
                needsReset = true;
            } else {
                // Validate each cart item has required fields
                const valid = parsed.every(item =>
                    item &&
                    typeof item === 'object' &&
                    item.productId &&
                    item.size &&
                    typeof item.qty === 'number' &&
                    item.qty > 0 &&
                    typeof item.price === 'number'
                );
                if (!valid) {
                    console.warn('Cart contains invalid items, resetting');
                    needsReset = true;
                }
            }
        } catch (e) {
            console.warn('Failed to parse cart data, resetting');
            needsReset = true;
        }
    }

    // Validate wishlist data
    if (wishlistData) {
        try {
            const parsed = JSON.parse(wishlistData);
            if (!Array.isArray(parsed)) {
                console.warn('Wishlist data is not an array, resetting');
                needsReset = true;
            }
        } catch (e) {
            console.warn('Failed to parse wishlist data, resetting');
            needsReset = true;
        }
    }

    // Reset if data is corrupted
    if (needsReset) {
        console.log('Resetting corrupted localStorage data');
        localStorage.removeItem(STORAGE_KEYS.cart);
        localStorage.removeItem(STORAGE_KEYS.wishlist);
        localStorage.removeItem('rd_cart');
        localStorage.removeItem('rd_wishlist');
    }
}

function safeJsonParse(value, fallback) {
    try {
        return value ? JSON.parse(value) : fallback;
    } catch (_) {
        return fallback;
    }
}

function loadState() {
    // Run fix first
    resetAndFixLocalStorage();

    // Load from localStorage
    const savedWishlist = localStorage.getItem(STORAGE_KEYS.wishlist) || localStorage.getItem('rd_wishlist');
    const savedCart = localStorage.getItem(STORAGE_KEYS.cart) || localStorage.getItem('rd_cart');

    if (savedWishlist) {
        const parsed = safeJsonParse(savedWishlist, []);
        if (Array.isArray(parsed)) {
            state.wishlist = parsed;
        } else {
            state.wishlist = [];
        }
    } else {
        state.wishlist = [];
    }

    if (savedCart) {
        const parsed = safeJsonParse(savedCart, []);
        if (Array.isArray(parsed)) {
            // Filter out any invalid items
            state.cart = parsed.filter(item =>
                item &&
                typeof item === 'object' &&
                item.productId &&
                item.size &&
                typeof item.qty === 'number' &&
                item.qty > 0 &&
                typeof item.price === 'number'
            );
        } else {
            state.cart = [];
        }
    } else {
        state.cart = [];
    }

    state.checkoutDraft = safeJsonParse(localStorage.getItem(STORAGE_KEYS.checkoutDraft), {});

    console.log('State loaded:', { wishlist: state.wishlist.length, cart: state.cart.length });
}

function saveWishlist() {
    const payload = JSON.stringify(state.wishlist);
    localStorage.setItem(STORAGE_KEYS.wishlist, payload);
    localStorage.setItem('rd_wishlist', payload);
    console.log('Wishlist saved:', state.wishlist.length);
}

function saveCart() {
    const payload = JSON.stringify(state.cart);
    localStorage.setItem(STORAGE_KEYS.cart, payload);
    localStorage.setItem('rd_cart', payload);
    console.log('Cart saved:', state.cart.length);
}

function saveCheckoutDraft() {
    localStorage.setItem(STORAGE_KEYS.checkoutDraft, JSON.stringify(state.checkoutDraft));
}

function getPageType() {
    return document.body?.dataset?.page || 'home';
}

function getWhatsAppDigits() {
    const number = window.siteData?.support?.whatsappNumber || '';
    const digits = String(number).replace(/\D/g, '');
    if (digits) return digits;

    const url = window.siteData?.support?.whatsappUrl || '';
    const match = url.match(/wa\.me\/(\d+)/);
    return match ? match[1] : '';
}

function getWhatsAppUrl(message = '') {
    const digits = getWhatsAppDigits();
    const base = digits ? `https://wa.me/${digits}` : (window.siteData?.support?.whatsappUrl || '#');
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function resolveNavHref(href) {
    if (!href) return '#';
    if (href.startsWith('#') && getPageType() !== 'home') {
        return `index.html${href}`;
    }
    return href;
}

function isWishlisted(productId) {
    return state.wishlist.includes(productId);
}

function toggleWishlist(productId) {
    const alreadySaved = isWishlisted(productId);
    if (alreadySaved) {
        state.wishlist = state.wishlist.filter((id) => id !== productId);
        showToast('Removed from wishlist');
    } else {
        state.wishlist.push(productId);
        showToast('Added to wishlist');
    }
    saveWishlist();
    updateBadges();
    refreshActivePage();
    return !alreadySaved;
}

function cartKey(productId, size) {
    return `${productId}__${size}`;
}

function getCartCount() {
    return state.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

function getCartTotal() {
    return state.cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty || 0)), 0);
}

function addToCart(productId, size) {
    const product = window.getProductById(productId);
    if (!product) {
        console.error('Product not found:', productId);
        showToast('Product not found');
        return false;
    }

    if (!size) {
        showToast('Please select a size');
        return false;
    }

    const key = cartKey(productId, size);
    const existing = state.cart.find((item) => cartKey(item.productId, item.size) === key);

    if (existing) {
        existing.qty = (existing.qty || 0) + 1;
    } else {
        state.cart.push({
            productId: product.id,
            size: size,
            qty: 1,
            price: product.price,
            name: product.name,
            image: product.images?.[0] || '',
        });
    }

    saveCart();
    updateBadges();
    refreshActivePage();
    showToast(`${product.name} added to cart`);
    console.log('Cart after add:', state.cart.length);
    return true;
}

function removeFromCart(productId, size) {
    const beforeCount = state.cart.length;
    state.cart = state.cart.filter((item) => !(item.productId === productId && item.size === size));
    if (beforeCount !== state.cart.length) {
        saveCart();
        updateBadges();
        refreshActivePage();
        console.log('Removed from cart, new length:', state.cart.length);
    }
}

function updateCartQty(productId, size, delta) {
    const item = state.cart.find((entry) => entry.productId === productId && entry.size === size);
    if (!item) return;

    const nextQty = (item.qty || 0) + delta;
    if (nextQty <= 0) {
        removeFromCart(productId, size);
        return;
    }

    item.qty = nextQty;
    saveCart();
    updateBadges();
    refreshActivePage();
}

function showToast(message) {
    let toast = document.getElementById('siteToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'siteToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    clearTimeout(ui.toastTimer);
    requestAnimationFrame(() => {
        toast.classList.add('show');
        ui.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2400);
    });
}

function updateBadges() {
    const wishlistCount = document.getElementById('wishlistCount');
    const cartCount = document.getElementById('cartCount');
    if (wishlistCount) {
        wishlistCount.textContent = state.wishlist.length;
        wishlistCount.classList.toggle('visible', state.wishlist.length > 0);
    }
    if (cartCount) {
        const count = getCartCount();
        cartCount.textContent = count;
        cartCount.classList.toggle('visible', count > 0);
    }
}

function buildNav() {
    const navLinks = document.getElementById('navLinks');
    const mobileNavLinks = document.getElementById('mobileNavLinks');
    if (!navLinks || !mobileNavLinks || !window.siteData?.nav) return;

    navLinks.innerHTML = '';
    mobileNavLinks.innerHTML = '';

    window.siteData.nav.forEach((link) => {
        [navLinks, mobileNavLinks].forEach((container) => {
            const anchor = document.createElement('a');
            anchor.href = resolveNavHref(link.href);
            anchor.textContent = link.label;
            container.appendChild(anchor);
        });
    });
}

function initHamburger() {
    const button = document.getElementById('hamburger');
    const drawer = document.getElementById('mobileNav');
    if (!button || !drawer) return;

    const closeMenu = () => {
        button.classList.remove('open');
        drawer.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', () => {
        const open = !drawer.classList.contains('open');
        drawer.classList.toggle('open', open);
        button.classList.toggle('open', open);
        button.setAttribute('aria-expanded', String(open));
    });

    drawer.addEventListener('click', (event) => {
        if (event.target.matches('a')) closeMenu();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 900) closeMenu();
    });
}

function initWhatsApp() {
    const whatsappUrl = getWhatsAppUrl();
    const floatButton = document.getElementById('whatsappFloat');
    const contactButton = document.getElementById('contactWhatsApp');
    if (floatButton) floatButton.href = whatsappUrl;
    if (contactButton) contactButton.href = whatsappUrl;
}

function initFooter() {
    const footer = document.getElementById('footerCopy');
    if (footer && window.siteData?.brand?.year) {
        footer.textContent = `© ${window.siteData.brand.year} · ALL RIGHTS RESERVED`;
    }
}

function initScrollEffects() {
    const nav = document.getElementById('siteNav');
    if (!nav) return;

    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
}

function createRevealObserver() {
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                instance.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

    elements.forEach((element) => observer.observe(element));
}

function initLazyMedia(scope = document) {
    const images = scope.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const onLoad = (image) => {
        image.classList.add('loaded');
        image.closest('.media-frame, .cart-item-img')?.classList.add('is-loaded');
    };

    const onError = (image) => {
        image.classList.add('loaded');
        image.closest('.media-frame, .cart-item-img')?.classList.add('is-loaded', 'is-error');
        image.alt = `${image.alt || 'Image'} unavailable`;
    };

    const revealImage = (image) => {
        if (image.dataset.loaded === 'true') return;
        image.dataset.loaded = 'true';
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
        if (image.complete) {
            onLoad(image);
        } else {
            image.addEventListener('load', () => onLoad(image), { once: true });
            image.addEventListener('error', () => onError(image), { once: true });
        }
    };

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealImage(entry.target);
                instance.unobserve(entry.target);
            }
        });
    }, { rootMargin: '160px 0px' });

    images.forEach((image) => observer.observe(image));
}

function buildImageMarkup(src, alt, extraClass = '') {
    if (!src) {
        return `
      <div class="img-placeholder ${extraClass}">
        <i class="far fa-image"></i>
        <span>${alt}</span>
      </div>`;
    }

    return `
    <div class="media-frame ${extraClass}">
      <span class="media-shimmer"></span>
      <img data-src="${src}" alt="${alt}" class="lux-image" loading="lazy" />
    </div>`;
}

function buildCollections() {
    const section = document.getElementById('collections');
    if (!section || !window.siteData?.collections) return;

    section.innerHTML = '';

    window.siteData.collections.forEach((collection, index) => {
        const card = document.createElement('article');
        const right = collection.align === 'image-right';
        card.className = `collection-block reveal${right ? ' img-right' : ''}`;
        card.style.transitionDelay = `${Math.min(index * 90, 270)}ms`;

        const productCount = window.getProductsByCollection(collection.id).length;
        card.innerHTML = `
      <div class="collection-img-col">
        ${buildImageMarkup(collection.coverImage, collection.title, 'collection-media')}
      </div>
      <div class="collection-text-col">
        <span class="collection-index">${collection.index}</span>
        <p class="collection-count">${productCount} curated pieces</p>
        <h2 class="collection-title">${collection.title}</h2>
        <p class="collection-desc">${collection.description}</p>
        <div class="collection-meta-row">
          <p class="collection-price">${window.formatPriceRange(collection.priceRange)}</p>
          <a href="collection.html?id=${collection.id}" class="collection-explore">
            EXPLORE <span class="arrow">→</span>
          </a>
        </div>
      </div>
    `;

        section.appendChild(card);
    });

    createRevealObserver();
    initLazyMedia(section);
}

function buildProductCard(product, container) {
    const card = document.createElement('article');
    card.className = 'product-card reveal';
    card.dataset.productId = product.id;

    const sizeChips = product.sizes.map((size) => {
        const unavailable = !product.availableSizes.includes(size);
        return `<button type="button" class="size-chip${unavailable ? ' unavailable' : ''}" data-size="${size}" ${unavailable ? 'disabled' : ''}>${size}</button>`;
    }).join('');

    const wishlisted = isWishlisted(product.id);

    card.innerHTML = `
    <div class="product-card-image">
      ${product.isNew ? '<span class="card-badge-new">NEW</span>' : ''}
      ${buildImageMarkup(product.images?.[0], product.name, 'product-media')}
      <button class="card-wish-btn${wishlisted ? ' active' : ''}" type="button" aria-label="Toggle wishlist">
        <i class="${wishlisted ? 'fas' : 'far'} fa-heart"></i>
      </button>
    </div>
    <div class="product-card-info">
      <div class="product-card-copy">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
      </div>
      <div class="product-card-bottom">
        <p class="product-price">${window.formatPrice(product.price)}</p>
        <div class="size-selector">${sizeChips}</div>
        <button class="add-to-cart-btn" type="button">ADD TO CART</button>
      </div>
    </div>
  `;

    const wishButton = card.querySelector('.card-wish-btn');
    wishButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const active = toggleWishlist(product.id);
        wishButton.classList.toggle('active', active);
        wishButton.querySelector('i').className = active ? 'fas fa-heart' : 'far fa-heart';
    });

    const chips = card.querySelectorAll('.size-chip:not(.unavailable)');
    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            chips.forEach((entry) => entry.classList.remove('selected'));
            chip.classList.add('selected');
        });
    });

    card.querySelector('.add-to-cart-btn').addEventListener('click', () => {
        const selected = card.querySelector('.size-chip.selected');
        if (!selected) {
            showToast('Please select a size first');
            return;
        }
        addToCart(product.id, selected.dataset.size);
    });

    container.appendChild(card);
}

function setCollectionHeaderImage(collection) {
    const header = document.getElementById('collectionHeader');
    if (!header || !collection?.coverImage) return;
    header.style.setProperty('--page-cover', `url('${collection.coverImage}')`);
    header.classList.add('has-cover');
}

function buildCollectionPage() {
    const grid = document.getElementById('collectionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const params = new URLSearchParams(window.location.search);
    const collectionId = params.get('id');
    const collection = window.getCollectionById(collectionId);
    if (!collection) {
        window.location.href = 'index.html';
        return;
    }

    document.title = `${collection.title} — ${window.siteData.brand.name}`;
    setCollectionHeaderImage(collection);

    const title = document.getElementById('colTitle');
    const desc = document.getElementById('colDesc');
    const price = document.getElementById('colPrice');
    if (title) title.textContent = collection.title;
    if (desc) desc.textContent = collection.description;
    if (price) price.textContent = window.formatPriceRange(collection.priceRange);

    const products = window.getProductsByCollection(collection.id);
    if (!products.length) {
        grid.innerHTML = `
      <div class="empty-state reveal visible">
        <i class="far fa-folder-open"></i>
        <p>No products in this collection yet.</p>
        <a href="index.html" class="btn-primary">Back to Collections</a>
      </div>`;
        return;
    }

    products.forEach((product) => buildProductCard(product, grid));
    createRevealObserver();
    initLazyMedia(grid);
}

function buildWishlistPage() {
    const grid = document.getElementById('wishlistGrid');
    const counter = document.getElementById('wishlistPageCount');
    if (!grid) return;

    grid.innerHTML = '';

    if (!window.siteData?.products) {
        grid.innerHTML = `
      <div class="empty-state reveal visible">
        <i class="far fa-heart"></i>
        <p>Loading products...</p>
      </div>`;
        return;
    }

    const products = window.siteData.products.filter((product) => isWishlisted(product.id));

    if (counter) {
        counter.textContent = `${products.length} saved item${products.length === 1 ? '' : 's'}`;
    }

    if (!products.length) {
        grid.innerHTML = `
      <div class="empty-state reveal visible">
        <i class="far fa-heart"></i>
        <p>Your wishlist is empty.</p>
        <a href="index.html#collections" class="btn-primary">Browse Collections</a>
      </div>`;
        return;
    }

    products.forEach((product) => buildProductCard(product, grid));
    createRevealObserver();
    initLazyMedia(grid);
}

function buildCartItemMarkup(item) {
    return `
    <div class="cart-item-img">
      ${buildImageMarkup(item.image, item.name, 'cart-media')}
    </div>
    <div class="cart-item-details">
      <div>
        <span class="cart-item-name">${escapeHtml(item.name)}</span>
        <span class="cart-item-meta">Size: ${escapeHtml(item.size)}</span>
      </div>
      <span class="cart-item-price">${window.formatPrice(item.price)}</span>
      <div class="cart-item-qty">
        <button class="qty-btn" type="button" data-action="minus" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${item.qty}</span>
        <button class="qty-btn" type="button" data-action="plus" aria-label="Increase quantity">+</button>
      </div>
    </div>
    <button class="cart-item-remove" type="button" aria-label="Remove item">
      <i class="fas fa-times"></i>
    </button>
  `;
}

// Helper function to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function populateCheckoutPreview() {
    const preview = document.getElementById('checkoutOrderPreview');
    const count = document.getElementById('checkoutOrderCount');
    const total = document.getElementById('checkoutPreviewTotal');
    if (!preview || !count || !total) return;

    preview.innerHTML = state.cart.map((item) => `
    <div class="checkout-order-item">
      <span>${escapeHtml(item.name)} · ${escapeHtml(item.size)}</span>
      <strong>${item.qty} × ${window.formatPrice(item.price)}</strong>
    </div>`).join('');

    count.textContent = `${getCartCount()} item${getCartCount() === 1 ? '' : 's'}`;
    total.textContent = window.formatPrice(getCartTotal());
}

function renderCartPage() {
    const list = document.getElementById('cartList');
    const summary = document.getElementById('cartSummary');
    const total = document.getElementById('cartTotal');
    const pageCount = document.getElementById('cartPageCount');
    const itemsSummary = document.getElementById('cartItemsSummary');
    if (!list) return;

    list.innerHTML = '';

    if (!state.cart.length) {
        list.innerHTML = `
      <div class="empty-state reveal visible">
        <i class="fas fa-bag-shopping"></i>
        <p>Your cart is empty.</p>
        <a href="index.html#collections" class="btn-primary">Browse Collections</a>
      </div>`;
        if (summary) summary.hidden = true;
        if (pageCount) pageCount.textContent = '0 items';
        return;
    }

    state.cart.forEach((item, index) => {
        const cartItem = document.createElement('article');
        cartItem.className = 'cart-item reveal visible';
        cartItem.style.transitionDelay = `${Math.min(index * 70, 210)}ms`;
        cartItem.innerHTML = buildCartItemMarkup(item);

        cartItem.querySelectorAll('.qty-btn').forEach((button) => {
            button.addEventListener('click', () => {
                const delta = button.dataset.action === 'plus' ? 1 : -1;
                updateCartQty(item.productId, item.size, delta);
            });
        });

        cartItem.querySelector('.cart-item-remove').addEventListener('click', () => {
            removeFromCart(item.productId, item.size);
            showToast('Item removed from cart');
        });

        list.appendChild(cartItem);
    });

    if (summary) summary.hidden = false;
    if (total) total.textContent = window.formatPrice(getCartTotal());
    if (pageCount) pageCount.textContent = `${getCartCount()} item${getCartCount() === 1 ? '' : 's'}`;
    if (itemsSummary) itemsSummary.textContent = `${getCartCount()} item${getCartCount() === 1 ? '' : 's'}`;

    populateCheckoutPreview();
    initLazyMedia(list);
}

function buildCartPage() {
    renderCartPage();
    if (!window.checkoutModalInitialized) {
        initCheckoutModal();
        window.checkoutModalInitialized = true;
    }
}

function getCheckoutMessage(formData) {
    const lines = [
        '*RARE DESIGNS — New Order Request*',
        '',
        `Name: ${formData.fullName}`,
        `Phone: ${formData.phone}`,
        `Email: ${formData.email || 'Not provided'}`,
        `City / Area: ${formData.city}`,
        `Delivery Method: ${formData.deliveryMethod}`,
        `Delivery Address: ${formData.address}`,
        `Preferred Payment: ${formData.paymentMethod || 'Not specified'}`,
        '',
        '*Order Items*',
        ...state.cart.map((item, index) => `${index + 1}. ${item.name} | Size ${item.size} | Qty ${item.qty} | ${window.formatPrice(item.price * item.qty)}`),
        '',
        `Total: ${window.formatPrice(getCartTotal())}`,
        `Notes: ${formData.notes || 'None'}`,
        '',
        'Please send payment details to complete this order.'
    ];

    return lines.join('\n');
}

function fillCheckoutDraft() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    Object.entries(state.checkoutDraft || {}).forEach(([key, value]) => {
        const field = form.elements.namedItem(key);
        if (field) field.value = value;
    });
}

function collectFormData(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    state.checkoutDraft = data;
    saveCheckoutDraft();
    return data;
}

function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    if (!state.cart.length) {
        showToast('Your cart is empty');
        return;
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    populateCheckoutPreview();
    fillCheckoutDraft();
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

function initCheckoutModal() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const modal = document.getElementById('checkoutModal');
    const form = document.getElementById('checkoutForm');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Clear all items from your cart?')) {
                state.cart = [];
                saveCart();
                updateBadges();
                renderCartPage();
                showToast('Cart cleared');
            }
        });
    }

    if (!checkoutBtn || !modal || !form) return;

    checkoutBtn.addEventListener('click', openCheckoutModal);

    modal.querySelectorAll('[data-close-modal]').forEach((button) => {
        button.addEventListener('click', closeCheckoutModal);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeCheckoutModal();
    });

    form.addEventListener('input', () => collectFormData(form));

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = collectFormData(form);
        const message = getCheckoutMessage(formData);
        const whatsappUrl = getWhatsAppUrl(message);

        localStorage.setItem(STORAGE_KEYS.lastOrder, JSON.stringify({
            ...formData,
            cart: state.cart,
            total: getCartTotal(),
            createdAt: new Date().toISOString(),
        }));

        window.open(whatsappUrl, '_blank', 'noopener');
        showToast('Opening WhatsApp with your order details');
        closeCheckoutModal();
    });
}

function refreshActivePage() {
    const page = getPageType();
    if (page === 'wishlist') buildWishlistPage();
    if (page === 'cart') buildCartPage();
    if (page === 'collection') buildCollectionPage();
    if (page === 'home') buildCollections();
}

function initStorageSync() {
    window.addEventListener('storage', () => {
        loadState();
        updateBadges();
        refreshActivePage();
    });
}

function initLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    if (!screen || !window.siteData?.loading?.enabled) {
        screen?.remove();
        return;
    }

    const fill = screen.querySelector('[data-loader-fill]');
    const status = screen.querySelector('[data-loader-status]');
    const messages = window.siteData.loading?.messages || ['Loading…', 'Almost ready…'];
    const fadeMs = window.siteData.loading?.fadeMs || 800;
    const minimumMs = window.siteData.loading?.minimumMs || 1500;
    screen.style.setProperty('--fadeMs', `${fadeMs}ms`);

    let pointer = 0;
    const applyStage = () => {
        if (status) status.textContent = messages[pointer] || 'Loading…';
        if (fill) fill.style.transform = `scaleX(${Math.min((pointer + 1) / messages.length, 1)})`;
        pointer = Math.min(pointer + 1, messages.length - 1);
    };

    applyStage();
    const stageTimer = setInterval(applyStage, 520);

    const readyPromise = new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve();
            return;
        }
        window.addEventListener('load', resolve, { once: true });
        setTimeout(resolve, 2600);
    });

    Promise.all([
        readyPromise,
        new Promise((resolve) => setTimeout(resolve, minimumMs))
    ]).then(() => {
        clearInterval(stageTimer);
        if (fill) fill.style.transform = 'scaleX(1)';
        if (status) status.textContent = 'Ready';
        setTimeout(() => {
            screen.classList.add('hide');
            setTimeout(() => screen.remove(), fadeMs + 120);
        }, 180);
    });
}

window.showToast = showToast;

// ============================================================
// CRITICAL FIX: Check if siteData is available BEFORE initializing
// ============================================================

function checkAndInitialize(retryCount = 0) {
    const maxRetries = 10;
    const retryDelay = 100;

    if (typeof window.siteData === 'undefined') {
        if (retryCount < maxRetries) {
            console.warn(`siteData not ready yet, waiting... (attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => checkAndInitialize(retryCount + 1), retryDelay);
        } else {
            console.error('siteData failed to load after maximum retries');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Failed to load store data. Please refresh the page.';
            errorMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);z-index:10000;';
            document.body.appendChild(errorMsg);
        }
        return;
    }

    // Only initialize once
    if (ui.isInitialized) {
        console.log('App already initialized, skipping');
        return;
    }
    ui.isInitialized = true;

    console.log('Initializing app with siteData available');
    initializeApp();
}

function initializeApp() {
    ui.currentPage = getPageType();
    loadState();
    buildNav();
    initHamburger();
    initWhatsApp();
    initFooter();
    initScrollEffects();
    initStorageSync();
    updateBadges();
    initLoadingScreen();

    if (ui.currentPage === 'home') buildCollections();
    if (ui.currentPage === 'collection') buildCollectionPage();
    if (ui.currentPage === 'wishlist') buildWishlistPage();
    if (ui.currentPage === 'cart') buildCartPage();

    createRevealObserver();
    initLazyMedia();

    console.log('App initialization complete');
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    checkAndInitialize();
});

// Also try immediate check in case DOM is already loaded
if (document.readyState !== 'loading') {
    checkAndInitialize();
}