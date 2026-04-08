import { useState, useRef, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import styles from './Select.module.scss'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SelectProps<T extends string = string> {
  options: SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  label?: string
  id?: string
  className?: string
}

function Select<T extends string = string>({
  options,
  value,
  onChange,
  label,
  id,
  className,
}: SelectProps<T>): JSX.Element {
  const [open, setOpen] = useState(false)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const autoId = useId()
  const inputId = id ?? autoId

  const selected = options.find(o => o.value === value) ?? options[0]

  // Compute portal position from trigger's bounding rect
  const openDropdown = (): void => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const dropdownMaxHeight = options.length * 40 + 8 // rough estimate
      const openUpward = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow
      setDropdownStyle(openUpward ? {
        position: 'fixed',
        left: rect.left,
        bottom: window.innerHeight - rect.top + 4,
        width: rect.width,
        zIndex: 9999,
      } : {
        position: 'fixed',
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
        zIndex: 9999,
      })
    }
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent): void => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return
    const reposition = (): void => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const dropdownMaxHeight = options.length * 40 + 8
        const openUpward = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow
        setDropdownStyle(openUpward ? {
          position: 'fixed',
          left: rect.left,
          bottom: window.innerHeight - rect.top + 4,
          width: rect.width,
          zIndex: 9999,
        } : {
          position: 'fixed',
          left: rect.left,
          top: rect.bottom + 4,
          width: rect.width,
          zIndex: 9999,
        })
      }
    }
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, options.length])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open ? setOpen(false) : openDropdown(); return }
    if (!open) return
    const idx = options.findIndex(o => o.value === value)
    if (e.key === 'ArrowDown') { e.preventDefault(); onChange(options[Math.min(idx + 1, options.length - 1)].value) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); onChange(options[Math.max(idx - 1, 0)].value) }
  }

  const handleSelect = (optValue: T): void => {
    onChange(optValue)
    setOpen(false)
  }

  const dropdown = open && createPortal(
    <ul
      ref={dropdownRef}
      className={styles.dropdown}
      style={dropdownStyle}
      role="listbox"
      aria-label={label}
      tabIndex={-1}
    >
      {options.map(opt => (
        <li
          key={opt.value}
          role="option"
          aria-selected={opt.value === value}
          className={`${styles.option} ${opt.value === value ? styles.optionActive : ''}`}
          onMouseDown={e => e.preventDefault()}
          onClick={() => handleSelect(opt.value)}
        >
          {opt.icon && <span className={styles.icon} aria-hidden="true">{opt.icon}</span>}
          <span>{opt.label}</span>
          {opt.value === value && <CheckIcon />}
        </li>
      ))}
    </ul>,
    document.body,
  )

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} ref={containerRef}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <button
        id={inputId}
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => open ? setOpen(false) : openDropdown()}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
      >
        <span className={styles.triggerContent}>
          {selected.icon && <span className={styles.icon} aria-hidden="true">{selected.icon}</span>}
          <span className={styles.triggerLabel}>{selected.label}</span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {dropdown}
    </div>
  )
}

const ChevronIcon = ({ open }: { open: boolean }): JSX.Element => (
  <svg
    className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const CheckIcon = (): JSX.Element => (
  <svg
    className={styles.check}
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default Select
