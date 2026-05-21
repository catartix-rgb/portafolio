import styles from './NavBar.module.css'

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <a href="../../index.html" className={styles.link}>← Portafolio</a>
      <a href="../../galeria.html" className={styles.link}>Galería 3D</a>
      <a href="../../audiovisual.html" className={styles.link}>Audiovisual 3D</a>
      <span className={styles.active}>Música 3D</span>
    </nav>
  )
}
