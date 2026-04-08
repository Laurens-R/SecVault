import { useState, useEffect, useCallback } from 'react'
import { ipcService } from '../services'

interface UseWindowControlsResult {
  isMaximized: boolean
  minimize: () => void
  toggleMaximize: () => void
  close: () => void
}

export function useWindowControls(): UseWindowControlsResult {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    ipcService.isWindowMaximized().then(setIsMaximized).catch(console.error)
  }, [])

  const minimize = useCallback(() => {
    ipcService.minimizeWindow().catch(console.error)
  }, [])

  const toggleMaximize = useCallback(() => {
    ipcService.maximizeWindow().then(() => {
      ipcService.isWindowMaximized().then(setIsMaximized).catch(console.error)
    }).catch(console.error)
  }, [])

  const close = useCallback(() => {
    ipcService.closeWindow().catch(console.error)
  }, [])

  return { isMaximized, minimize, toggleMaximize, close }
}
