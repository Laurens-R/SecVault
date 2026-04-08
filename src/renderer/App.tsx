import { useState } from 'react'
import { TitleBar } from './components'
import { HomePage, VaultPage, SettingsPage } from './pages'
import type { VaultResult } from './models'
import styles from './App.module.scss'

interface VaultSession {
  vault: VaultResult
  password: string
}

function App(): JSX.Element {
  const [activeSession, setActiveSession] = useState<VaultSession | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <TitleBar onSettings={() => setSettingsOpen(prev => !prev)} />
      <main className={styles.content}>
        {settingsOpen ? (
          <SettingsPage onBack={() => setSettingsOpen(false)} />
        ) : !activeSession ? (
          <HomePage onVaultOpen={(v, p) => setActiveSession({ vault: v, password: p })} />
        ) : null}

        {/* Keep VaultPage mounted while a session is active so its state survives settings navigation */}
        {activeSession && (
          <div style={{ display: settingsOpen ? 'none' : 'contents' }}>
            <VaultPage
              vault={activeSession.vault}
              password={activeSession.password}
              onLock={() => setActiveSession(null)}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
