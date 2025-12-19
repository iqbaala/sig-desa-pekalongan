# 🗄️ Supabase Database Setup for LABTANAM

## 📋 Overview

This guide will help you set up the Supabase database for LABTANAM's logbook functionality.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in with GitHub
3. Click "New Project"
4. Choose organization and fill project details:
   - **Name**: `labtanam-mvp`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (Singapore for Indonesia)
5. Wait for project creation (~2 minutes)

### 2. Create Logbook Table

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Create logbook table
CREATE TABLE public.logbook (
    id BIGSERIAL PRIMARY KEY,
    plant_name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100) NOT NULL,
    plant_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    ph_level DECIMAL(3,1) CHECK (ph_level >= 0 AND ph_level <= 14),
    ec_level INTEGER CHECK (ec_level >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for better performance
CREATE INDEX idx_logbook_created_at ON public.logbook(created_at DESC);
CREATE INDEX idx_logbook_plant_name ON public.logbook(plant_name);
CREATE INDEX idx_logbook_status ON public.logbook(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.logbook ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for anonymous users (MVP only)
-- In production, you should implement proper user authentication
CREATE POLICY "Allow all operations for anonymous users" ON public.logbook
    FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.logbook
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### 3. Insert Sample Data (Optional)

```sql
-- Insert sample logbook entries
INSERT INTO public.logbook (plant_name, system_type, plant_date, status, ph_level, ec_level, notes) VALUES
('Selada Hijau', 'NFT', '2024-01-15', 'Vegetatif', 6.2, 850, 'Pertumbuhan baik, daun hijau segar'),
('Kangkung', 'DWC', '2024-01-10', 'Siap Panen', 6.0, 900, 'Siap dipanen minggu ini'),
('Tomat Cherry', 'Ebb & Flow', '2023-12-20', 'Berbunga', 5.8, 1100, 'Mulai berbunga, perlu nutrisi P tinggi'),
('Bayam', 'NFT', '2024-01-18', 'Kecambah', 6.3, 400, 'Baru berkecambah, pertumbuhan normal'),
('Pakcoy', 'DWC', '2024-01-12', 'Vegetatif', 6.1, 750, 'Daun mulai membesar');
```

### 4. Get API Credentials

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Backend Configuration

Update your backend `.env` file:

```env
SUPABASE_URL=https://bvaxxlmhrzocbrqiykqq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2YXh4bG1ocnpvY2JycWl5a29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NjMxMDMsImV4cCI6MjA2OTQzOTEwM30.GjDhx8BUR7Y4FUS2PZalEeDhKVt_zQWGTEV_5nKKgrg
```

## 🧪 Test Database Connection

### 1. Test Backend API

```bash
# Test logbook health
curl https://your-backend-url.railway.app/api/logbook/health

# Test create entry
curl -X POST https://your-backend-url.railway.app/api/logbook \
  -H "Content-Type: application/json" \
  -d '{
    "plant_name": "Test Plant",
    "system_type": "NFT",
    "plant_date": "2024-01-30",
    "status": "Benih",
    "ph_level": 6.5,
    "ec_level": 800,
    "notes": "Test entry from API"
  }'

# Test get entries
curl https://your-backend-url.railway.app/api/logbook
```

### 2. Test Frontend Integration

1. Open your frontend monitoring page
2. Try adding a new logbook entry
3. Check if data appears in Supabase dashboard
4. Verify statistics update correctly

## 📊 Database Schema

### logbook Table Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PRIMARY KEY | Auto-incrementing ID |
| `plant_name` | VARCHAR(255) | NOT NULL | Name of the plant |
| `system_type` | VARCHAR(100) | NOT NULL | Hydroponic system type |
| `plant_date` | DATE | NOT NULL | Date when plant was planted |
| `status` | VARCHAR(50) | NOT NULL | Current plant status |
| `ph_level` | DECIMAL(3,1) | 0-14 range | pH level of water |
| `ec_level` | INTEGER | >= 0 | EC/TDS level in ppm |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Entry creation time |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update time |

### Indexes

- `idx_logbook_created_at`: For chronological queries
- `idx_logbook_plant_name`: For plant name searches
- `idx_logbook_status`: For status filtering

## 🔒 Security Configuration

### Row Level Security (RLS)

Currently configured for MVP with open access. For production:

```sql
-- Remove anonymous access policy
DROP POLICY "Allow all operations for anonymous users" ON public.logbook;

-- Create user-specific policies (after implementing auth)
CREATE POLICY "Users can view own entries" ON public.logbook
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON public.logbook
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.logbook
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.logbook
    FOR DELETE USING (auth.uid() = user_id);
```

## 📈 Performance Optimization

### Query Optimization

```sql
-- Add more indexes if needed
CREATE INDEX idx_logbook_system_type ON public.logbook(system_type);
CREATE INDEX idx_logbook_plant_date ON public.logbook(plant_date);

-- Composite index for common queries
CREATE INDEX idx_logbook_status_created ON public.logbook(status, created_at DESC);
```

### Connection Pooling

Supabase automatically handles connection pooling, but for high traffic:

1. Use connection pooling in your backend
2. Implement query result caching
3. Consider read replicas for analytics

## 🚨 Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   ```
   Error: new row violates row-level security policy
   ```
   - Check RLS policies are correctly configured
   - Verify anonymous access is enabled for MVP

2. **Connection Errors**
   ```
   Error: Failed to connect to Supabase
   ```
   - Check URL and API key are correct
   - Verify network connectivity
   - Check Supabase project status

3. **Data Type Errors**
   ```
   Error: invalid input syntax for type decimal
   ```
   - Validate pH values are numbers between 0-14
   - Ensure EC values are positive integers

### Debug Queries

```sql
-- Check table structure
\d public.logbook

-- View recent entries
SELECT * FROM public.logbook ORDER BY created_at DESC LIMIT 10;

-- Check statistics
SELECT 
    COUNT(*) as total_entries,
    COUNT(DISTINCT plant_name) as unique_plants,
    AVG(ph_level) as avg_ph,
    AVG(ec_level) as avg_ec
FROM public.logbook;

-- View entries by status
SELECT status, COUNT(*) as count 
FROM public.logbook 
GROUP BY status 
ORDER BY count DESC;
```

## 🔄 Backup and Migration

### Automated Backups

Supabase automatically creates daily backups. For additional security:

1. Enable Point-in-Time Recovery (PITR)
2. Set up custom backup schedules
3. Export data regularly for local backups

### Data Export

```sql
-- Export to CSV
COPY (SELECT * FROM public.logbook) TO STDOUT WITH CSV HEADER;
```

---

**✅ Your Supabase database is now ready for LABTANAM!**

The logbook functionality will now persist data in the cloud and sync across all users. 🌱