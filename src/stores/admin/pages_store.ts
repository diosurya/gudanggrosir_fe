import { defineStore } from 'pinia'
import { ref } from 'vue'

interface PageData {
  title: string
  pageTitle?: string
  subtitle?: string
  seoTitle?: string
  seoDescription?: string
  description?: string
  content?: string
  faq?: { question: string; answer: string }[]
  [key: string]: any

  // settings
  no_tlp?: string
  email?: string
  alamat_1?: string
  alamat_2?: string
  alamat_3?: string
  link_shopee?: string
  link_tokped?: string
  link_tiktok?: string
  link_instagram?: string
  link_facebook?: string
  link_youtube?: string
  link_twitter?: string
  link_linkedin?: string
}

export const usePagesStore = defineStore('pages', () => {
  const pages = ref<Record<string, PageData>>({
    settings: {
      title: 'Settings',
      no_tlp: '',
      email: '',
      alamat_1: '',
      alamat_2: '',
      alamat_3: '',
      link_shopee: '',
      link_tokped: '',
      link_tiktok: '',
      link_instagram: '',
      link_facebook: '',
      link_youtube: '',
      link_twitter: '',
      link_linkedin: '',
    },
    about: {
      title: 'About',
      pageTitle: 'Tentang Gudang Grosiran',
      subtitle: 'Lorem ipsum dolor ismet',
      seoTitle: 'Ini SEO Title',
      seoDescription: 'Descriptions',
      description: 'Pelopor Produk Ramah Lingkungan',
      content: '<p>Konten dummy awal.</p>',
      faq: []
    }
  })

  const fetchPage = async (key: string) => {
    // Contoh: fetch dari API
    // const res = await fetch(`/api/pages/${key}`)
    // pages.value[key] = await res.json()
  }

  const updatePage = async (key: string, data: PageData) => {
    pages.value[key] = data
    // Nanti POST/PUT ke API
  }

  return { pages, fetchPage, updatePage }
})
