import { Button } from '../../components'
import { useAppVersion } from '../../hooks'
import styles from './HomePage.module.scss'

function HomePage(): JSX.Element {
  const { version, isLoading } = useAppVersion()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>SecVault</h1>
      <p className={styles.version}>{isLoading ? 'Loading…' : `v${version}`}</p>
      <Button variant="primary">Unlock Vault</Button>
    </div>
  )
}

export default HomePage
