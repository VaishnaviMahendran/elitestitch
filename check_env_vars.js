const fs = require('fs');
try {
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
    console.log('NEXT_PUBLIC_SUPABASE_URL Found:', !!url);
    console.log('NEXT_PUBLIC_SUPABASE_URL Value Preview:', url ? url.substring(0, 12) + '...' : 'N/A');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY Found:', !!key);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY Value Preview:', key ? key.substring(0, 5) + '...' : 'N/A');
} catch (err) {
    console.error('Error reading .env.local:', err.message);
}
