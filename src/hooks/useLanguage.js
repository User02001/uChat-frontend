import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const STORAGE_KEY = 'uchat_language_preference';
const EXPIRY_HOURS = 2;

const detectBrowserLanguage = () => {
 const lang = navigator.language || navigator.userLanguage;

 // Map browser locales to our language codes
 const languageMap = {
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  'en-AU': 'en-AU',
  'en-CA': 'en-CA',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'fr': 'fr',
  'fr-FR': 'fr',
  'de': 'de',
  'de-DE': 'de',
  'it': 'it',
  'pt': 'pt',
  'pt-BR': 'pt-BR',
  'ru': 'ru',
  'uk': 'uk',
  'pl': 'pl',
  'nl': 'nl',
  'sv': 'sv',
  'da': 'da',
  'fi': 'fi',
  'no': 'no',
  'zh-CN': 'zh-CN',
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'ja': 'ja',
  'ko': 'ko',
  'vi': 'vi',
  'th': 'th',
  'id': 'id',
  'ms': 'ms',
  'tl': 'tl',
  'hi': 'hi',
  'bn': 'bn',
  'ur': 'ur',
  'pa': 'pa',
  'mr': 'mr',
  'ta': 'ta',
  'te': 'te',
  'gu': 'gu',
  'kn': 'kn',
  'ml': 'ml',
  'ne': 'ne',
  'si': 'si',
  'ar': 'ar',
  'fa': 'fa',
  'he': 'he',
  'tr': 'tr',
  'sw': 'sw',
  'am': 'am',
  'ha': 'ha',
  'yo': 'yo',
  'ig': 'ig',
  'zu': 'zu',
  'xh': 'xh',
  'so': 'so',
  'af': 'af',
  'cs': 'cs',
  'sk': 'sk',
  'hu': 'hu',
  'ro': 'ro',
  'bg': 'bg',
  'el': 'el',
  'sr': 'sr',
  'hr': 'hr',
  'sl': 'sl',
  'lt': 'lt',
  'lv': 'lv',
  'et': 'et',
  'ca': 'ca',
  'eu': 'eu',
  'gl': 'gl',
  'cy': 'cy',
  'ga': 'ga',
  'is': 'is',
  'ka': 'ka',
  'hy': 'hy',
  'az': 'az',
  'kk': 'kk',
  'uz': 'uz',
  'ky': 'ky',
  'tg': 'tg',
  'mn': 'mn',
  'my': 'my',
  'km': 'km',
  'lo': 'lo'
 };

 // Try exact match first
 if (languageMap[lang]) {
  return languageMap[lang];
 }

 // Try language code without region (e.g., 'en' from 'en-NZ')
 const baseLanguage = lang.split('-')[0];
 if (languageMap[baseLanguage]) {
  return languageMap[baseLanguage];
 }

 // Default to en
 return 'en';
};

const getStoredLanguage = () => {
 try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  const { language, expiry } = JSON.parse(stored);

  if (Date.now() > expiry) {
   localStorage.removeItem(STORAGE_KEY);
   return null;
  }

  return language;
 } catch {
  return null;
 }
};

const setStoredLanguage = (language) => {
 const expiry = Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000);
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ language, expiry }));
};

export const useLanguage = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const [currentLanguage, setCurrentLanguage] = useState('en');
 const [suggestedLanguage, setSuggestedLanguage] = useState(null);
 const [showSuggestion, setShowSuggestion] = useState(false);

 useEffect(() => {
  // Priority: URL param > Stored preference > Browser language
  const urlLang = searchParams.get('lang');
  const storedLang = getStoredLanguage();
  const browserLang = detectBrowserLanguage();

  let languageToUse = 'en';

  if (urlLang) {
   languageToUse = urlLang;
   setStoredLanguage(urlLang);
  } else if (storedLang) {
   languageToUse = storedLang;
   setSearchParams({ lang: storedLang }, { replace: true });
  } else {
   languageToUse = browserLang;
   setSearchParams({ lang: browserLang }, { replace: true });

   // Show suggestion if browser language is not English
   if (!browserLang.startsWith('en')) {
    setSuggestedLanguage(browserLang);
    setShowSuggestion(true);
   }
  }

  setCurrentLanguage(languageToUse);
 }, []);

 const changeLanguage = (newLanguage) => {
  setCurrentLanguage(newLanguage);
  setStoredLanguage(newLanguage);
  setSearchParams({ lang: newLanguage }, { replace: true });
  setShowSuggestion(false);
 };

 const acceptSuggestion = () => {
  if (suggestedLanguage) {
   changeLanguage(suggestedLanguage);
  }
 };

 const dismissSuggestion = () => {
  setShowSuggestion(false);
  setSuggestedLanguage(null);
 };

 return {
  currentLanguage,
  changeLanguage,
  suggestedLanguage,
  showSuggestion,
  acceptSuggestion,
  dismissSuggestion
 };
};