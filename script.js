// Productos disponibles
const products = [
    {
        id: 1,
        name: 'Laptop',
        price: 999.99,
        description: 'Laptop de alta performance',
        emoji: '💻'
    },
    {
        id: 2,
        name: 'Mouse Inalámbrico',
        price: 29.99,
        description: 'Mouse cómodo y preciso',
        emoji: '🖱️'
    },
    {
        id: 3,
        name: 'Teclado Mecánico',
        price: 149.99,
        description: 'Teclado profesional RGB',
        emoji: '⌨️'
    },
    {
        id: 4,
        name: 'Monitor 4K',
        price: 599.99,
        description: 'Pantalla Ultra HD',
        emoji: '🖥️'
    },
    {
        id: 5,
        name: 'Auriculares',
        price: 199.99,
        description: 'Sonido envolvente premium',
        emoji: '🎧'
    },
    {
        id: 6,
        name: 'Webcam HD',
        price: 79.99,
        description: 'Cámara 1080p con micrófono',
        emoji: '📷'
    }
];

// LocalStorage seguro
function hasLocalStorage() {
    try {
        return typeof window.localStorage !== 'undefined';
    } catch (error) {
        return false;
    }
}

function loadStorage(key) {
    if (!hasLocalStorage()) {
        return null;
    }
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (error) {
        return null;
    }
}

function saveStorage(key, value) {
    if (!hasLocalStorage()) {
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        return;
    }
}

// Carrito en localStorage o memoria temporal
let cart = loadStorage('cart') || [];

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCart();
});

// Renderizar productos
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn-add" onclick="addToCart(${product.id})">
                        Agregar
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showNotification(`${product.name} agregado al carrito`);
}

// Actualizar carrito visual
function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const totalPrice = document.getElementById('total-price');

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        totalPrice.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button onclick="changeQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = total.toFixed(2);
}

// Cambiar cantidad
function changeQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCart();
        }
    }
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
    showNotification('Producto eliminado del carrito');
}

// Limpiar carrito
function clearCart() {
    if (cart.length === 0) {
        showNotification('El carrito ya está vacío');
        return;
    }

    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        saveCart();
        updateCart();
        showNotification('Carrito vaciado');
    }
}

// Guardar carrito
function saveCart() {
    saveStorage('cart', cart);
}

// Finalizar compra
function checkout() {
    if (cart.length === 0) {
        showNotification('El carrito está vacío', 'error');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const items = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
    const whatsappNumber = '+5493815860040';
    const message = `✅ *¡COMPRA REALIZADA!*%0A%0A📋 *Artículos:* ${encodeURIComponent(items)}%0A💰 *Total:* $${total.toFixed(2)}%0A%0A¡Gracias por tu compra en Frenchies!`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    alert(`
✅ ¡COMPRA REALIZADA!

Artículos: ${items}
Total: $${total.toFixed(2)}

Gracias por tu compra.
    `);

    // Guardar compra en histórico
    var orders = loadStorage('orders') || [];
    orders.push({
        id: Date.now(),
        date: new Date().toLocaleString('es-ES'),
        items: cart,
        total: total
    });
    saveStorage('orders', orders);

    cart = [];
    saveCart();
    updateCart();
    showNotification('¡Compra completada exitosamente!');
    
    // Abrir WhatsApp con el mensaje pre-llenado
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
    }, 1500);
}

// Alternar vista del carrito
function toggleCart() {
    const panel = document.getElementById('cartPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// Mostrar notificación
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#e74c3c' : '#27ae60';

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Mostrar órdenes (opcional - para debug)
function showOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    console.log('Órdenes:', orders);
    alert(`Total de compras realizadas: ${orders.length}\n\nRevisa la consola para detalles.`);
}
