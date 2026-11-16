import { TRANSLATIONS } from './translations'

/**
 * 언어 코드·목록·번역 함수. 컴포넌트가 아닌 것들만 모아 둔다(i18n.tsx 는 Provider/hook 전용).
 */
export type Lang = 'ko' | 'en' | 'ja' | 'zh'

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'ko', label: '한국어', short: 'KO' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ja', label: '日本語', short: 'JA' },
  { code: 'zh', label: '中文', short: 'ZH' },
]

export type Vars = Record<string, string | number>

/** 번역문 안의 {name} 자리에 값을 끼운다. */
function fill(text: string, vars?: Vars) {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in vars ? String(vars[k]) : m,
  )
}

export function translate(lang: Lang, ko: string, vars?: Vars): string {
  if (lang === 'ko') return fill(ko, vars)
  const entry = TRANSLATIONS[ko]
  if (!entry) {
    if (import.meta.env.DEV) console.warn(`[i18n] missing ${lang}: ${ko}`)
    return fill(ko, vars)
  }
  return fill(entry[lang], vars)
}

/** 가격 표기 — 한국어는 3,000원, 그 외는 ₩3,000. */
export function formatWon(lang: Lang, n: number) {
  const num = n.toLocaleString('ko-KR')
  return lang === 'ko' ? `${num}원` : `₩${num}`
}
