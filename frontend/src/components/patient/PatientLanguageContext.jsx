import React, { createContext, useContext, useState } from 'react';
import { patientTranslations } from './patientTranslations';

const PatientLanguageContext = createContext();

export const PatientLanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // Default to English

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'en' ? 'ta' : 'en'));
    };

    const t = (key) => {
        return patientTranslations[language][key] || key;
    };

    return (
        <PatientLanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </PatientLanguageContext.Provider>
    );
};

export const usePatientLanguage = () => {
    const context = useContext(PatientLanguageContext);
    if (!context) {
        throw new Error('usePatientLanguage must be used within a PatientLanguageProvider');
    }
    return context;
};
