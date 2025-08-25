// Cart Management System
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.itemCount = 0;
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartDisplay();
    }

    setupEventListeners() {
        // Add to cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add click effect
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
                
                const card = e.target.closest('.arrival-card, .firework-card');
                if (card) {
                    const product = this.getProductFromCard(card);
                    this.addItem(product);
                }
            });
        });

        // Cart toggle - using ID selector
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            console.log('Cart icon found, adding event listener');
            cartIcon.addEventListener('click', (e) => {
                console.log('Cart icon clicked');
                e.preventDefault();
                e.stopPropagation();
                this.toggleCart();
            });
        } else {
            console.log('Cart icon not found');
        }

        // Close cart
        const closeCartBtn = document.querySelector('.close-cart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => {
                this.closeCart();
            });
        }

        // Cart overlay click to close
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                this.closeCart();
            });
        }


        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    getProductFromCard(card) {
        // Extract product information from the card
        const name = card.querySelector('.firework-label, .product-name')?.textContent || 'Firework Product';
        const price = this.getRandomPrice(); // Generate random price for demo
        const image = card.querySelector('img')?.src || 'images/default-product.jpg';
        const id = this.generateId();
        
        return {
            id,
            name,
            price,
            image
        };
    }

    getRandomPrice() {
        return 80;
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    toggleCart() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartPanel && cartOverlay) {
            cartPanel.classList.toggle('active');
            cartOverlay.classList.toggle('active');
            
            // Prevent body scroll when cart is open
            if (cartPanel.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }
    }

    closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');
        
        if (cartPanel && cartOverlay) {
            cartPanel.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }
        
        this.updateCart();
        this.showInPageNotification(`Added to cart!`, 'success');
    }

    removeItem(productId) {
        const item = this.items.find(item => item.id === productId);
        const itemName = item ? item.name : 'Item';
        this.items = this.items.filter(item => item.id !== productId);
        this.updateCart();
        this.showInPageNotification(`Removed from cart!`, 'error');
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.updateCart();
        }
    }

    updateCart() {
        this.calculateTotal();
        this.updateItemCount();
        this.saveCartToStorage();
        this.updateCartDisplay();
    }

    calculateTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }

    updateItemCount() {
        this.itemCount = this.items.reduce((count, item) => {
            return count + item.quantity;
        }, 0);
    }

    updateCartDisplay() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateCartTotal();
        this.updateCartVisibility();
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.itemCount;
        }
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        
        if (!cartItems || !cartEmpty) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            cartItems.style.display = 'none';
            cartEmpty.style.display = 'flex';
        } else {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
            cartItems.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
            
            // Add event listeners to quantity controls
            this.setupCartItemListeners();
        }
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="cart.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupCartItemListeners() {
        // Event listeners are already set up in the HTML onclick attributes
    }

    updateCartTotal() {
        const totalAmount = document.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = `₹${this.total.toFixed(2)}`;
        }
    }

    updateCartVisibility() {
        const cartFooter = document.getElementById('cartFooter');
        if (cartFooter) {
            if (this.items.length > 0) {
                cartFooter.classList.add('has-items');
            } else {
                cartFooter.classList.remove('has-items');
            }
        }
    }

    saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify({
            items: this.items,
            total: this.total,
            itemCount: this.itemCount
        }));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            const cartData = JSON.parse(savedCart);
            this.items = cartData.items || [];
            this.total = cartData.total || 0;
            this.itemCount = cartData.itemCount || 0;
        }
    }

    showInPageNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'in-page-notification';
        
        // Set background color based on type
        const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
        const textColor = type === 'success' ? '#155724' : '#721c24';
        const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            background: ${bgColor};
            color: ${textColor};
            border: 1px solid ${borderColor};
            padding: 1rem 1.5rem;
            border-radius: 6px;
            font-family: 'Mulish', sans-serif;
            font-weight: 600;
            font-size: 0.9rem;
            z-index: 10000;
            transform: translateX(-50%) translateY(-100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            word-wrap: break-word;
            text-align: center;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(-50%) translateY(-100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF8C00;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            font-family: 'Mulish', sans-serif;
            font-weight: 600;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    checkout() {
        if (this.items.length === 0) {
            this.showInPageNotification('Your cart is empty!', 'error');
            return;
        }
        
        this.showInPageNotification('Proceeding to checkout...', 'success');
        // Add checkout logic here
        console.log('Checkout with items:', this.items);
        console.log('Total:', this.total);
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.itemCount = 0;
        this.updateCart();
        this.showInPageNotification('Cart cleared!', 'error');
    }

    scrollToNewArrivals() {
        console.log('scrollToNewArrivals called');
        const newArrivalsSection = document.querySelector('.new-arrivals');
        console.log('Found section:', newArrivalsSection);
        if (newArrivalsSection) {
            setTimeout(() => {
                console.log('Scrolling to new arrivals section');
                // Get the section's position
                const sectionTop = newArrivalsSection.offsetTop;
                const headerHeight = 80; // Approximate header height
                const scrollTarget = sectionTop - headerHeight - 20; // Extra padding
                
                // Custom smooth scroll implementation
                this.smoothScrollTo(scrollTarget);
            }, 400); // Slightly longer delay for smoother transition
        } else {
            console.log('New arrivals section not found');
        }
    }

    smoothScrollTo(targetPosition) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000; // 1 second
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        requestAnimationFrame(animation.bind(this));
    }

    easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }
}

// Initialize cart when DOM is loaded
let cart;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing cart');
    cart = new ShoppingCart();
    console.log('Cart initialized:', cart);
});

// Global functions for onclick handlers
function toggleCart() {
    console.log('Global toggleCart called');
    if (cart) {
        cart.toggleCart();
    } else {
        console.log('Cart not initialized');
        // Fallback direct toggle
        const cartPanel = document.getElementById('cartPanel');
        const cartOverlay = document.getElementById('cartOverlay');
        if (cartPanel && cartOverlay) {
            cartPanel.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    }
}

function checkout() {
    if (cart) cart.checkout();
}
