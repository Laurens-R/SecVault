import { useState, useCallback, useEffect, useRef } from 'react'
import {
  DEFAULT_OPTIONS,
  generate,
  calcEntropy,
  type PasswordOptions,
} from '../../../utils/passwordGenerator'
import styles from './PasswordGenerator.module.scss'

interface PasswordGeneratorProps {
  onAccept: (password: string) => void
  onClose: () => void
}

const SEPARATORS = [
  { label: 'Hyphen  ( - )', value: '-' },
  { label: 'Dot  ( . )',    value: '.' },
  { label: 'Underscore  ( _ )', value: '_' },
  { label: 'Space', value: ' ' },
  { label: 'None', value: '' },
]

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'max'

function strengthLevel(bits: number): StrengthLevel {
  if (bits < 40)  return 'weak'
  if (bits < 64)  return 'fair'
  if (bits < 80)  return 'good'
  if (bits < 128) return 'strong'
  return 'max'
}

function strengthLabel(level: StrengthLevel, bits: number): string {
  const names: Record<StrengthLevel, string> = {
    weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong', max: 'Very strong',
  }
  return `${names[level]}  ·  ≈${Math.round(bits)} bits of entropy`
}

function PasswordGenerator({ onAccept, onClose }: PasswordGeneratorProps): JSX.Element {
  const [opts, setOpts] = useState<PasswordOptions>(DEFAULT_OPTIONS)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const regenerate = useCallback(() => {
    setPassword(generate(opts))
    setCopied(false)
  }, [opts])

  useEffect(() => {
    regenerate()
  }, [regenerate])

  const set = useCallback(<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
    setOpts(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleCopy = (): void => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2000)
    }).catch(() => { /* clipboard unavailable */ })
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose()
  }

  const entropy = calcEntropy(opts)
  const level   = strengthLevel(entropy)

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Password Generator">
      <div className={styles.modal}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className={styles.header}>
          <h2 className={styles.title}>Password Generator</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        {/* ── Output ──────────────────────────────────────────── */}
        <div className={styles.outputRow}>
          <code className={styles.output}>{password || '—'}</code>
          <div className={styles.outputActions}>
            <button className={styles.iconBtn} onClick={regenerate} title="Regenerate" aria-label="Regenerate password">
              <RefreshIcon />
            </button>
            <button
              className={`${styles.iconBtn} ${copied ? styles.iconBtnCopied : ''}`}
              onClick={handleCopy}
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              aria-label="Copy to clipboard"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        {/* ── Strength ─────────────────────────────────────────── */}
        <div className={styles.strengthRow}>
          <div className={styles.strengthTrack}>
            <div className={`${styles.strengthFill} ${styles[level]}`} />
          </div>
          <span className={`${styles.strengthLabel} ${styles[level]}`}>
            {strengthLabel(level, entropy)}
          </span>
        </div>

        {/* ── Mode tabs ────────────────────────────────────────── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${opts.mode === 'password' ? styles.tabActive : ''}`}
            onClick={() => set('mode', 'password')}
          >
            Password
          </button>
          <button
            className={`${styles.tab} ${opts.mode === 'passphrase' ? styles.tabActive : ''}`}
            onClick={() => set('mode', 'passphrase')}
          >
            Passphrase
          </button>
        </div>

        {/* ── Options ──────────────────────────────────────────── */}
        <div className={styles.options}>
          {opts.mode === 'password' ? (
            <>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.optLabel}>Length</label>
                  <span className={styles.sliderValue}>{opts.length}</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={128}
                  value={opts.length}
                  onChange={e => set('length', Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Password length: ${opts.length}`}
                />
                <div className={styles.sliderRange}>
                  <span>4</span>
                  <span>128</span>
                </div>
              </div>

              <div className={styles.sectionLabel}>Character types</div>
              <div className={styles.checkGrid}>
                <Checkbox label="Uppercase  (A – Z)" checked={opts.uppercase} onChange={v => set('uppercase', v)} />
                <Checkbox label="Lowercase  (a – z)" checked={opts.lowercase} onChange={v => set('lowercase', v)} />
                <Checkbox label="Numbers  (0 – 9)"   checked={opts.numbers}   onChange={v => set('numbers', v)} />
                <Checkbox label="Symbols"             checked={opts.symbols}   onChange={v => set('symbols', v)} />
              </div>

              {opts.symbols && (
                <div className={styles.fieldRow}>
                  <label className={styles.optLabel}>Symbol set</label>
                  <input
                    className={styles.textInput}
                    value={opts.symbolSet}
                    onChange={e => set('symbolSet', e.target.value)}
                    maxLength={64}
                    spellCheck={false}
                    aria-label="Symbol characters"
                  />
                </div>
              )}

              <Checkbox
                label="Exclude ambiguous characters  (0, O, 1, l, I)"
                checked={opts.excludeAmbiguous}
                onChange={v => set('excludeAmbiguous', v)}
              />
            </>
          ) : (
            <>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <label className={styles.optLabel}>Words</label>
                  <span className={styles.sliderValue}>{opts.wordCount}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={opts.wordCount}
                  onChange={e => set('wordCount', Number(e.target.value))}
                  className={styles.slider}
                  aria-label={`Word count: ${opts.wordCount}`}
                />
                <div className={styles.sliderRange}>
                  <span>3</span>
                  <span>10</span>
                </div>
              </div>

              <div className={styles.fieldRow}>
                <label className={styles.optLabel}>Separator</label>
                <select
                  className={styles.select}
                  value={opts.separator}
                  onChange={e => set('separator', e.target.value)}
                  aria-label="Word separator"
                >
                  {SEPARATORS.map(s => (
                    <option key={JSON.stringify(s.value)} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <Checkbox label="Capitalize words"         checked={opts.capitalizeWords} onChange={v => set('capitalizeWords', v)} />
              <Checkbox label="Append a random number"   checked={opts.includeNumber}   onChange={v => set('includeNumber', v)} />
            </>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.useBtn} onClick={() => onAccept(password)} disabled={!password}>
            Use Password
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Reusable checkbox ──────────────────────────────────────────────────────
interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}

function Checkbox({ label, checked, onChange }: CheckboxProps): JSX.Element {
  return (
    <label className={styles.checkRow}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className={styles.checkbox}
      />
      <span>{label}</span>
    </label>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────
const CloseIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const RefreshIcon = (): JSX.Element => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </svg>
)

const CopyIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
)

const CheckIcon = (): JSX.Element => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default PasswordGenerator
