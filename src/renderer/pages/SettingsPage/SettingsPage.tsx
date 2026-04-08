import { useState } from 'react'
import { useSettings } from '../../hooks'
import type { AppSettings } from '../../models'
import styles from './SettingsPage.module.scss'

type SettingsTab = 'general'

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'General' },
]

interface SettingsPageProps {
  onBack: () => void
}

function SettingsPage({ onBack }: SettingsPageProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const { settings, loading, update } = useSettings()

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Back to previous screen">
            <BackIcon />
            Back
          </button>
        </div>

        <nav className={styles.nav} aria-label="Settings sections">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.id === 'general' && <GeneralIcon />}
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.content}>
        <h1 className={styles.pageTitle}>
          {TABS.find(t => t.id === activeTab)?.label}
        </h1>

        {activeTab === 'general' && (
          <GeneralTab settings={settings} loading={loading} onUpdate={update} />
        )}
      </div>
    </div>
  )
}

// ── General tab ───────────────────────────────────────────────────────────────
function GeneralTab({ settings, loading, onUpdate }: {
  settings: AppSettings
  loading: boolean
  onUpdate: (key: keyof AppSettings, value: boolean) => Promise<void>
}): JSX.Element {
  return (
    <>
      <SettingGroup title="Startup">
        <SettingRow
          title="Open SecVault at login"
          description="Automatically launch SecVault when you sign in to Windows."
          id="toggle-openAtLogin"
        >
          <Toggle
            id="toggle-openAtLogin"
            checked={settings.openAtLogin}
            onChange={v => void onUpdate('openAtLogin', v)}
            disabled={loading}
          />
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Window">
        <SettingRow
          title="Minimize to system tray"
          description="When minimizing, keep SecVault running in the system tray instead of the taskbar."
          id="toggle-minimizeToTray"
        >
          <Toggle
            id="toggle-minimizeToTray"
            checked={settings.minimizeToTray}
            onChange={v => void onUpdate('minimizeToTray', v)}
            disabled={loading}
          />
        </SettingRow>
      </SettingGroup>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SettingGroup({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section className={styles.group}>
      <h2 className={styles.groupTitle}>{title}</h2>
      <div className={styles.groupItems}>{children}</div>
    </section>
  )
}

function SettingRow({ title, description, id, children }: {
  title: string
  description?: string
  id?: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className={styles.row}>
      <div className={styles.rowText}>
        <label className={styles.rowTitle} htmlFor={id}>{title}</label>
        {description && <span className={styles.rowDesc}>{description}</span>}
      </div>
      <div className={styles.rowControl}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, disabled, id }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  id?: string
}): JSX.Element {
  return (
    <label className={`${styles.toggle} ${disabled ? styles.toggleDisabled : ''}`}>
      <input
        id={id}
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={styles.toggleTrack} aria-hidden="true" />
    </label>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const BackIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const GeneralIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

export default SettingsPage
