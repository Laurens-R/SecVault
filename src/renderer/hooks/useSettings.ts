import { useState, useEffect, useCallback } from 'react'
import { settingsService } from '../services'
import type { AppSettings } from '../models'
import { DEFAULT_SETTINGS } from '../models'

interface UseSettingsResult {
  settings: AppSettings
  loading: boolean
  update: (key: keyof AppSettings, value: boolean) => Promise<void>
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    settingsService.get()
      .then(s => { setSettings(s); setLoading(false) })
      .catch(console.error)
  }, [])

  const update = useCallback(async (key: keyof AppSettings, value: boolean): Promise<void> => {
    await settingsService.set(key, value)
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  return { settings, loading, update }
}
