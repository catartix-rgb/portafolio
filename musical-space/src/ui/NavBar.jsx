import styles from './NavBar.module.css'

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <a href="../../index.html" className={styles.back}>
        ← Portafolio
      </a>
      <span className={styles.label}>Espacio Musical</span>
    </nav>
  )
}
