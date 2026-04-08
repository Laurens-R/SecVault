import { useWindowControls } from '../../../hooks'
import styles from './TitleBar.module.scss'

interface TitleBarProps {
  title?: string
}

function TitleBar({ title = 'SecVault' }: TitleBarProps): JSX.Element {
  const { isMaximized, minimize, toggleMaximize, close } = useWindowControls()

  return (
    <header className={styles.titleBar}>
      <span className={styles.title}>{title}</span>

      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={minimize}
          aria-label="Minimize"
          title="Minimize"
        >
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
