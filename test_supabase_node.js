const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read env vars manually since we don't have dotenv loaded by default in this script
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

console.log('Testing connection to:', url);

if (!url || !key) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testParam() {
    try {
        const { data, error } = await supabase.from('designs').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Supabase Success! Data:', data);
        }
    } catch (err) {
        console.error('Fetch Error Message:', err.message);
        console.error('Fetch Error Cause:', err.cause);
        console.error('Fetch Error Stack:', err.stack);
    }
}

testParam();
