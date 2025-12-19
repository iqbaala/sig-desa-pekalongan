const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized');
} else {
    console.warn('⚠️  Supabase credentials not found in environment variables');
}

// GET /api/logbook - Get all logbook entries
router.get('/', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not configured',
                message: 'Supabase connection not available'
            });
        }

        const { data, error } = await supabase
            .from('logbook')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch logbook entries'
            });
        }

        res.json({
            data: data || [],
            count: data ? data.length : 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Logbook GET error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve logbook entries'
        });
    }
});

// POST /api/logbook - Create new logbook entry
router.post('/', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not configured',
                message: 'Supabase connection not available'
            });
        }

        const {
            plant_name,
            system_type,
            plant_date,
            status,
            ph_level,
            ec_level,
            notes
        } = req.body;

        // Validate required fields
        if (!plant_name || !system_type || !plant_date || !status) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'plant_name, system_type, plant_date, and status are required'
            });
        }

        // Validate data types
        if (ph_level && (isNaN(ph_level) || ph_level < 0 || ph_level > 14)) {
            return res.status(400).json({
                error: 'Invalid pH level',
                message: 'pH level must be a number between 0 and 14'
            });
        }

        if (ec_level && (isNaN(ec_level) || ec_level < 0)) {
            return res.status(400).json({
                error: 'Invalid EC level',
                message: 'EC level must be a positive number'
            });
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('logbook')
            .insert([{
                plant_name: plant_name.trim(),
                system_type: system_type.trim(),
                plant_date,
                status: status.trim(),
                ph_level: ph_level ? parseFloat(ph_level) : null,
                ec_level: ec_level ? parseFloat(ec_level) : null,
                notes: notes ? notes.trim() : null
            }])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to create logbook entry'
            });
        }

        console.log(`✅ Logbook entry created: ${plant_name}`);

        res.status(201).json({
            message: 'Logbook entry created successfully',
            data: data[0],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Logbook POST error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create logbook entry'
        });
    }
});

// PUT /api/logbook/:id - Update logbook entry
router.put('/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not configured',
                message: 'Supabase connection not available'
            });
        }

        const { id } = req.params;
        const {
            plant_name,
            system_type,
            plant_date,
            status,
            ph_level,
            ec_level,
            notes
        } = req.body;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Valid numeric ID is required'
            });
        }

        // Prepare update data
        const updateData = {};
        if (plant_name) updateData.plant_name = plant_name.trim();
        if (system_type) updateData.system_type = system_type.trim();
        if (plant_date) updateData.plant_date = plant_date;
        if (status) updateData.status = status.trim();
        if (ph_level !== undefined) updateData.ph_level = ph_level ? parseFloat(ph_level) : null;
        if (ec_level !== undefined) updateData.ec_level = ec_level ? parseFloat(ec_level) : null;
        if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;

        // Update in Supabase
        const { data, error } = await supabase
            .from('logbook')
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase update error:', error);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to update logbook entry'
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'Logbook entry with specified ID does not exist'
            });
        }

        console.log(`✅ Logbook entry updated: ID ${id}`);

        res.json({
            message: 'Logbook entry updated successfully',
            data: data[0],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Logbook PUT error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update logbook entry'
        });
    }
});

// DELETE /api/logbook/:id - Delete logbook entry
router.delete('/:id', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not configured',
                message: 'Supabase connection not available'
            });
        }

        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                error: 'Invalid ID',
                message: 'Valid numeric ID is required'
            });
        }

        // Delete from Supabase
        const { data, error } = await supabase
            .from('logbook')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            console.error('Supabase delete error:', error);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to delete logbook entry'
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'Logbook entry with specified ID does not exist'
            });
        }

        console.log(`✅ Logbook entry deleted: ID ${id}`);

        res.json({
            message: 'Logbook entry deleted successfully',
            data: data[0],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Logbook DELETE error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to delete logbook entry'
        });
    }
});

// GET /api/logbook/stats - Get logbook statistics
router.get('/stats', async (req, res) => {
    try {
        if (!supabase) {
            return res.status(500).json({
                error: 'Database not configured',
                message: 'Supabase connection not available'
            });
        }

        // Get all entries for statistics
        const { data, error } = await supabase
            .from('logbook')
            .select('*');

        if (error) {
            console.error('Supabase stats error:', error);
            return res.status(500).json({
                error: 'Database error',
                message: 'Failed to fetch statistics'
            });
        }

        const entries = data || [];
        const today = new Date().toDateString();

        // Calculate statistics
        const stats = {
            total_plants: new Set(entries.map(e => e.plant_name)).size,
            total_logs: entries.length,
            logs_today: entries.filter(e => 
                new Date(e.created_at).toDateString() === today
            ).length,
            active_plants: entries.filter(e => 
                ['Benih', 'Kecambah', 'Vegetatif', 'Berbunga'].includes(e.status)
            ).length,
            harvest_ready: entries.filter(e => e.status === 'Siap Panen').length,
            by_system: {},
            by_status: {},
            avg_ph: 0,
            avg_ec: 0
        };

        // Count by system type
        entries.forEach(entry => {
            stats.by_system[entry.system_type] = (stats.by_system[entry.system_type] || 0) + 1;
            stats.by_status[entry.status] = (stats.by_status[entry.status] || 0) + 1;
        });

        // Calculate averages
        const phValues = entries.filter(e => e.ph_level).map(e => e.ph_level);
        const ecValues = entries.filter(e => e.ec_level).map(e => e.ec_level);

        if (phValues.length > 0) {
            stats.avg_ph = (phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(1);
        }

        if (ecValues.length > 0) {
            stats.avg_ec = Math.round(ecValues.reduce((a, b) => a + b, 0) / ecValues.length);
        }

        res.json({
            stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Logbook stats error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to calculate statistics'
        });
    }
});

// GET /api/logbook/health - Logbook service health check
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Logbook API',
        supabase_configured: !!supabase,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;