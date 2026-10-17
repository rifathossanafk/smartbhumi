import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bn from './bn';
import en from './en';

const savedLanguage = localStorage.getItem('landproof-language') || 'bn';

i18n.use(initReactI18next).init({
  resources: { bn, en },
  lng: savedLanguage,
  fallbackLng: 'bn',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('landproof-language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = 'ltr';
});

export default i18n;
