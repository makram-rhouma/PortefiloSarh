import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import * as d from './defaults'
import type { Lang } from './defaults'

export interface SiteData {
  settings: d.Settings
  sections: d.Sections
  experiences: d.Experience[]
  education: d.Education[]
  skills: d.Skill[]
  languages: d.Language[]
  socials: d.SocialLink[]
  portfolio: d.PortfolioItem[]
  translations: Partial<Record<Lang, Record<string, string>>>
}

export const defaultData: SiteData = {
  settings: d.settings, sections: d.sections, experiences: d.experiences, education: d.education,
  skills: d.skills, languages: d.languages, socials: d.socials, portfolio: d.portfolio, translations: {},
}

const list = async <T,>(table: string, fallback: T[]): Promise<T[]> => {
  // RLS returns only visible rows to the public; admins also see hidden ones, so filter here too.
  const { data, error } = await supabase.from(table).select('*').eq('visible', true).order('sort_order')
  return error || !data ? fallback : (data as T[])
}

export async function loadSiteData(preview = false): Promise<SiteData> {
  const [settingsRows, sectionRows, experiences, education, skills, languages, socials, portfolio] = await Promise.all([
    supabase.from('site_settings').select('key,value'),
    supabase.from('portfolio_sections').select('key,content'),
    list('experiences', d.experiences), list('education', d.education), list('skills', d.skills),
    list('languages', d.languages), list('social_links', d.socials), list('portfolio_items', d.portfolio),
  ])
  const settingsMap: Record<string, unknown> = Object.fromEntries((settingsRows.data ?? []).map((r) => [r.key, r.value]))
  const sectionMap: Record<string, unknown> = Object.fromEntries((sectionRows.data ?? []).map((r) => [r.key, r.content]))
  if (preview) {
    const { data } = await supabase.from('content_drafts').select('entity,entity_id,data')
    for (const r of data ?? []) (r.entity === 'section' ? sectionMap : settingsMap)[r.entity_id] = r.data
  }
  return {
    settings: { ...d.settings, ...(settingsMap.general as object) },
    translations: (settingsMap.translations as SiteData['translations']) ?? {},
    sections: { ...d.sections, ...(sectionMap as Partial<d.Sections>) },
    experiences, education, skills, languages, socials, portfolio,
  }
}

export function useSiteData() {
  const [data, setData] = useState<SiteData>(defaultData)
  useEffect(() => {
    const preview = new URLSearchParams(location.search).has('preview')
    loadSiteData(preview).then(setData).catch(() => {})
  }, [])
  return data
}
