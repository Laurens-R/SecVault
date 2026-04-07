import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : children}
    </button>
  )
}

export default Button
