import i18n from "i18next";

import translationEN from "./locales/en.json";
import translationES from "./locales/es.json";

i18n.init({
  resources: {
    en: { translation: translationEN },
    es: { translation: translationES },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
