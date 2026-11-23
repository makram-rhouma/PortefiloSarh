import type { Key } from '../i18n/dict'

export type ContactErrors = Partial<Record<'name' | 'email' | 'message', Key>>
export function validateContact(v: { name: string; email: string; message: string }): ContactErrors {
  const e: ContactErrors = {}
  if (!v.name) e.name = 'contact.required'
  if (!v.email) e.email = 'contact.required'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) e.email = 'contact.invalidEmail'
  if (!v.message) e.message = 'contact.required'
  else if (v.message.length < 10) e.message = 'contact.tooShort'
  return e
}
