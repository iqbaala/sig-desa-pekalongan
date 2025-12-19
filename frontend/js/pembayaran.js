document.addEventListener('DOMContentLoaded', () => {
    // Retrieve Order Data from LocalStorage
    const orderData = JSON.parse(localStorage.getItem('currentOrder'));

    if (!orderData) {
        alert('Data pesanan tidak ditemukan. Kembali ke halaman produk.');
        window.location.href = 'produk.html';
        return;
    }

    // Populate Data
    document.getElementById('total-amount').textContent = `Rp ${parseInt(orderData.total_price).toLocaleString('id-ID')}`;
    document.getElementById('order-id').textContent = `Order ID: #${Date.now().toString().slice(-6)}`;

    // Countdown Timer (1 Hour)
    startTimer(60 * 60);

    // Render Payment Details
    renderPaymentDetails(orderData.payment_method);

    // Confirm Payment Listener
    const confirmBtn = document.getElementById('confirm-payment');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            // ... existing backend confirm logic ...
            handleBackendConfirm(confirmBtn, orderData);
        });
    }

    // WhatsApp Confirmation Listener
    const waBtn = document.getElementById('confirm-whatsapp');
    if (waBtn) {
        waBtn.addEventListener('click', () => {
            sendToWhatsApp(orderData);
            // Optionally also trigger backend confirm silently or let user do it
            // For now, just WA is enough as fallback
        });
    }
});

async function handleBackendConfirm(btn, orderData) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mengirim...';

    try {
        const response = await fetch('http://localhost:3000/api/checkout/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Konfirmasi terkirim ke sistem! Terima kasih.');
            // Don't clear storage yet, let them click WA if they want
            window.location.href = 'index.html';
        } else {
            alert('Gagal lapor ke sistem. Silakan gunakan tombol WhatsApp.');
        }
    } catch (error) {
        console.error(error);
        alert('Gagal koneksi server. Silakan gunakan tombol WhatsApp.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle text-xl mr-2"></i>Saya Sudah Bayar';
    }
}

function sendToWhatsApp(order) {
    const adminPhone = '6289529691381'; // User's/Admin's number
    const message = `
Halo Admin LabTanam, saya ingin konfirmasi pembayaran pesanan.

*Detail Pesanan:*
🧾 ID Order: #${Date.now().toString().slice(-6)}
👤 Nama: ${order.customer_name}
📦 Produk: ${order.product_name} (${order.qty}x)
💰 Total: Rp ${parseInt(order.total_price).toLocaleString('id-ID')}
💳 Metode: ${order.payment_method}
📍 Alamat: ${order.customer_address}

Mohon segera diproses ya. Terima kasih!
    `.trim();

    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function renderPaymentDetails(method) {
    const container = document.getElementById('payment-instruction');
    const badge = document.getElementById('payment-method-badge');

    badge.textContent = method;

    let content = '';

    if (method === 'Transfer Bank') {
        content = `
            <div class="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/BANK_BRI_logo.svg/1200px-BANK_BRI_logo.svg.png" class="h-12 w-auto mb-4" alt="BRI">
                <p class="text-sm text-gray-500 font-semibold uppercase tracking-wider">Nomor Virtual Account</p>
                <div class="flex items-center justify-center space-x-2 mt-2">
                    <h3 id="account-number" class="text-3xl font-mono font-bold text-gray-800 tracking-widest">002201022909534</h3>
                </div>
                <p class="text-sm text-gray-600 mt-2 font-medium">a.n. LabTanam Official</p>
                
                <div class="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6 text-left">
                    <h4 class="font-bold text-yellow-800 text-sm mb-2"><i class="fas fa-lightbulb mr-2"></i>Petunjuk Transfer</h4>
                    <ol class="list-decimal list-inside text-xs text-yellow-700 space-y-1">
                        <li>Buka aplikasi BRImo atau ATM BRI.</li>
                        <li>Pilih menu <strong>Transfer</strong> > <strong>Tambah Daftar Baru</strong>.</li>
                        <li>Masukkan Bank BRI dan nomor rekening di atas.</li>
                        <li>Masukkan nominal <strong>sesuai total tagihan</strong>.</li>
                        <li>Selesaikan transaksi.</li>
                    </ol>
                </div>
            </div>
        `;
    } else if (method === 'E-Wallet (OVO/Gopay)') {
        content = `
            <div class="flex flex-col items-center">
                <div class="flex space-x-4 mb-4">
                    <span class="bg-purple-600 text-white font-bold px-3 py-1 rounded-full">OVO</span>
                    <span class="bg-blue-600 text-white font-bold px-3 py-1 rounded-full">Gopay</span>
                </div>
                <p class="text-sm text-gray-500 font-semibold uppercase tracking-wider">Nomor Ponsel / E-Wallet</p>
                <div class="flex items-center justify-center space-x-2 mt-2">
                    <h3 id="account-number" class="text-3xl font-mono font-bold text-gray-800 tracking-widest">089529691381</h3>
                </div>
                <p class="text-sm text-gray-600 mt-2 font-medium">a.n. LabTanam Admin</p>

                <div class="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6 text-left">
                    <h4 class="font-bold text-blue-800 text-sm mb-2"><i class="fas fa-mobile-alt mr-2"></i>Cara Bayar</h4>
                    <ol class="list-decimal list-inside text-xs text-blue-700 space-y-1">
                        <li>Buka aplikasi OVO atau Gojek.</li>
                        <li>Pilih menu <strong>Transfer</strong> atau <strong>Bayar</strong>.</li>
                        <li>Masukkan nomor HP di atas.</li>
                        <li>Pastikan nama penerima sesuai.</li>
                        <li>Masukkan nominal dan selesaikan.</li>
                    </ol>
                </div>
            </div>
        `;
    } else {
        content = `
            <div class="text-center py-8">
                <i class="fas fa-hand-holding-usd text-4xl text-green-500 mb-4"></i>
                <h3 class="text-xl font-bold text-gray-800">Pembayaran COD</h3>
                <p class="text-gray-600 mt-2">Silakan siapkan uang tunai pas saat kurir tiba.</p>
                <div class="mt-4 p-4 bg-gray-100 rounded text-sm text-gray-500">
                    Pesanan Anda akan segera diproses oleh admin.
                </div>
            </div>
        `;
        // Hide timer for COD maybe? Let's keep it uniform for now.
    }

    container.innerHTML = content;
}

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const display = document.getElementById('countdown');

    // Check if there's an existing expiry time
    const existingExpiry = localStorage.getItem('paymentExpiry');
    let now = Date.now();
    let end;

    if (existingExpiry && parseInt(existingExpiry) > now) {
        end = parseInt(existingExpiry);
    } else {
        end = now + duration * 1000;
        localStorage.setItem('paymentExpiry', end);
    }

    const interval = setInterval(function () {
        now = Date.now();
        let remaining = Math.ceil((end - now) / 1000);

        if (remaining < 0) {
            clearInterval(interval);
            display.textContent = "KADALUARSA";
            display.classList.add('text-red-600');
            return;
        }

        minutes = parseInt(remaining / 60, 10);
        seconds = parseInt(remaining % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;
    }, 1000);
}

window.copyToClipboard = function () {
    const el = document.getElementById('account-number');
    if (el) {
        navigator.clipboard.writeText(el.textContent.replace(/\s/g, ''));
        alert('Nomor berhasil disalin!');
    }
}
