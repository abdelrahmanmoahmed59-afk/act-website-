'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useLanguage } from '@/providers/language-provider'
import styles from './search-dialog.module.css'

interface SearchResult {
  title: string
  description: string
  href: string
  category: string
}

const searchData: Record<string, SearchResult[]> = {
  en: [
    {
      title: 'Home',
      description: 'Welcome to ACT',
      href: '/',
      category: 'Navigation',
    },
    {
      title: 'About Us',
      description: 'Learn about Advanced Combined Group',
      href: '/about',
      category: 'Navigation',
    },
    {
      title: 'Services',
      description: 'Our construction and contracting services',
      href: '/services',
      category: 'Navigation',
    },
    {
      title: 'Projects',
      description: 'View our completed projects',
      href: '/projects',
      category: 'Navigation',
    },
    {
      title: 'Clients',
      description: 'Client partnerships and sectors we serve',
      href: '/clients',
      category: 'Navigation',
    },
    {
      title: 'Blog',
      description: 'Insights from ACT project teams',
      href: '/blog',
      category: 'Navigation',
    },
    {
      title: 'Media',
      description: 'Press highlights and project visuals',
      href: '/media',
      category: 'Navigation',
    },
    {
      title: 'Get Quotation',
      description: 'Request a quotation for your project',
      href: '/get-quotation',
      category: 'Navigation',
    },
    {
      title: 'Contact',
      description: 'Get in touch with us',
      href: '/contact',
      category: 'Navigation',
    },
    {
      title: 'Commercial Construction',
      description: 'Large-scale commercial building projects',
      href: '/services#commercial',
      category: 'Services',
    },
    {
      title: 'Residential Development',
      description: 'Quality residential construction',
      href: '/services#residential',
      category: 'Services',
    },
    {
      title: 'Infrastructure Projects',
      description: 'Government and infrastructure contracts',
      href: '/services#infrastructure',
      category: 'Services',
    },
    {
      title: 'Overview',
      description: 'Contracting capabilities and delivery approach',
      href: '/overview',
      category: 'Navigation',
    },
    {
      title: 'News',
      description: 'Updates and project milestones',
      href: '/news',
      category: 'Navigation',
    },
    {
      title: 'Careers',
      description: 'Join our construction teams',
      href: '/careers',
      category: 'Navigation',
    },
  ],
  ar: [
    {
      title: 'الرئيسية',
      description: 'مرحباً بك في ACT',
      href: '/',
      category: 'التنقل',
    },
    {
      title: 'نظرة عامة',
      description: 'قدرات المقاولات ونهج التسليم',
      href: '/overview',
      category: 'التنقل',
    },
    {
      title: 'من نحن',
      description: 'تعرّف على مجموعة ACT المتقدمة',
      href: '/about',
      category: 'التنقل',
    },
    {
      title: 'الخدمات',
      description: 'خدمات المقاولات والإنشاءات لدينا',
      href: '/services',
      category: 'التنقل',
    },
    {
      title: 'المشاريع',
      description: 'استعرض المشاريع المنجزة',
      href: '/projects',
      category: 'التنقل',
    },
    {
      title: 'العملاء',
      description: 'شراكات العملاء والقطاعات التي نخدمها',
      href: '/clients',
      category: 'التنقل',
    },
    {
      title: 'المدونة',
      description: 'رؤى من فرق المشاريع لدى ACT',
      href: '/blog',
      category: 'التنقل',
    },
    {
      title: 'الميديا',
      description: 'أبرز المواد الإعلامية وصور المشاريع',
      href: '/media',
      category: 'التنقل',
    },
    {
      title: 'احصل على عرض سعر',
      description: 'اطلب عرض سعر لمشروعك',
      href: '/get-quotation',
      category: 'التنقل',
    },
    {
      title: 'الأخبار',
      description: 'تحديثات ومراحل إنجاز المشاريع',
      href: '/news',
      category: 'التنقل',
    },
    {
      title: 'الوظائف',
      description: 'انضم إلى فرقنا في مواقع الإنشاء',
      href: '/careers',
      category: 'التنقل',
    },
    {
      title: 'تواصل معنا',
      description: 'تواصل مع فريقنا',
      href: '/contact',
      category: 'التنقل',
    },
    {
      title: 'الإنشاءات التجارية',
      description: 'مشاريع مبانٍ تجارية واسعة النطاق',
      href: '/services#commercial',
      category: 'الخدمات',
    },
    {
      title: 'التطوير السكني',
      description: 'إنشاءات سكنية عالية الجودة',
      href: '/services#residential',
      category: 'الخدمات',
    },
    {
      title: 'مشاريع البنية التحتية',
      description: 'عقود حكومية وبنية تحتية',
      href: '/services#infrastructure',
      category: 'الخدمات',
    },
  ],

}

function SearchDialogContent() {
  const router = useRouter()
  const { language } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      const data = searchData[language] || searchData.en
      const filtered = data.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [searchQuery, language])

  const handleSelect = (href: string) => {
    setIsOpen(false)
    setSearchQuery('')
    router.push(href)
  }

  return (
    <>
      {/* Search Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={styles.searchButton}
        aria-label="Search"
        title="Press Ctrl+K to search"
      >
        <Search size={20} />
      </button>

      {/* Search Dialog */}
      {isOpen && (
        <div className={styles.dialogOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            {/* Search Input */}
            <div className={styles.searchContainer}>
              <Search size={20} />
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={styles.searchInput}
              />
            </div>

            {/* Search Results */}
            <div className={styles.resultsContainer}>
              {results.length > 0 ? (
                <div className={styles.results}>
                  {results.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(result.href)}
                      className={styles.resultItem}
                    >
                      <div className={styles.resultContent}>
                        <div className={styles.resultTitle}>{result.title}</div>
                        <div className={styles.resultDescription}>
                          {result.description}
                        </div>
                      </div>
                      <span className={styles.resultCategory}>
                        {result.category}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className={styles.noResults}>
                  {language === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found'}
                </div>
              ) : (
                <div className={styles.placeholder}>
                  {language === 'ar'
                    ? 'ابدأ الكتابة للبحث...'
                    : 'Start typing to search...'}
                </div>
              )}
            </div>

            {/* Hints */}
            <div className={styles.hints}>
              <span className={styles.hint}>
                {language === 'ar' ? 'أدخل' : 'Enter'} <kbd>↵</kbd>
              </span>
              <span className={styles.hint}>
                <kbd>Esc</kbd> {language === 'ar' ? 'إغلاق' : 'close'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function SearchDialog() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className={styles.searchButton}
        aria-label="Search"
        title="Press Ctrl+K to search"
      >
        <Search size={20} />
      </button>
    )
  }

  return <SearchDialogContent />
}






