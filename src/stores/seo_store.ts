import { defineStore } from 'pinia';
import axios from 'axios';

export const useSeoStore = defineStore('seo', {
  state: () => ({
    metaData: {} as Record<string, any>
  }),

  actions: {
    async fetchSeoMeta(slug: string) {
      try {
        const res = await axios.get(`/api/seo/${slug}`);
        this.metaData[slug] = res.data;
        return res.data;
      } catch (error) {
        console.error('Gagal mengambil SEO meta:', error);
        return null;
      }
    },

    async fetchDynamicSeo(type: string, slug: string) {
      try {
        const res = await axios.get(`/api/${type}/${slug}`);
        return {
          seo_title: res.data.seo_title || res.data.name || '',
          seo_description: res.data.seo_description || res.data.short_desc || ''
        };
      } catch (error) {
        console.error('Gagal mengambil dynamic SEO:', error);
        return null;
      }
    }
  }
});
