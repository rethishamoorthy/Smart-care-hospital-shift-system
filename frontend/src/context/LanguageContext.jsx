import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => {
        return translations[language][key] || key;
    };

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
