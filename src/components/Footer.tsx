'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.section}>
                    <Link href="/" className={styles.logo}>
                        TAILOR<span className={styles.logoAccent}>.CO</span>
                    </Link>
                    <p className={styles.description}>
                        {t('hero.subtitle')}
                    </p>
                    <div className={styles.socials}>
                        <br />
                        <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                        <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>{t('footer.quickLinks')}</h3>
                    <ul className={styles.links}>
                        <li><Link href="/designs">{t('nav.designs')}</Link></li>
                        <li><Link href="/order">{t('nav.order')}</Link></li>
                        <li><Link href="/track">{t('nav.track')}</Link></li>
                        <li><Link href="/reviews">{t('nav.reviews')}</Link></li>
                    </ul>
                </div>

                <div className={styles.section}>
                    <h3>{t('footer.contact')}</h3>
                    <ul className={styles.contactInfo}>
                        <li>
                            <MapPin size={18} />
                            <span>42/1, llnd cross M.G.R nagar, Chinnathirupathi, Salem -636 008</span>
                        </li>
                        <li>
                            <Phone size={18} />
                            <span>9876543210</span>
                        </li>
                        <li>
                            <Mail size={18} />
                            <span>hello@tailor.co</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className={styles.bottom}>
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} Tailor.co. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
}
