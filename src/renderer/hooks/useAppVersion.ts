import { useState, useEffect } from 'react'
import { ipcService } from '../services'

interface UseAppVersionResult {
  version: string
  isLoading: boolean
}

export function useAppVersion(): UseAppVersionResult {
  const [version, setVersion] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ipcService
      .getAppVersion()
      .then(setVersion)
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [])

  return { version, isLoading }
}
