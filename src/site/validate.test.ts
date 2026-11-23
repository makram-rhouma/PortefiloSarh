import { describe, expect, it } from 'vitest'
import { validateContact } from './validate'
import { resolveSiteUrl } from './Sections'
import { dicts } from '../i18n/dict'
import * as d from '../content/defaults'

describe('contact validation', () => {
  it('requires every field', () => {
    expect(validateContact({ name: '', email: '', message: '' })).toEqual({ name: 'contact.required', email: 'contact.required', message: 'contact.required' })
  })
  it('rejects a bad email and a short message', () => {
    expect(validateContact({ name: 'A', email: 'nope', message: 'hi' })).toEqual({ email: 'contact.invalidEmail', message: 'contact.tooShort' })
  })
  it('accepts a valid message', () => {
    expect(validateContact({ name: 'A', email: 'a@b.co', message: 'Hello Sarah, nice!' })).toEqual({})
  })
})

describe('QR url', () => {
  it('never points to localhost', () => {
    expect(resolveSiteUrl({ ...d.settings, qrUrl: 'http://localhost:5173' })).toBe(d.SITE_URL_FALLBACK)
    expect(resolveSiteUrl({ ...d.settings, qrUrl: 'https://x.example' })).toBe('https://x.example')
  })
})

describe('content completeness', () => {
  it('every UI string exists in every language', () => {
    for (const l of d.LANGS) for (const k of Object.keys(dicts.en)) expect(dicts[l][k as keyof typeof dicts.en], `${l}:${k}`).toBeTruthy()
  })
  it('every multilingual field is filled in all 4 languages', () => {
    const walk = (v: unknown, path: string): void => {
      if (v && typeof v === 'object' && 'en' in v && 'ar' in v) for (const l of d.LANGS) {
        const x = (v as Record<string, unknown>)[l]
        if ((v as Record<string, unknown>).en !== '') expect(Array.isArray(x) ? x.length : x, `${path}.${l}`).toBeTruthy()
      }
      else if (v && typeof v === 'object') for (const [k, c] of Object.entries(v)) walk(c, `${path}.${k}`)
    }
    walk({ s: d.sections, e: d.experiences, ed: d.education, sk: d.skills, l: d.languages, p: d.portfolio }, 'content')
  })
  it('keeps the CV dates exactly', () => {
    expect(d.experiences.map((e) => e.period)).toEqual(['2024 – 2026', '2020 – 2024', '2019 – 2024'])
  })
})
