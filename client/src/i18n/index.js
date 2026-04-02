import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.js';
import ru from './ru.js';
import uz from './uz.js';

const savedLanguage = localStorage.getItem('chronos_lang') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: { en, ru, uz },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  localStorage.setItem('chronos_lang', lang);
}

export default i18n;
