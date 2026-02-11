const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env vars manually
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let url = '';
let key = '';
lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        url = trimmed.split('=')[1];
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        key = trimmed.split('=')[1];
    }
});

if (!url || !key) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(url, key);

async function listDrivers() {
    try {
        const { data, error } = await supabase
            .from('delivery_personnel')
            .select('name, personnel_number, password, status');

        if (error) {
            console.error('Error fetching drivers:', error.message);
        } else {
            console.log('\n--- Delivery Personnel Credentials ---');
            if (data.length === 0) {
                console.log('No drivers found.');
            } else {
                console.table(data);
            }
            console.log('--------------------------------------\n');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

listDrivers();
