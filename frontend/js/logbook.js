// Logbook Management System with Supabase Integration
class LogbookManager {
    constructor() {
        this.logbook = [];
        // this.apiEndpoint = 'https://lomba-nbpc-3o8t.vercel.app/api/logbook'; // Vercel backend URL
        this.apiEndpoint = 'http://localhost:3000/api/logbook'; // Local backend URL
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadLogbook();
        this.renderLogbook();
        this.updateStats();
    }

    bindEvents() {
        // Form submission
        document.getElementById('logbook-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        // Search and filter
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filterLogbook();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.filterLogbook();
        });

        // Export and clear
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportLogbook();
        });

        document.getElementById('clear-all-btn').addEventListener('click', () => {
            this.clearAllEntries();
        });
    }

    async loadLogbook() {
        try {
            const response = await fetch(this.apiEndpoint);
            if (response.ok) {
                const result = await response.json();
                this.logbook = result.data || [];
                console.log('✅ Logbook loaded from database');
            } else {
                console.warn('Failed to load from database, using localStorage fallback');
                const stored = localStorage.getItem('labtanam-logbook');
                this.logbook = stored ? JSON.parse(stored) : [];
            }
        } catch (error) {
            console.error('Error loading logbook:', error);
            // Fallback to localStorage
            const stored = localStorage.getItem('labtanam-logbook');
            this.logbook = stored ? JSON.parse(stored) : [];
        }
    }

    async saveToDatabase(entry) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plant_name: entry.plantName,
                    system_type: entry.systemType,
                    plant_date: entry.plantDate,
                    status: entry.status,
                    ph_level: entry.phLevel || null,
                    ec_level: entry.ecLevel || null,
                    notes: entry.notes || null
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Entry saved to database');
                return result.data;
            } else {
                throw new Error('Failed to save to database');
            }
        } catch (error) {
            console.error('Error saving to database:', error);
            // Fallback to localStorage
            localStorage.setItem('labtanam-logbook', JSON.stringify(this.logbook));
            throw error;
        }
    }

    async addEntry() {
        const formData = {
            plantName: document.getElementById('plant-name').value,
            systemType: document.getElementById('system-type').value,
            plantDate: document.getElementById('plant-date').value,
            status: document.getElementById('plant-status').value,
            phLevel: document.getElementById('ph-level').value,
            ecLevel: document.getElementById('ec-level').value,
            notes: document.getElementById('notes').value,
            createdAt: new Date().toISOString()
        };

        try {
            // Show loading state
            const submitBtn = document.querySelector('#logbook-form button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
            submitBtn.disabled = true;

            // Save to database
            const savedEntry = await this.saveToDatabase(formData);

            // Convert database format to frontend format
            const frontendEntry = {
                id: savedEntry.id.toString(),
                plantName: savedEntry.plant_name,
                systemType: savedEntry.system_type,
                plantDate: savedEntry.plant_date,
                status: savedEntry.status,
                phLevel: savedEntry.ph_level,
                ecLevel: savedEntry.ec_level,
                notes: savedEntry.notes,
                createdAt: savedEntry.created_at
            };

            this.logbook.unshift(frontendEntry);
            this.renderLogbook();
            this.updateStats();
            this.resetForm();
            this.showNotification('Log berhasil ditambahkan!', 'success');

            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Error adding entry:', error);
            this.showNotification('Gagal menyimpan log. Coba lagi.', 'error');

            // Restore button
            const submitBtn = document.querySelector('#logbook-form button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Simpan Log';
            submitBtn.disabled = false;
        }
    }

    deleteEntry(id) {
        if (confirm('Apakah Anda yakin ingin menghapus log ini?')) {
            this.logbook = this.logbook.filter(entry => entry.id !== id);
            this.saveLogbook();
            this.renderLogbook();
            this.updateStats();
            this.showNotification('Log berhasil dihapus!', 'success');
        }
    }

    editEntry(id) {
        const entry = this.logbook.find(e => e.id === id);
        if (entry) {
            // Fill form with existing data
            document.getElementById('plant-name').value = entry.plantName;
            document.getElementById('system-type').value = entry.systemType;
            document.getElementById('plant-date').value = entry.plantDate;
            document.getElementById('plant-status').value = entry.status;
            document.getElementById('ph-level').value = entry.phLevel || '';
            document.getElementById('ec-level').value = entry.ecLevel || '';
            document.getElementById('notes').value = entry.notes || '';

            // Remove the entry temporarily
            this.logbook = this.logbook.filter(e => e.id !== id);
            this.saveLogbook();
            this.renderLogbook();
            this.updateStats();

            // Scroll to form
            document.getElementById('logbook-form').scrollIntoView({ behavior: 'smooth' });
        }
    }

    resetForm() {
        document.getElementById('logbook-form').reset();
        document.getElementById('plant-date').valueAsDate = new Date();
    }

    renderLogbook() {
        const container = document.getElementById('logbook-entries');
        const emptyState = document.getElementById('empty-state');

        if (this.logbook.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        const filteredLogbook = this.getFilteredLogbook();

        container.innerHTML = filteredLogbook.map(entry => this.createLogEntry(entry)).join('');
    }

    createLogEntry(entry) {
        const statusColors = {
            'Benih': 'bg-gray-100 text-gray-800',
            'Kecambah': 'bg-yellow-100 text-yellow-800',
            'Vegetatif': 'bg-green-100 text-green-800',
            'Berbunga': 'bg-blue-100 text-blue-800',
            'Siap Panen': 'bg-orange-100 text-orange-800',
            'Dipanen': 'bg-purple-100 text-purple-800'
        };

        const createdDate = new Date(entry.createdAt);
        const plantDate = new Date(entry.plantDate);
        const daysDiff = Math.floor((createdDate - plantDate) / (1000 * 60 * 60 * 24));

        return `
            <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <h3 class="text-lg font-semibold text-gray-900 mr-3">${entry.plantName}</h3>
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[entry.status] || 'bg-gray-100 text-gray-800'}">
                                ${entry.status}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                                <span class="font-medium">Sistem:</span> ${entry.systemType}
                            </div>
                            <div>
                                <span class="font-medium">Tanam:</span> ${this.formatDate(entry.plantDate)}
                            </div>
                            <div>
                                <span class="font-medium">Hari ke:</span> ${daysDiff >= 0 ? daysDiff : 0}
                            </div>
                            <div>
                                <span class="font-medium">Dicatat:</span> ${this.formatDate(entry.createdAt)}
                            </div>
                        </div>
                        
                        ${entry.phLevel || entry.ecLevel ? `
                            <div class="flex gap-4 text-sm text-gray-600 mb-3">
                                ${entry.phLevel ? `<div><span class="font-medium">pH:</span> ${entry.phLevel}</div>` : ''}
                                ${entry.ecLevel ? `<div><span class="font-medium">EC:</span> ${entry.ecLevel} ppm</div>` : ''}
                            </div>
                        ` : ''}
                        
                        ${entry.notes ? `
                            <p class="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                                <i class="fas fa-sticky-note mr-2 text-gray-400"></i>${entry.notes}
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="flex space-x-2 mt-4 lg:mt-0 lg:ml-4">
                        <button onclick="logbookManager.editEntry('${entry.id}')" 
                                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            <i class="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button onclick="logbookManager.deleteEntry('${entry.id}')" 
                                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                            <i class="fas fa-trash mr-1"></i>Hapus
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getFilteredLogbook() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;

        return this.logbook.filter(entry => {
            const matchesSearch = entry.plantName.toLowerCase().includes(searchTerm) ||
                entry.systemType.toLowerCase().includes(searchTerm) ||
                (entry.notes && entry.notes.toLowerCase().includes(searchTerm));

            const matchesStatus = !statusFilter || entry.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }

    filterLogbook() {
        this.renderLogbook();
    }

    updateStats() {
        const totalPlants = new Set(this.logbook.map(entry => entry.plantName)).size;
        const today = new Date().toDateString();
        const todayLogs = this.logbook.filter(entry =>
            new Date(entry.createdAt).toDateString() === today
        ).length;

        const activePlants = this.logbook.filter(entry =>
            ['Benih', 'Kecambah', 'Vegetatif', 'Berbunga'].includes(entry.status)
        ).length;

        const harvestReady = this.logbook.filter(entry =>
            entry.status === 'Siap Panen'
        ).length;

        document.getElementById('total-plants').textContent = totalPlants;
        document.getElementById('total-logs').textContent = todayLogs;
        document.getElementById('active-plants').textContent = activePlants;
        document.getElementById('harvest-ready').textContent = harvestReady;
    }

    exportLogbook() {
        if (this.logbook.length === 0) {
            this.showNotification('Tidak ada data untuk diekspor!', 'warning');
            return;
        }

        const csvContent = this.convertToCSV(this.logbook);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `labtanam-logbook-${this.formatDate(new Date())}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showNotification('Logbook berhasil diekspor!', 'success');
        }
    }

    convertToCSV(data) {
        const headers = ['Nama Tanaman', 'Sistem', 'Tanggal Tanam', 'Status', 'pH', 'EC (ppm)', 'Catatan', 'Dibuat'];
        const csvRows = [headers.join(',')];

        data.forEach(entry => {
            const row = [
                `"${entry.plantName}"`,
                `"${entry.systemType}"`,
                `"${entry.plantDate}"`,
                `"${entry.status}"`,
                `"${entry.phLevel || ''}"`,
                `"${entry.ecLevel || ''}"`,
                `"${(entry.notes || '').replace(/"/g, '""')}"`,
                `"${this.formatDate(entry.createdAt)}"`
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    clearAllEntries() {
        if (confirm('Apakah Anda yakin ingin menghapus semua log? Tindakan ini tidak dapat dibatalkan!')) {
            this.logbook = [];
            this.saveLogbook();
            this.renderLogbook();
            this.updateStats();
            this.showNotification('Semua log berhasil dihapus!', 'success');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full`;

        // Set color based on type
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        notification.classList.add(colors[type] || colors.info);
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize logbook manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    window.logbookManager = new LogbookManager();
});

// Supabase integration placeholder (for future implementation)
class SupabaseLogbook {
    constructor() {
        // This will be implemented when Supabase credentials are available
        this.supabaseUrl = 'YOUR_SUPABASE_URL';
        this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        this.client = null;
    }

    async init() {
        // Initialize Supabase client
        // this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
    }

    async saveEntry(entry) {
        // Save to Supabase database
        // const { data, error } = await this.client
        //     .from('logbook')
        //     .insert([entry]);
        // return { data, error };
    }

    async getEntries() {
        // Fetch from Supabase database
        // const { data, error } = await this.client
        //     .from('logbook')
        //     .select('*')
        //     .order('created_at', { ascending: false });
        // return { data, error };
    }

    async deleteEntry(id) {
        // Delete from Supabase database
        // const { data, error } = await this.client
        //     .from('logbook')
        //     .delete()
        //     .eq('id', id);
        // return { data, error };
    }
}