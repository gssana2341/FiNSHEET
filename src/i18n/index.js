import en from './en';
import th from './th';

const translations = { en, th };

let currentLang = localStorage.getItem('finsheet_lang') || 'en';
let listeners = [];

/**
 * Get nested value from object by dot-separated key
 * e.g. get(obj, 'nav.home')
 */
function get(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Translate a key. Usage: t('nav.home') → 'Home'
 */
export function t(key) {
  const val = get(translations[currentLang], key);
  if (val === undefined) {
    console.warn(`[i18n] Missing key: "${key}" for lang: "${currentLang}"`);
    return get(translations['en'], key) || key;
  }
  return val;
}

/**
 * Get current language code
 */
export function getLang() {
  return currentLang;
}

/**
 * Set language and notify listeners
 */
export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('finsheet_lang', lang);
    listeners.forEach((fn) => fn(lang));
  }
}

/**
 * Subscribe to language changes. Returns unsubscribe function.
 */
export function onLangChange(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

/**
 * React hook for i18n — causes re-render on language change
 */
export function useI18n() {
  // This will be used with useState to trigger re-renders
  return { t, lang: currentLang, setLang, getLang };
}

export default { t, getLang, setLang, onLangChange };
