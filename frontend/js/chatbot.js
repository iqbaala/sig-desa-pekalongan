// Chatbot Manager
class ChatbotManager {
    constructor() {
        this.messages = this.loadMessages();
        // this.apiEndpoint = 'https://lomba-nbpc-3o8t.vercel.app/api/chat'; // Vercel backend URL
        this.apiEndpoint = 'http://localhost:3000/api/chat'; // Local backend URL
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderMessages();
    }

    bindEvents() {
        // Form submission
        document.getElementById('chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Enter key to send
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat
        document.getElementById('clear-chat').addEventListener('click', () => {
            this.clearChat();
        });

        // Quick questions
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent.trim().replace(/^[•\s]*/, '');
                document.getElementById('chat-input').value = question;
                this.sendMessage();
            });
        });
    }

    loadMessages() {
        const stored = localStorage.getItem('labtanam-chat');
        return stored ? JSON.parse(stored) : [];
    }

    saveMessages() {
        localStorage.setItem('labtanam-chat', JSON.stringify(this.messages));
    }

    async sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message || this.isLoading) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show loading
        this.showLoading();
        
        try {
            const response = await this.callAPI(message);
            this.hideLoading();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideLoading();
            this.addMessage('Maaf, terjadi kesalahan. Silakan coba lagi nanti.', 'bot', true);
            console.error('Chat error:', error);
        }
    }

    async callAPI(message) {
        // For MVP, we'll use a mock response system
        // In production, this would call the actual backend API
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        return this.getMockResponse(message);
    }

    getMockResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // pH related questions
        if (lowerMessage.includes('ph') || lowerMessage.includes('asam') || lowerMessage.includes('basa')) {
            return `Untuk pH air hidroponik yang ideal:

🔹 **pH Optimal**: 5.5 - 6.5 untuk sebagian besar tanaman
🔹 **Sayuran daun**: pH 6.0 - 6.5 (selada, kangkung, bayam)
🔹 **Buah-buahan**: pH 5.5 - 6.0 (tomat, cabai, mentimun)

**Cara mengatur pH:**
• Gunakan pH meter digital untuk akurasi
• pH turun: tambahkan pH Up (KOH/NaOH)
• pH naik: tambahkan pH Down (asam fosfat)
• Periksa dan sesuaikan setiap hari
• Catat perubahan dalam logbook

Apakah ada jenis tanaman spesifik yang ingin Anda tanyakan?`;
        }
        
        // Nutrient/EC related
        if (lowerMessage.includes('nutrisi') || lowerMessage.includes('ec') || lowerMessage.includes('tds') || lowerMessage.includes('ppm')) {
            return `Panduan nutrisi hidroponik:

🔹 **EC/TDS yang ideal:**
• Bibit: 200-400 ppm
• Vegetatif: 600-900 ppm  
• Berbunga/berbuah: 900-1200 ppm

🔹 **Nutrisi utama (NPK):**
• Nitrogen (N): pertumbuhan daun
• Fosfor (P): akar dan bunga
• Kalium (K): buah dan ketahanan

🔹 **Tips nutrisi:**
• Ganti larutan setiap 1-2 minggu
• Tambah air bersih jika EC terlalu tinggi
• Gunakan nutrisi AB mix berkualitas
• Monitor suhu air (18-25°C)

Tanaman apa yang sedang Anda budidayakan?`;
        }
        
        // Plant problems/diseases
        if (lowerMessage.includes('layu') || lowerMessage.includes('kuning') || lowerMessage.includes('mati') || lowerMessage.includes('sakit')) {
            return `Diagnosis masalah tanaman hidroponik:

🔹 **Daun layu:**
• Kekurangan air/nutrisi
• Suhu terlalu tinggi (>30°C)
• Akar busuk karena oksigen kurang

🔹 **Daun menguning:**
• Kekurangan nitrogen
• pH tidak sesuai (nutrisi terkunci)
• Pencahayaan kurang

🔹 **Solusi:**
• Periksa pH dan EC segera
• Pastikan pompa air berfungsi
• Cek aerasi (gelembung udara)
• Potong bagian yang rusak
• Ganti larutan nutrisi

Bisa jelaskan gejala lebih detail? Warna daun, bagian yang terkena, sudah berapa lama?`;
        }
        
        // System types
        if (lowerMessage.includes('sistem') || lowerMessage.includes('nft') || lowerMessage.includes('dwc') || lowerMessage.includes('pemula')) {
            return `Sistem hidroponik untuk pemula:

🔹 **Deep Water Culture (DWC)** ⭐ Termudah
• Akar terendam dalam larutan nutrisi
• Perlu aerator untuk oksigen
• Cocok: selada, kangkung, bayam

🔹 **NFT (Nutrient Film Technique)**
• Aliran tipis nutrisi di talang
• Hemat air dan nutrisi
• Cocok: sayuran daun, strawberry

🔹 **Ebb & Flow (Pasang Surut)**
• Nutrisi naik-turun berkala
• Fleksibel untuk berbagai tanaman
• Butuh timer otomatis

**Rekomendasi pemula:** Mulai dengan DWC karena paling sederhana dan murah!

Mau sistem untuk tanaman apa dan budget berapa?`;
        }
        
        // Pest control
        if (lowerMessage.includes('hama') || lowerMessage.includes('serangga') || lowerMessage.includes('ulat') || lowerMessage.includes('aphid')) {
            return `Pengendalian hama hidroponik:

🔹 **Hama umum:**
• Kutu daun (aphid) - hijau/hitam kecil
• Thrips - bercak putih di daun
• Whitefly - lalat putih kecil
• Spider mites - jaring halus

🔹 **Pencegahan:**
• Jaring serangga di greenhouse
• Kebersihan area tanam
• Karantina tanaman baru
• Sirkulasi udara baik

🔹 **Pengendalian organik:**
• Semprotan sabun insektisida
• Neem oil (minyak mimba)
• Predator alami (ladybug)
• Sticky trap kuning

🔹 **Hindari pestisid kimia** pada sistem hidroponik!

Hama apa yang sedang menyerang tanaman Anda?`;
        }
        
        // Plant selection
        if (lowerMessage.includes('tanaman') && (lowerMessage.includes('cocok') || lowerMessage.includes('mudah') || lowerMessage.includes('pilih'))) {
            return `Tanaman hidroponik untuk pemula:

🔹 **Sangat Mudah (1-2 bulan panen):**
• Selada - 30-40 hari
• Kangkung - 25-30 hari  
• Bayam - 35-45 hari
• Pakcoy - 40-50 hari

🔹 **Mudah (2-3 bulan):**
• Cabai rawit - 60-90 hari
• Tomat cherry - 70-80 hari
• Mentimun jepang - 50-60 hari

🔹 **Tips memilih:**
• Mulai dari sayuran daun
• Pilih varietas unggul/hibrida
• Sesuaikan dengan iklim lokal
• Pertimbangkan harga jual

**Rekomendasi:** Mulai dengan selada atau kangkung karena cepat panen dan mudah perawatan!

Mau fokus untuk konsumsi sendiri atau komersial?`;
        }
        
        // General/default response
        return `Terima kasih atas pertanyaan Anda tentang hidroponik! 

Saya bisa membantu dengan berbagai topik:
• **Nutrisi & pH** - pengaturan dan troubleshooting
• **Sistem hidroponik** - NFT, DWC, Ebb & Flow
• **Pemilihan tanaman** - cocok untuk pemula/komersial  
• **Masalah tanaman** - diagnosis penyakit dan hama
• **Tips perawatan** - monitoring harian

Bisa jelaskan lebih spesifik masalah atau hal yang ingin Anda ketahui? Semakin detail pertanyaannya, semakin tepat solusi yang bisa saya berikan! 🌱

Contoh pertanyaan yang baik:
"Selada saya daunnya menguning di bagian bawah, pH 6.2, EC 800 ppm, sudah 3 minggu tanam. Kenapa ya?"`;
    }

    addMessage(content, sender, isError) {
        isError = isError || false;
        const message = {
            id: Date.now().toString(),
            content,
            sender,
            timestamp: new Date().toISOString(),
            isError
        };
        
        this.messages.push(message);
        this.saveMessages();
        this.renderMessages();
        this.scrollToBottom();
    }

    showLoading() {
        this.isLoading = true;
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = true;
        sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Add loading message
        const messagesContainer = document.getElementById('chat-messages');
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-message';
        loadingDiv.className = 'flex items-start';
        loadingDiv.innerHTML = `
            <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                <i class="fas fa-robot text-white text-sm"></i>
            </div>
            <div class="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md">
                <div class="flex items-center space-x-2">
                    <div class="flex space-x-1">
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                        <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    </div>
                    <span class="text-gray-600 text-sm">AI sedang berpikir...</span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        this.isLoading = false;
        const sendButton = document.getElementById('send-button');
        sendButton.disabled = false;
        sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        
        // Remove loading message
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    renderMessages() {
        const container = document.getElementById('chat-messages');
        
        // Keep welcome message and clear the rest
        const welcomeMessage = container.querySelector('.flex');
        container.innerHTML = '';
        if (welcomeMessage && this.messages.length === 0) {
            container.appendChild(welcomeMessage);
        }
        
        // Render all messages
        this.messages.forEach(message => {
            const messageDiv = this.createMessageElement(message);
            container.appendChild(messageDiv);
        });
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex items-start';
        
        if (message.sender === 'user') {
            messageDiv.className += ' justify-end';
            messageDiv.innerHTML = `
                <div class="bg-purple-600 text-white rounded-lg p-3 max-w-xs lg:max-w-md ml-auto">
                    <p>${this.escapeHtml(message.content)}</p>
                    <div class="text-xs opacity-75 mt-1">${this.formatTime(message.timestamp)}</div>
                </div>
                <div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                    <i class="fas fa-user text-white text-sm"></i>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <i class="fas fa-robot text-white text-sm"></i>
                </div>
                <div class="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md ${message.isError ? 'border border-red-300 bg-red-50' : ''}">
                    <div class="text-gray-800 whitespace-pre-line">${this.formatBotMessage(message.content)}</div>
                    <div class="text-xs text-gray-500 mt-1">${this.formatTime(message.timestamp)}</div>
                </div>
            `;
        }
        
        return messageDiv;
    }

    formatBotMessage(content) {
        // Convert markdown-like formatting to HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/🔹 \*\*(.*?)\*\*/g, '<div class="font-semibold text-purple-700 mt-2">🔹 $1</div>')
            .replace(/• (.*?)$/gm, '<div class="ml-4">• $1</div>')
            .replace(/⭐/g, '<span class="text-yellow-500">⭐</span>')
            .replace(/🌱/g, '<span class="text-green-500">🌱</span>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    scrollToBottom() {
        const container = document.getElementById('chat-messages');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }

    clearChat() {
        if (confirm('Hapus semua percakapan? Tindakan ini tidak dapat dibatalkan.')) {
            this.messages = [];
            this.saveMessages();
            
            // Reset to welcome message only
            const container = document.getElementById('chat-messages');
            container.innerHTML = `
                <div class="flex items-start">
                    <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <i class="fas fa-robot text-white text-sm"></i>
                    </div>
                    <div class="bg-gray-100 rounded-lg p-3 max-w-xs lg:max-w-md">
                        <p class="text-gray-800">
                            Halo! Saya AI Assistant untuk hidroponik. Saya bisa membantu Anda dengan:
                            <br>• Masalah nutrisi dan pH
                            <br>• Pemilihan tanaman
                            <br>• Sistem hidroponik
                            <br>• Diagnosis penyakit tanaman
                            <br><br>Silakan tanyakan apa saja! 🌱
                        </p>
                    </div>
                </div>
            `;
            
            this.showNotification('Chat berhasil dihapus!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full`;
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.chatbotManager = new ChatbotManager();
});