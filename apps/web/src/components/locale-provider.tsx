"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { isLocale, translate, type LocaleCode, type UiKey } from "@/lib/i18n";

interface LocaleCtx {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: UiKey) => string;
}

const Ctx = createContext<LocaleCtx>({
  locale: "id",
  setLocale: () => {},
  t: (key) => translate("id", key),
});

const STORAGE_KEY = "pi-locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("id");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) setLocaleState(stored);
  }, []);

  function setLocale(code: LocaleCode) {
    setLocaleState(code);
    window.localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
  }

  return (
    <Ctx.Provider
      value={{ locale, setLocale, t: (key) => translate(locale, key) }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useLocale() {
  return useContext(Ctx);
}
