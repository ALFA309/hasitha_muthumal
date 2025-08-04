// Cart Page JavaScript for Velvet Vogue

// DOM Elements
const cartItemsList = document.getElementById('cart-items-list');
const emptyCart = document.getElementById('empty-cart');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartShipping = document.getElementById('cart-shipping');
const cartTax = document.getElementById('cart-tax');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.querySelector('.clear-cart-btn');
const promoInput = document.getElementById('promo-input');
const applyPromoBtn = document.querySelector('.apply-promo-btn');

// Global variables
let cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
let appliedPromo = null;
const TAX_RATE = 0.08; // 8% tax
const FREE_SHIPPING_THRESHOLD = 100;

// Promo codes
const promoCodes = {
    'WELCOME10': { discount: 0.1, type: 'percentage', description: '10% off your order' },
    'SAVE20': { discount: 20, type: 'fixed', description: '$20 off your order' },
    'FREESHIP': { discount: 0, type: 'shipping', description: 'Free shipping' },
    'LUXURY15': { discount: 0.15, type: 'percentage', description: '15% off luxury items' }
};

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    initializeCartPage();
});

function initializeCartPage() {
    updateCartDisplay();
    setupEventListeners();
    updateCartCount();
}

// Setup event listeners
function setupEventListeners() {
    // Clear cart button
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Promo code
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
    
    if (promoInput) {
        promoInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyPromoCode();
            }
        });
    }
    
    // Add to cart buttons for recommended products
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });
}

// Update cart display
function updateCartDisplay() {
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        showCartItems();
    }
    updateCartSummary();
}

// Show empty cart
function showEmptyCart() {
    if (emptyCart) {
        emptyCart.style.display = 'block';
    }
    if (cartItemsList) {
        cartItemsList.style.display = 'none';
    }
    if (checkoutBtn) {
        checkoutBtn.disabled = true;
    }
}

// Show cart items
function showCartItems() {
    if (emptyCart) {
        emptyCart.style.display = 'none';
    }
    if (cartItemsList) {
        cartItemsList.style.display = 'flex';
        renderCartItems();
    }
    if (checkoutBtn) {
        checkoutBtn.disabled = false;
    }
}

// Render cart items
function renderCartItems() {
    if (!cartItemsList) return;
    
    cartItemsList.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItemElement = createCartItemElement(item, index);
        cartItemsList.appendChild(cartItemElement);
    });
}

// Create cart item element
function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <div class="cart-item-price">$${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn decrease-btn" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" data-index="${index}">
                    <button class="quantity-btn increase-btn" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const decreaseBtn = cartItem.querySelector('.decrease-btn');
    const increaseBtn = cartItem.querySelector('.increase-btn');
    const quantityInput = cartItem.querySelector('.quantity-input');
    const removeBtn = cartItem.querySelector('.remove-item-btn');
    
    decreaseBtn.addEventListener('click', () => updateQuantity(index, -1));
    increaseBtn.addEventListener('click', () => updateQuantity(index, 1));
    quantityInput.addEventListener('change', (e) => setQuantity(index, parseInt(e.target.value)));
    removeBtn.addEventListener('click', () => removeFromCart(index));
    
    return cartItem;
}

// Update quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        const newQuantity = cart[index].quantity + change;
        if (newQuantity > 0 && newQuantity <= 10) {
            cart[index].quantity = newQuantity;
            saveCartToStorage();
            updateCartDisplay();
            updateCartCount();
            
            // Show notification
            if (window.VelvetVogue && window.VelvetVogue.showNotification) {
                window.VelvetVogue.showNotification('Cart updated', 'info');
            }
        }
    }
}

// Set quantity directly
function setQuantity(index, quantity) {
    if (cart[index] && quantity > 0 && quantity <= 10) {
        cart[index].quantity = quantity;
        saveCartToStorage();
        updateCartDisplay();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(index) {
    if (cart[index]) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        saveCartToStorage();
        updateCartDisplay();
        updateCartCount();
        
        // Show notification
        if (window.VelvetVogue && window.VelvetVogue.showNotification) {
            window.VelvetVogue.showNotification(`${itemName} removed from cart`, 'info');
        }
    }
}

// Clear entire cart
function clearCart() {
    if (cart.length === 0) return;
    
    // Show confirmation
    if (confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
        cart = [];
        appliedPromo = null;
        saveCartToStorage();
        updateCartDisplay();
        updateCartCount();
        
        // Clear promo input
        if (promoInput) {
            promoInput.value = '';
        }
        
        // Show notification
        if (window.VelvetVogue && window.VelvetVogue.showNotification) {
            window.VelvetVogue.showNotification('Cart cleared', 'info');
        }
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping(subtotal);
    const discount = calculateDiscount(subtotal);
    const tax = calculateTax(subtotal - discount);
    const total = subtotal + shipping + tax - discount;
    
    // Update display
    if (cartSubtotal) {
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    if (cartShipping) {
        cartShipping.textContent = shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    }
    
    if (cartTax) {
        cartTax.textContent = `$${tax.toFixed(2)}`;
    }
    
    if (cartTotal) {
        cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    // Show discount if applied
    updateDiscountDisplay(discount);
}

// Calculate subtotal
function calculateSubtotal() {
    return cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace('$', ''));
        return sum + (price * item.quantity);
    }, 0);
}

// Calculate shipping
function calculateShipping(subtotal) {
    if (appliedPromo && appliedPromo.type === 'shipping') {
        return 0;
    }
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 10;
}

// Calculate discount
function calculateDiscount(subtotal) {
    if (!appliedPromo) return 0;
    
    switch (appliedPromo.type) {
        case 'percentage':
            return subtotal * appliedPromo.discount;
        case 'fixed':
            return Math.min(appliedPromo.discount, subtotal);
        default:
            return 0;
    }
}

// Calculate tax
function calculateTax(taxableAmount) {
    return taxableAmount * TAX_RATE;
}

// Update discount display
function updateDiscountDisplay(discount) {
    // Remove existing discount row
    const existingDiscount = document.querySelector('.discount-row');
    if (existingDiscount) {
        existingDiscount.remove();
    }
    
    // Add discount row if applicable
    if (discount > 0 && appliedPromo) {
        const summaryCard = document.querySelector('.summary-card');
        const totalRow = document.querySelector('.summary-row.total');
        
        const discountRow = document.createElement('div');
        discountRow.className = 'summary-row discount-row';
        discountRow.style.color = '#28a745';
        discountRow.innerHTML = `
            <span>Discount (${appliedPromo.description}):</span>
            <span>-$${discount.toFixed(2)}</span>
        `;
        
        summaryCard.insertBefore(discountRow, totalRow);
    }
}

// Apply promo code
function applyPromoCode() {
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    if (promoCodes[code]) {
        appliedPromo = promoCodes[code];
        updateCartSummary();
        showPromoMessage(`Promo code applied: ${appliedPromo.description}`, 'success');
        promoInput.disabled = true;
        applyPromoBtn.textContent = 'Applied';
        applyPromoBtn.disabled = true;
    } else {
        showPromoMessage('Invalid promo code', 'error');
    }
}

// Show promo message
function showPromoMessage(message, type) {
    // Remove existing message
    const existingMessage = document.querySelector('.promo-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = 'promo-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
        font-size: 0.9rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        border-radius: 4px;
        text-align: center;
        ${type === 'success' ? 
            'color: #28a745; background: rgba(40, 167, 69, 0.1); border: 1px solid rgba(40, 167, 69, 0.2);' : 
            'color: #dc3545; background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.2);'
        }
    `;
    
    // Insert after promo code section
    const promoCode = document.querySelector('.promo-code');
    promoCode.parentNode.insertBefore(messageElement, promoCode.nextSibling);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 3000);
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        if (window.VelvetVogue && window.VelvetVogue.showNotification) {
            window.VelvetVogue.showNotification('Your cart is empty', 'error');
        }
        return;
    }
    
    // Simulate checkout process
    const checkoutData = {
        items: cart,
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(calculateSubtotal()),
        tax: calculateTax(calculateSubtotal() - calculateDiscount(calculateSubtotal())),
        discount: calculateDiscount(calculateSubtotal()),
        total: calculateSubtotal() + calculateShipping(calculateSubtotal()) + calculateTax(calculateSubtotal() - calculateDiscount(calculateSubtotal())) - calculateDiscount(calculateSubtotal()),
        promoCode: appliedPromo
    };
    
    // Show loading state
    checkoutBtn.textContent = 'Processing...';
    checkoutBtn.disabled = true;
    
    // Simulate checkout delay
    setTimeout(() => {
        // Reset button
        checkoutBtn.textContent = 'Proceed to Checkout';
        checkoutBtn.disabled = false;
        
        // In a real application, this would redirect to a secure checkout page
        if (window.VelvetVogue && window.VelvetVogue.showNotification) {
            window.VelvetVogue.showNotification('Redirecting to secure checkout...', 'success');
        }
        
        // Log checkout data for demonstration
        console.log('Checkout Data:', checkoutData);
        
        // Simulate redirect to checkout page
        setTimeout(() => {
            alert('In a real application, you would be redirected to a secure checkout page to complete your purchase.');
        }, 1500);
        
    }, 2000);
}

// Handle add to cart for recommended products
function handleAddToCart(e) {
    e.preventDefault();
    const productId = e.target.getAttribute('data-product-id');
    const productCard = e.target.closest('.product-card');
    
    if (productCard && window.VelvetVogue) {
        const product = {
            id: productId,
            name: productCard.querySelector('h3').textContent,
            price: productCard.querySelector('.product-price').textContent,
            image: productCard.querySelector('img').src,
            quantity: 1
        };
        
        // Add to global cart
        window.VelvetVogue.addToCart(product);
        
        // Update local cart
        cart = JSON.parse(localStorage.getItem('velvetVogueCart')) || [];
        updateCartDisplay();
        updateCartCount();
        
        // Show animation
        showAddToCartAnimation(e.target);
    }
}

// Add to cart animation
function showAddToCartAnimation(button) {
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = '#28a745';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
        button.disabled = false;
    }, 1500);
}

// Update cart count in header
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        
        // Add animation
        if (totalItems > 0) {
            element.style.animation = 'none';
            element.offsetHeight; // Trigger reflow
            element.style.animation = 'pulse 0.3s ease';
        }
    });
}

// Save cart to storage
function saveCartToStorage() {
    localStorage.setItem('velvetVogueCart', JSON.stringify(cart));
}

// Export functions for use in other scripts
window.CartPage = {
    updateCartDisplay,
    clearCart,
    proceedToCheckout,
    calculateSubtotal,
    calculateShipping,
    calculateTax
};