#!/usr/bin/env node

// Test script for LABTANAM backend
require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testing LABTANAM Backend Configuration...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log('');

// Test 2: OpenRouter API
async function testOpenRouter() {
    console.log('2️⃣ Testing OpenRouter API:');
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: 'moonshotai/kimi-k2:free',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello, just testing the API connection.' }
            ],
            max_tokens: 50
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('   ✅ OpenRouter API connection successful');
        console.log(`   📊 Model: ${response.data.model}`);
        console.log(`   💬 Response: ${response.data.choices[0]?.message?.content?.substring(0, 50)}...`);
    } catch (error) {
        console.log('   ❌ OpenRouter API connection failed');
        console.log(`   🚨 Error: ${error.response?.data?.error?.message || error.message}`);
    }
    console.log('');
}

// Test 3: Supabase Connection
async function testSupabase() {
    console.log('3️⃣ Testing Supabase Connection:');
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        // Test connection by trying to read from logbook table
        const { data, error } = await supabase
            .from('logbook')
            .select('count', { count: 'exact', head: true });

        if (error) {
            throw error;
        }

        console.log('   ✅ Supabase connection successful');
        console.log(`   📊 Logbook entries count: ${data || 0}`);
    } catch (error) {
        console.log('   ❌ Supabase connection failed');
        console.log(`   🚨 Error: ${error.message}`);
        console.log('   💡 Make sure to run the SQL setup script in Supabase dashboard');
    }
    console.log('');
}

// Test 4: Create Test Entry
async function testLogbookCreate() {
    console.log('4️⃣ Testing Logbook Entry Creation:');
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const testEntry = {
            plant_name: 'Test Plant - ' + new Date().toISOString(),
            system_type: 'NFT',
            plant_date: new Date().toISOString().split('T')[0],
            status: 'Benih',
            ph_level: 6.5,
            ec_level: 800,
            notes: 'Test entry created by test script'
        };

        const { data, error } = await supabase
            .from('logbook')
            .insert([testEntry])
            .select();

        if (error) {
            throw error;
        }

        console.log('   ✅ Test entry created successfully');
        console.log(`   📝 Entry ID: ${data[0].id}`);
        console.log(`   🌱 Plant: ${data[0].plant_name}`);

        // Clean up - delete test entry
        await supabase.from('logbook').delete().eq('id', data[0].id);
        console.log('   🧹 Test entry cleaned up');

    } catch (error) {
        console.log('   ❌ Failed to create test entry');
        console.log(`   🚨 Error: ${error.message}`);
    }
    console.log('');
}

// Run all tests
async function runTests() {
    await testOpenRouter();
    await testSupabase();
    await testLogbookCreate();

    console.log('🎉 Testing completed!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. If all tests pass, your backend is ready for deployment');
    console.log('   2. Deploy to Railway with these environment variables');
    console.log('   3. Update frontend API endpoints with your Railway URL');
    console.log('   4. Test the full application end-to-end');
}

runTests().catch(console.error);