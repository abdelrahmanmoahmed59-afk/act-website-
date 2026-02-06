import Header from '@/components/header'
import Footer from '@/components/footer'
import ContactSection from '@/components/contact-section'
import styles from './page.module.css'

export default function Contact() {
  return (
    <main className={styles.page}>
      <Header />
      <ContactSection includeMainContentId titleAs="h1" />
      <Footer />
    </main>
  )
}

