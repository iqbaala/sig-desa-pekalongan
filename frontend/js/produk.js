const products = [
    {
        id: 1,
        name: "Nutrisi AB Mix",
        description: "Nutrisi lengkap untuk semua jenis tanaman hidroponik. Formula premium untuk hasil panen maksimal.",
        price: 45000,
        rating: 4.9,
        imageIcon: "fas fa-flask",
        color: "blue",
        category: "Nutrisi"
    },
    {
        id: 2,
        name: "pH Meter Digital",
        description: "Alat ukur pH akurat dengan kalibrasi otomatis. Wajib untuk menjaga keseimbangan larutan.",
        price: 125000,
        rating: 4.8,
        imageIcon: "fas fa-thermometer-half",
        color: "green",
        category: "Alat Ukur"
    },
    {
        id: 3,
        name: "Starter Kit NFT",
        description: "Sistem NFT komplet untuk 20 tanaman. Termasuk pipa, pompa, dan netpot. Siap pakai!",
        price: 850000,
        rating: 4.9,
        imageIcon: "fas fa-seedling",
        color: "purple",
        category: "Kit Hidroponik"
    },
    {
        id: 4,
        name: "LED Grow Light",
        description: "Lampu tanam full spectrum 100W hemat listrik. Pengganti matahari untuk indoor farming.",
        price: 320000,
        rating: 4.7,
        imageIcon: "fas fa-sun",
        color: "yellow",
        category: "Pencahayaan"
    },
    {
        id: 5,
        name: "Rockwool Cubes",
        description: "Media tanam steril dan porous, sangat baik untuk menyemai benih. Isi 100 potong.",
        price: 25000,
        rating: 4.8,
        imageIcon: "fas fa-cube",
        color: "gray",
        category: "Media Tanam"
    },
    {
        id: 6,
        name: "Pompa Air Submersible",
        description: "Pompa celup hemat energi untuk sirkulasi nutrisi 24 jam. Tahan lama dan tidak berisik.",
        price: 65000,
        rating: 4.6,
        imageIcon: "fas fa-water",
        color: "cyan",
        category: "Peralatan"
    },
    {
        id: 7,
        name: "Netpot 5cm",
        description: "Netpot plastik tebal diameter 5cm. Cocok untuk semua sistem hidroponik. Isi 50 pcs.",
        price: 15000,
        rating: 4.9,
        imageIcon: "fas fa-filter",
        color: "red",
        category: "Aksesoris"
    },
    {
        id: 8,
        name: "Benih Selada Premium",
        description: "Benih selada impor dengan daya tumbuh 98%. Renyah dan tidak pahit.",
        price: 10000,
        rating: 5.0,
        imageIcon: "fas fa-leaf",
        color: "green",
        category: "Benih"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Modal Elements
    const productGrid = document.getElementById('product-grid');
    const modal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const paymentForm = document.getElementById('payment-form');
    const qtyInput = document.getElementById('qty-input');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const summaryPrice = document.getElementById('summary-price');
    const summaryQty = document.getElementById('summary-qty');
    const summaryTotal = document.getElementById('summary-total');
    let selectedProduct = null;

    // Render Products
    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = `bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group product-card border border-gray-100 flex flex-col justify-between`;
        card.style.animationDelay = `${index * 0.1}s`;

        // Map color names to Tailwind classes approx
        const colorMap = {
            blue: 'from-blue-500 to-blue-600',
            green: 'from-green-500 to-green-600',
            purple: 'from-purple-500 to-purple-600',
            yellow: 'from-yellow-500 to-orange-500',
            gray: 'from-gray-500 to-gray-600',
            cyan: 'from-cyan-500 to-cyan-600',
            red: 'from-red-500 to-red-600'
        };

        const bgGradient = colorMap[product.color] || 'from-gray-500 to-gray-600';

        card.innerHTML = `
            <div>
                <div class="w-16 h-16 bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <i class="${product.imageIcon} text-white text-2xl"></i>
                </div>
                <div class="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">${product.category}</div>
                <h3 class="font-bold text-gray-800 text-lg mb-2 group-hover:text-primary transition-colors">${product.name}</h3>
                <p class="text-gray-500 text-sm mb-4">${product.description}</p>
            </div>
            <div>
                <div class="text-primary font-bold text-xl mb-2">Rp ${product.price.toLocaleString('id-ID')}</div>
                <div class="flex items-center justify-center text-yellow-400 mb-4">
                    ${renderStars(product.rating)}
                    <span class="text-gray-400 text-xs ml-2">(${product.rating})</span>
                </div>
                <button onclick="openCheckout(${product.id})" class="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center">
                    <i class="fas fa-shopping-cart mr-2"></i> Beli
                </button>
            </div>
        `;
        productGrid.appendChild(card);
    });

    // Modal Functions
    window.openCheckout = (productId) => {
        selectedProduct = products.find(p => p.id === productId);
        if (!selectedProduct) return;

        // Reset Qty
        qtyInput.value = 1;

        // Update Info
        const modalInfo = document.getElementById('modal-product-info');
        modalInfo.innerHTML = `
            <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i class="${selectedProduct.imageIcon} text-3xl text-gray-600"></i>
            </div>
            <div>
                <div class="text-xs font-bold text-primary uppercase mb-1">${selectedProduct.category}</div>
                <h4 class="font-bold text-gray-900 text-lg leading-tight mb-1">${selectedProduct.name}</h4>
                <p class="text-gray-500 text-sm">${selectedProduct.description.substring(0, 50)}...</p>
            </div>
        `;

        updateSummary();

        // Reset and hide payment details on new open
        paymentMethodSelect.value = 'Transfer Bank';
        // Hide inline details as we now redirect
        if (paymentDetailsDiv) paymentDetailsDiv.classList.add('hidden');

        modal.classList.remove('hidden');
    };

    function updateSummary() {
        if (!selectedProduct) return;
        const qty = parseInt(qtyInput.value) || 1;
        const total = selectedProduct.price * qty;

        summaryPrice.textContent = `Rp ${selectedProduct.price.toLocaleString('id-ID')}`;
        summaryQty.textContent = qty;
        summaryTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    // Payment Details Logic (Keeping it specifically for the select, but without inline display if we want to rely on next page)
    // Actually, user might want to see who they are paying before clicking "Pay"? 
    // The requirement says "buat halaman pembayaran SETELAH halaman tersebut.. di mana ada nomor rekening".
    // So usually you select method, then go to next page to see the VA number.
    // I will hide the details div logic or remove it to avoid redundancy.
    const paymentMethodSelect = paymentForm.querySelector('select');
    const paymentDetailsDiv = document.createElement('div');
    // We can keep it or remove it. Let's remove the inline details to strictly follow "halaman pembayaran setelah tersebut".
    // But keeping the select is necessary.

    // Quantity Listeners
    qtyMinus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val > 1) {
            qtyInput.value = val - 1;
            updateSummary();
        }
    });

    qtyPlus.addEventListener('click', () => {
        const val = parseInt(qtyInput.value) || 1;
        if (val < 100) {
            qtyInput.value = val + 1;
            updateSummary();
        }
    });

    qtyInput.addEventListener('change', () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val < 1) val = 1;
        if (val > 100) val = 100;
        qtyInput.value = val;
        updateSummary();
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = paymentForm.querySelector('button[type="submit"]');
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memproses...';
        btn.disabled = true;

        // Gather Data
        const formData = {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            price: selectedProduct.price,
            qty: parseInt(qtyInput.value),
            total_price: selectedProduct.price * parseInt(qtyInput.value),
            customer_name: paymentForm.querySelector('input[type="text"]').value,
            customer_address: paymentForm.querySelector('textarea').value,
            payment_method: paymentMethodSelect.value
        };

        try {
            // Send to Backend
            const response = await fetch('http://localhost:3000/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                // Success - Save to LocalStorage for Payment Page
                localStorage.setItem('currentOrder', JSON.stringify(formData));
                localStorage.removeItem('paymentExpiry'); // Reset timer for new order

                modal.classList.add('hidden');
                // Redirect to Payment Page
                window.location.href = 'pembayaran.html';
            } else {
                showNotification(`Gagal: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error(error);
            // Fallback for demo
            showNotification('Mengalihkan ke halaman pembayaran...', 'info');
            setTimeout(() => {
                localStorage.setItem('currentOrder', JSON.stringify(formData));
                localStorage.removeItem('paymentExpiry');
                window.location.href = 'pembayaran.html';
            }, 1000);
        } finally {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });

    function renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-sm"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt text-sm"></i>';
            } else {
                stars += '<i class="far fa-star text-sm"></i>';
            }
        }
        return stars;
    }

    function showNotification(message, type) {
        const notif = document.getElementById('notification');
        notif.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
        notif.textContent = message;
        notif.classList.remove('translate-x-full');

        setTimeout(() => {
            notif.classList.add('translate-x-full');
        }, 3000);
    }
});
