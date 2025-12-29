import { useMemo } from 'react';

const translations = import.meta.glob('/src/translations/*.json', {
 eager: true,
 import: 'default'
});

export const useTranslation = (langCode) => {
 return useMemo(() => {
  const translationPath = `/src/translations/${langCode}.json`;

  if (translations[translationPath]) {
   return translations[translationPath];
  }

  return translations['/src/translations/en.json'] || null;
 }, [langCode]);
};