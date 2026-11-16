import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LANGS, translate } from './lang'
import type { Lang, Vars } from './lang'

/**
 * 다국어 Provider/hook. 한국어 원문을 키로 두고 영어·일본어·중국어 번역을 찾는다(lang.ts).
 * 원문은 코드에 그대로 남고, 번역이 없으면 한국어가 그대로 나간다(빠진 번역을 숨기지 않는다).
 */
const LANG_KEY = '86400-lang'

function detectLang(): Lang {
  try {
    const saved = window.localStorage.getItem(LANG_KEY)
    if (saved && LANGS.some((l) => l.code === saved)) return saved as Lang
  } catch {
    // 저장소를 못 읽으면 브라우저 언어로.
  }
  const nav = (navigator.language || 'ko').toLowerCase()
  if (nav.startsWith('ko')) return 'ko'
  if (nav.startsWith('ja')) return 'ja'
  if (nav.startsWith('zh')) return 'zh'
  return 'en'
}

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  tx: (ko: string, vars?: Vars) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(LANG_KEY, next)
    } catch {
      // 저장이 막혀도 이번 방문 동안은 바뀐 언어를 유지한다.
    }
  }, [])

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      tx: (ko, vars) => translate(lang, ko, vars),
    }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
