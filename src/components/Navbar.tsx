'use client';

import Link from 'next/link';
import { ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { cartCount } = useCart();
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        setUser(null);
    };

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4.5 9.5L14.5 19.5" strokeLinecap="round" />
                            <path d="M16.5 7.5C16.5 7.5 19 5 21 3C21 3 22 4 21 6C19 8 16.5 10.5 16.5 10.5" strokeLinecap="round" />
                            <path d="M19.5 4.5L15.5 8.5" strokeLinecap="round" />
                            <path d="M13.5 10.5L9.5 14.5" stroke="var(--primary)" strokeWidth="2" />
                            <path d="M2 22L4.5 19.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.logoMain}>ELITE STITCH</span>
                        <span className={styles.logoSub}>WORLD</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className={styles.desktopMenu}>
                    <div className={styles.dropdown}>
                        <Link href="/designs" className={styles.navLink}>
                            {t('nav.designs')}
                        </Link>
                        <div className={styles.dropdownContent}>
                            <Link href="/designs?category=Saree Blouse">Saree Blouse</Link>
                            <Link href="/designs?category=Chudithar">Chudithar</Link>
                            <Link href="/designs?category=Lehenga">Lehenga</Link>
                            <Link href="/designs?category=HalfSaree">Half Saree</Link>
                        </div>
                    </div>

                    <Link href="/order" className={styles.navLink}>{t('nav.order')}</Link>
                    <Link href="/track" className={styles.navLink}>{t('nav.track')}</Link>
                    <Link href="/reviews" className={styles.navLink}>{t('nav.reviews')}</Link>
                </div>

                <div className={styles.navActions}>
                    <LanguageSwitcher />

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {user.email?.split('@')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className={styles.iconBtn}
                                aria-label="Logout"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className={styles.iconBtn} aria-label="Login">
                            <User size={20} />
                        </Link>
                    )}

                    <Link href="/cart" className={styles.iconBtn} aria-label="Cart" style={{ position: 'relative' }}>
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: 'var(--primary)',
                                color: '#000',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <button
                        className={styles.mobileToggle}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`${styles.mobileMenu} ${isOpen ? styles.open : ''}`}>
                    <Link href="/designs" className={styles.mobileLink} onClick={() => setIsOpen(false)}>{t('nav.designs')}</Link>
                    <Link href="/order" className={styles.mobileLink} onClick={() => setIsOpen(false)}>{t('nav.order')}</Link>
                    <Link href="/track" className={styles.mobileLink} onClick={() => setIsOpen(false)}>{t('nav.track')}</Link>
                    <Link href="/reviews" className={styles.mobileLink} onClick={() => setIsOpen(false)}>{t('nav.reviews')}</Link>
                </div>
            </div>
        </nav>
    );
}
