import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '../services'
import type { AppSettings, AppTheme } from '../models'
import { DEFAULT_SETTINGS } from '../models'

interface UseSettingsResult {
  settings: AppSettings
  loading: boolean
  resolvedTheme: 'dark' | 'light'
  update: (key: keyof AppSettings, value: boolean | string) => Promise<void>
}

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: AppTheme): 'dark' | 'light' {
  return theme === 'system' ? getSystemTheme() : theme
}

function applyTheme(theme: AppTheme): void {
  document.documentElement.setAttribute('data-theme', resolveTheme(theme))
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsService.get()
      .then(s => {
        setSettings(s)
        setLoading(false)
        applyTheme(s.theme)
      })
      .catch(console.error)
  }, [])

  // Live update when OS preference changes (only active when theme === 'system')
  useEffect(() => {
    if (settings.theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (): void => applyTheme('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings.theme])

  const update = useCallback(async (key: keyof AppSettings, value: boolean | string): Promise<void> => {
    await settingsService.set(key, value)
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'theme') applyTheme(value as AppTheme)
      return next
    })
  }, [])

  const resolvedTheme = resolveTheme(settings.theme)

  return { settings, loading, resolvedTheme, update }
}
