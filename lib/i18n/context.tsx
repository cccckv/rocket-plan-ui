"use client";

import * as React from "react";
import { translations, type Locale, type TranslationKeys } from "./translations";

const VALID_LOCALES: Locale[] = ["en", "zh", "ja", "ko"];

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("locale");
  if (stored && VALID_LOCALES.includes(stored as Locale)) {
    return stored as Locale;
  }
  return "en";
}

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
};

const I18nContext = React.createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: translations.en as TranslationKeys,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState<Locale>("en");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setLocale(getInitialLocale());
    setMounted(true);
  }, []);

  const handleSetLocale = React.useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
  }, []);

  const value = React.useMemo(
    () => ({
      locale,
      setLocale: handleSetLocale,
      t: (translations[locale] ?? translations.en) as TranslationKeys,
    }),
    [locale, handleSetLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return React.useContext(I18nContext);
}
