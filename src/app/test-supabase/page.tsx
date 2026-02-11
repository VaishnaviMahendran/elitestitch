'use client';
import { createBrowserClient } from '@supabase/ssr';
import { useState, useEffect } from 'react';

export default function TestPage() {
    const [status, setStatus] = useState('Testing...');
    const [env, setEnv] = useState<any>({});
    const [details, setDetails] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            setEnv({
                urlPresent: !!url,
                keyPresent: !!key,
                urlStart: url ? url.substring(0, 8) : 'N/A'
            });

            if (!url || !key) {
                setStatus('Missing Env Vars');
                return;
            }

            try {
                const supabase = createBrowserClient(url, key);
                // Try a simple ping, await the result directly
                const { data, error } = await supabase.from('designs').select('count', { count: 'exact', head: true });

                if (error) {
                    setStatus('DB Error');
                    setDetails(error.message + ' | ' + error.code);
                } else {
                    setStatus('DB Success');
                }
            } catch (err: any) {
                setStatus('Fetch Error');
                setDetails(err.message || 'Unknown error');
            }
        };

        checkConnection();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>Supabase Connectivity Test</h1>
            <p id="status" style={{ fontWeight: 'bold', fontSize: 24 }}>{status}</p>
            <p id="details">{details}</p>
            <pre id="env">{JSON.stringify(env, null, 2)}</pre>
        </div>
    );
}
