import { useWindowControls } from '../../../hooks'
import styles from './TitleBar.module.scss'

interface TitleBarProps {
  title?: string
  onSettings?: () => void
}

function TitleBar({ title = 'SecVault', onSettings }: TitleBarProps): JSX.Element {
  const { isMaximized, minimize, toggleMaximize, close } = useWindowControls()

  return (
    <header className={styles.titleBar}>
      <span className={styles.title}>{title}</span>

      <div className={styles.controls}>
        {onSettings && (
          <>
            <button
              className={`${styles.controlBtn} ${styles.settingsBtn}`}
              onClick={onSettings}
              aria-label="Settings"
              title="Settings"
            >
              <GearIcon />
            </button>
            <div className={styles.controlSeparator} aria-hidden="true" />
          </>
        )}
        <button
          className={styles.controlBtn}
          onClick={minimize}
          aria-label="Minimize"
          title="Minimize">
          {/* Minimize — horizontal line */}
          <svg width="10" height="1" viewBox="0 0 10 1" aria-hidden="true">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>

        <button
          className={styles.controlBtn}
          onClick={toggleMaximize}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            /* Restore — two overlapping squares */
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                d="M2 2h6v6H2zM0 0v6h2V1h5V0z"
              />
            </svg>
          ) : (
            /* Maximize — single square */
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>

        <button
          className={`${styles.controlBtn} ${styles.closeBtn}`}
          onClick={close}
          aria-label="Close"
          title="Close"
        >
          {/* Close — × */}
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default TitleBar

// ── Icons ─────────────────────────────────────────────────────────────────────
const GearIcon = (): JSX.Element => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)
