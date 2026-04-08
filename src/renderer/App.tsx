import { useState } from 'react'
import { TitleBar } from './components'
import { HomePage, VaultPage } from './pages'
import type { VaultResult } from './models'
import styles from './App.module.scss'

function App(): JSX.Element {
  const [activeVault, setActiveVault] = useState<VaultResult | null>(null)

  return (
    <div className={styles.layout}>
      <TitleBar />
      <main className={styles.content}>
        {activeVault ? (
          <VaultPage vault={activeVault} onLock={() => setActiveVault(null)} />
        ) : (
          <HomePage onVaultOpen={setActiveVault} />
        )}
      </main>
    </div>
  )
}

export default App
