'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types and Constants ---

type Language = 'en' | 'tam' | 'hin';
const STORAGE_KEY = 'userLanguage';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

// --- Translation Data ---

const translations = {
    en: {
        'nav.designs': 'Designs',
        'nav.order': 'Custom Order',
        'nav.track': 'Track Order',
        'nav.reviews': 'Reviews',
        'nav.login': 'Login',
        'hero.title': 'Elegance Tailored Exclusively For You',
        'hero.subtitle': 'Premium bespoke tailoring services for the modern individual.',
        'hero.cta.designs': 'Browse Designs',
        'hero.cta.order': 'Start Custom Order',
        'footer.quickLinks': 'Quick Links',
        'footer.contact': 'Contact Us',
        'footer.rights': 'All rights reserved.',
    },
    tam: {
        'nav.designs': 'வடிவமைப்புகள்',
        'nav.order': 'தனிப்பயன் ஆர்டர்',
        'nav.track': 'ஆர்டரை கண்காணிக்கவும்',
        'nav.reviews': 'விமர்சனங்கள்',
        'nav.login': 'உள்நுழைய',
        'hero.title': 'உங்களுக்காக பிரத்யேகமாக வடிவமைக்கப்பட்ட நேர்த்தி',
        'hero.subtitle': 'நவீன தனிநபருக்கான பிரீமிய தையல் சேவைகள்.',
        'hero.cta.designs': 'வடிவமைப்புகளை உலாவுக',
        'hero.cta.order': 'ஆர்டரைத் தொடங்கவும்',
        'footer.quickLinks': 'விரைவு இணைப்புகள்',
        'footer.contact': 'எங்களை தொடர்பு கொள்ள',
        'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    },
    hin: {
        'nav.designs': 'डिज़ाइन',
        'nav.order': 'कस्टम ऑर्डर',
        'nav.track': 'ऑर्डर ट्रैक करें',
        'nav.reviews': 'समीक्षाएं',
        'nav.login': 'लॉग इन करें',
        'hero.title': 'विशेष रूप से आपके लिए तैयार की गई सुंदरता',
        'hero.subtitle': 'आधुनिक व्यक्ति के लिए प्रीमियम सिलाई सेवाएं।',
        'hero.cta.designs': 'डिज़ाइन ब्राउज़ करें',
        'hero.cta.order': 'ऑर्डर शुरू करें',
        'footer.quickLinks': 'त्वरित लिंक',
        'footer.contact': 'संपर्क करें',
        'footer.rights': 'सर्वाधिकार सुरक्षित।',
    }
};

// --- Context Setup ---

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// --- Language Provider Component ---

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // 1. Initialize state with default language to match server (fixes hydration mismatch)
    const [language, setLanguageState] = useState<Language>('en');

    // 2. Effect to load stored language on mount (client-side only)
    useEffect(() => {
        const storedLang = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (storedLang && ['en', 'tam', 'hin'].includes(storedLang)) {
            setLanguageState(storedLang);
        } else {
            // Optional: Detect browser language if no preference stored
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('ta')) setLanguageState('tam');
            else if (browserLang.startsWith('hi')) setLanguageState('hin');
        }
    }, []);

    // 3. Effect to persist language choice whenever it changes
    useEffect(() => {
        if (language) {
            localStorage.setItem(STORAGE_KEY, language);
        }
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string): string => {
        const currentTranslations = translations[language];
        return (currentTranslations as any)[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

// --- Language Hook ---

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}