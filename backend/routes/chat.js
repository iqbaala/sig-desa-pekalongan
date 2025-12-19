const express = require('express');
const axios = require('axios');
const router = express.Router();

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// System prompt for hydroponics AI assistant
const SYSTEM_PROMPT = `Anda adalah AI Assistant ahli hidroponik bernama "LABTANAM AI" yang membantu petani Indonesia. 

KARAKTER & GAYA:
- Ramah, profesional, dan mudah dipahami
- Gunakan bahasa Indonesia yang natural
- Berikan jawaban praktis dan actionable
- Selalu optimis dan mendukung

KEAHLIAN UTAMA:
- Sistem hidroponik (NFT, DWC, Ebb & Flow, Aeroponik, Drip System)
- Nutrisi tanaman (NPK, pH, EC/TDS, defisiensi)
- Pemilihan tanaman (sayuran daun, buah, herbs)
- Troubleshooting masalah (penyakit, hama, pertumbuhan)
- Setup peralatan (pompa, aerator, lighting, greenhouse)

PANDUAN JAWABAN:
- Berikan solusi step-by-step yang jelas
- Sertakan nilai spesifik (pH 6.0-6.5, EC 800-1200 ppm)
- Rekomendasikan produk/tools yang tepat
- Tanyakan detail lebih lanjut jika perlu
- Berikan tips pencegahan

BATASAN:
- Fokus hanya pada hidroponik dan pertanian
- Jika ditanya di luar topik, arahkan kembali ke hidroponik
- Tidak memberikan nasihat medis
- Selalu sarankan konsultasi ahli untuk masalah serius

FORMAT JAWABAN:
- Gunakan emoji yang relevan (🌱 🔹 ⭐)
- Struktur dengan bullet points untuk clarity
- Akhiri dengan pertanyaan follow-up jika memungkinkan

Jawab dalam bahasa Indonesia yang mudah dipahami oleh petani pemula hingga advanced.`;

// Validate OpenRouter API key
if (!OPENROUTER_API_KEY) {
    console.warn('⚠️  OPENROUTER_API_KEY not found in environment variables');
}

// POST /api/chat - Send message to AI
router.post('/', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Message is required and must be a non-empty string'
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                error: 'Message too long',
                message: 'Message must be less than 1000 characters'
            });
        }

        // If OpenRouter API key is not configured, return mock response
        if (!OPENROUTER_API_KEY) {
            console.log('Using mock response (OpenRouter API key not configured)');
            const mockResponse = generateMockResponse(message.toLowerCase());
            return res.json({
                response: mockResponse,
                model: 'mock-gpt-3.5-turbo',
                timestamp: new Date().toISOString()
            });
        }

        // Prepare conversation for OpenRouter
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: message.trim() }
        ];

        // Call OpenRouter API with Kimi model
        const response = await axios.post(OPENROUTER_API_URL, {
            model: 'moonshotai/kimi-k2:free',
            messages: messages,
            max_tokens: 800,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'https://labtanam.vercel.app',
                'X-Title': 'LABTANAM Hydroponics AI Assistant'
            },
            timeout: 30000 // 30 second timeout
        });

        const aiResponse = response.data.choices[0]?.message?.content;
        
        if (!aiResponse) {
            throw new Error('No response from AI model');
        }

        // Log successful request (without sensitive data)
        console.log(`✅ Chat request processed - Length: ${message.length} chars`);

        res.json({
            response: aiResponse,
            model: response.data.model,
            usage: response.data.usage,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API Error:', error.message);

        // Handle different types of errors
        if (error.code === 'ECONNABORTED') {
            return res.status(408).json({
                error: 'Request timeout',
                message: 'AI response took too long. Please try again.'
            });
        }

        if (error.response?.status === 401) {
            return res.status(500).json({
                error: 'API Authentication Error',
                message: 'There was an issue with the AI service. Please try again later.'
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests to AI service. Please wait a moment and try again.'
            });
        }

        if (error.response?.status >= 400 && error.response?.status < 500) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'There was an issue with your request. Please try rephrasing your question.'
            });
        }

        // For other errors, return mock response as fallback
        console.log('Falling back to mock response due to error');
        const mockResponse = generateMockResponse(req.body.message?.toLowerCase() || '');
        
        res.json({
            response: mockResponse,
            model: 'fallback-mock',
            timestamp: new Date().toISOString(),
            fallback: true
        });
    }
});

// Generate mock responses for development/fallback
function generateMockResponse(message) {
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

Apakah ada jenis tanaman spesifik yang ingin Anda tanyakan? 🌱`;
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

Tanaman apa yang sedang Anda budidayakan? 🌱`;
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

Bisa jelaskan gejala lebih detail? Warna daun, bagian yang terkena, sudah berapa lama? 🌱`;
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

Mau sistem untuk tanaman apa dan budget berapa? 🌱`;
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

// GET /api/chat/models - Get available AI models (for debugging)
router.get('/models', async (req, res) => {
    if (!OPENROUTER_API_KEY) {
        return res.json({
            models: ['mock-gpt-3.5-turbo'],
            note: 'OpenRouter API key not configured, using mock responses'
        });
    }

    try {
        const response = await axios.get('https://openrouter.ai/api/v1/models', {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`
            }
        });

        const availableModels = response.data.data
            .filter(model => model.id.includes('gpt') || model.id.includes('claude'))
            .map(model => ({
                id: model.id,
                name: model.name,
                pricing: model.pricing
            }));

        res.json({
            models: availableModels,
            total: availableModels.length
        });
    } catch (error) {
        console.error('Error fetching models:', error.message);
        res.status(500).json({
            error: 'Failed to fetch models',
            message: error.message
        });
    }
});

// GET /api/chat/health - Chat service health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Chat API',
        openrouter_configured: !!OPENROUTER_API_KEY,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;