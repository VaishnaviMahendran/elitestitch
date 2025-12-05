'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/auth.module.css'; // Reuse login styles

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [resendMessage, setResendMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    address: address,
                },
            },
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
        setLoading(false);
    };

    const handleResend = async () => {
        setResending(true);
        setResendMessage(null);

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            setResendMessage(`Error: ${error.message}`);
        } else {
            setResendMessage('Confirmation email resent successfully!');
        }
        setResending(false);
    };

    if (success) {
        return (
            <div className={styles.container}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Check Your Email</h1>
                    <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>
                        We've sent a confirmation link to <strong>{email}</strong>.
                        Please click the link to verify your account before logging in.
                    </p>

                    {resendMessage && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: resendMessage.includes('Error') ? '#fee2e2' : '#dcfce7',
                            color: resendMessage.includes('Error') ? '#991b1b' : '#166534',
                            fontSize: '0.9rem'
                        }}>
                            {resendMessage}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/login" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
                            Go to Login
                        </Link>

                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="btn"
                            style={{
                                width: '100%',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)'
                            }}
                        >
                            {resending ? 'Sending...' : 'Resend Confirmation Email'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us to start your bespoke journey</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSignup} className={styles.form}>
                    <div className={styles.group}>
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className={styles.input}
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            className={styles.input}
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            placeholder="Your delivery address"
                        />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                <p className={styles.footer}>
                    Already have an account? <Link href="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
