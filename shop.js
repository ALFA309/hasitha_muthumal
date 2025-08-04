// Shop Page JavaScript for Velvet Vogue

// Global variables
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productsPerPage = 8;
let currentView = 'grid';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const sortSelect = document.getElementById('sort-products');
const viewButtons = document.querySelectorAll('.view-btn');
const filterToggle = document.querySelector('.filter-toggle');
const sidebar = document.querySelector('.shop-sidebar');
const clearFiltersBtn = document.querySelector('.clear-filters');
const resultsCount = document.querySelector('.results-count');
const pagination = document.querySelector('.pagination');

// Initialize shop page
document.addEventListener('DOMContentLoaded', function() {
    initializeShop();
});

function initializeShop() {
    loadProducts();
    setupEventListeners();
    applyFilters();
    updateDisplay();
}

// Load products data
function loadProducts() {
    // Get all product cards and extract data
    const productCards = document.querySelectorAll('.product-card');
    allProducts = Array.from(productCards).map((card, index) => {
        const img = card.querySelector('img');
        const title = card.querySelector('h3');
        const priceElement = card.querySelector('.product-price');
        const rating = card.querySelectorAll('.fas.fa-star').length;
        const reviewCount = card.querySelector('.product-rating span');
        
        // Extract price (handle both regular and sale prices)
        let price = 0;
        const currentPriceElement = card.querySelector('.current-price');
        if (currentPriceElement) {
            price = parseFloat(currentPriceElement.textContent.replace('$', ''));
        } else {
            price = parseFloat(priceElement.textContent.replace('$', ''));
        }
        
        return {
            id: index + 1,
            element: card,
            category: card.dataset.category || 'all',
            price: price,
            color: card.dataset.color || '',
            title: title.textContent,
            image: img.src,
            rating: rating,
            reviews: reviewCount ? reviewCount.textContent : '(0 reviews)',
            featured: card.querySelector('.badge.featured') !== null,
            isNew: card.querySelector('.badge.new') !== null,
            onSale: card.querySelector('.badge.sale') !== null
        };
    });
    
    filteredProducts = [...allProducts];
}

// Setup event listeners
function setupEventListeners() {
    // Sort dropdown
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    // View toggle buttons
    viewButtons.forEach(btn => {
        btn.addEventListener('click', handleViewToggle);
    });
    
    // Filter toggle for mobile
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleMobileFilters);
    }
    
    // Clear filters button
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Category filters
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Size filters
    const sizeFilters = document.querySelectorAll('input[name="size"]');
    sizeFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Color filters
    const colorFilters = document.querySelectorAll('input[name="color"]');
    colorFilters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    
    // Price range inputs
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const priceRange = document.getElementById('price-range');
    
    if (minPriceInput && maxPriceInput) {
        minPriceInput.addEventListener('input', debounce(applyFilters, 500));
        maxPriceInput.addEventListener('input', debounce(applyFilters, 500));
    }
    
    if (priceRange) {
        priceRange.addEventListener('input', handlePriceRange);
    }
    
    // Pagination
    setupPagination();
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && 
            sidebar && sidebar.classList.contains('active') && 
            !e.target.closest('.shop-sidebar') && 
            !e.target.closest('.filter-toggle')) {
            sidebar.classList.remove('active');
        }
    });
}

// Handle sorting
function handleSort() {
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'newest':
            filteredProducts.sort((a, b) => b.isNew - a.isNew);
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => b.featured - a.featured);
            break;
    }
    
    currentPage = 1;
    updateDisplay();
}

// Handle view toggle
function handleViewToggle(e) {
    const viewType = e.target.closest('.view-btn').dataset.view;
    
    // Update active button
    viewButtons.forEach(btn => btn.classList.remove('active'));
    e.target.closest('.view-btn').classList.add('active');
    
    // Update view
    currentView = viewType;
    updateProductsDisplay();
}

// Toggle mobile filters
function toggleMobileFilters() {
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Apply filters
function applyFilters() {
    const selectedCategories = getSelectedFilters('category');
    const selectedSizes = getSelectedFilters('size');
    const selectedColors = getSelectedFilters('color');
    const minPrice = parseFloat(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('max-price')?.value) || Infinity;
    
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const categoryMatch = selectedCategories.length === 0 || 
                             selectedCategories.includes('all') || 
                             selectedCategories.includes(product.category);
        
        // Price filter
        const priceMatch = product.price >= minPrice && product.price <= maxPrice;
        
        // Color filter
        const colorMatch = selectedColors.length === 0 || 
                          selectedColors.includes(product.color);
        
        // Size filter (for demonstration, we'll assume all products match)
        const sizeMatch = selectedSizes.length === 0 || true;
        
        return categoryMatch && priceMatch && colorMatch && sizeMatch;
    });
    
    currentPage = 1;
    updateDisplay();
}

// Get selected filter values
function getSelectedFilters(filterName) {
    const checkboxes = document.querySelectorAll(`input[name="${filterName}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Handle price range slider
function handlePriceRange() {
    const priceRange = document.getElementById('price-range');
    const maxPriceInput = document.getElementById('max-price');
    
    if (priceRange && maxPriceInput) {
        maxPriceInput.value = priceRange.value;
        applyFilters();
    }
}

// Clear all filters
function clearAllFilters() {
    // Clear all checkboxes
    const allCheckboxes = document.querySelectorAll('.shop-sidebar input[type="checkbox"]');
    allCheckboxes.forEach(cb => {
        cb.checked = false;
    });
    
    // Check "All Products" category
    const allProductsCheckbox = document.querySelector('input[value="all"]');
    if (allProductsCheckbox) {
        allProductsCheckbox.checked = true;
    }
    
    // Clear price inputs
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const priceRange = document.getElementById('price-range');
    
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (priceRange) priceRange.value = 500;
    
    // Reset sort to featured
    if (sortSelect) {
        sortSelect.value = 'featured';
    }
    
    // Apply filters to reset display
    applyFilters();
    
    // Show notification
    if (window.VelvetVogue && window.VelvetVogue.showNotification) {
        window.VelvetVogue.showNotification('All filters cleared', 'info');
    }
}

// Update display
function updateDisplay() {
    updateResultsCount();
    updateProductsDisplay();
    updatePagination();
}

// Update results count
function updateResultsCount() {
    const totalResults = filteredProducts.length;
    const startResult = totalResults === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
    const endResult = Math.min(currentPage * productsPerPage, totalResults);
    
    if (resultsCount) {
        resultsCount.textContent = `Showing ${startResult}-${endResult} of ${totalResults} products`;
    }
}

// Update products display
function updateProductsDisplay() {
    if (!productsGrid) return;
    
    // Clear current display
    productsGrid.innerHTML = '';
    
    // Apply view class
    productsGrid.className = currentView === 'list' ? 'products-grid list-view' : 'products-grid';
    
    // Calculate products for current page
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    // Display products
    productsToShow.forEach(product => {
        const productElement = product.element.cloneNode(true);
        
        // Re-attach event listeners for cloned elements
        const addToCartBtn = productElement.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }
        
        productsGrid.appendChild(productElement);
    });
    
    // Animate products in
    const productCards = productsGrid.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Setup pagination
function setupPagination() {
    const pageButtons = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    const prevButton = document.querySelector('.page-btn.prev');
    const nextButton = document.querySelector('.page-btn.next');
    
    // Page number buttons
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                const pageNum = parseInt(this.textContent);
                goToPage(pageNum);
            }
        });
    });
    
    // Previous button
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentPage > 1) {
                goToPage(currentPage - 1);
            }
        });
    }
    
    // Next button
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
            if (currentPage < totalPages) {
                goToPage(currentPage + 1);
            }
        });
    }
}

// Go to specific page
function goToPage(pageNum) {
    currentPage = pageNum;
    updateDisplay();
    
    // Scroll to top of products
    if (productsGrid) {
        productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pageButtons = document.querySelectorAll('.page-btn:not(.prev):not(.next)');
    const prevButton = document.querySelector('.page-btn.prev');
    const nextButton = document.querySelector('.page-btn.next');
    
    // Update page buttons
    pageButtons.forEach((btn, index) => {
        const pageNum = index + 1;
        btn.classList.toggle('active', pageNum === currentPage);
        btn.style.display = pageNum <= totalPages ? 'block' : 'none';
    });
    
    // Update prev/next buttons
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages || totalPages === 0;
    }
}

// Handle add to cart (reuse from main script)
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
        
        window.VelvetVogue.addToCart(product);
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

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle URL parameters for category filtering
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
        // Uncheck all category filters
        const categoryFilters = document.querySelectorAll('input[name="category"]');
        categoryFilters.forEach(filter => {
            filter.checked = false;
        });
        
        // Check the specific category
        const categoryFilter = document.querySelector(`input[name="category"][value="${category}"]`);
        if (categoryFilter) {
            categoryFilter.checked = true;
            applyFilters();
        }
    }
}

// Initialize URL params handling
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(handleURLParams, 100); // Small delay to ensure filters are set up
});

// Export functions for use in other scripts
window.ShopPage = {
    applyFilters,
    clearAllFilters,
    goToPage,
    handleSort
};