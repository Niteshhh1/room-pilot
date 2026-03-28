import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

export const useT = () => {
  const { language } = useLanguageStore();
  const dict = translations[language] || translations.en;
  const t = (key) => dict[key] || translations.en[key] || key;
  return { t, language };
};
