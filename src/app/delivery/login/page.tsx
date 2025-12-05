'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';

export default function DeliveryLogin() {
    const [personnelNumber, setPersonnelNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simple query to check credentials (in production, use proper auth/hashing)
            const { data, error } = await supabase
                .from('delivery_personnel')
                .select('*')
                .eq('personnel_number', personnelNumber)
                .eq('password', password) // Plain text for demo
                .single();

            if (error || !data) {
                alert('Invalid credentials');
            } else {
                // Set a simple cookie for session
                document.cookie = `driver_token=${data.id}; path=/; max-age=86400`;
                router.push('/delivery/dashboard');
            }
        } catch (err) {
            console.error(err);
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            padding: '1rem'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'var(--secondary)',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <Truck size={32} color="#000" />
                </div>

                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Delivery Partner</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Login to access your orders</p>

                <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Personnel Number</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g., DP-1234"
                            value={personnelNumber}
                            onChange={(e) => setPersonnelNumber(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
