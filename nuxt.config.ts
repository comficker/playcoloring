import { pwa } from './config/pwa'
import { appDescription } from './constants'


export default defineNuxtConfig({
  typescript: {
    strict: true
  },
  _generate: false,
  // @ts-ignore
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    'nuxt-lazy-load',
    '@nuxtjs/partytown',
    // 'nuxt-delay-hydration',
  ],
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
  },
  css: [
    '~/assets/custom.css',
    '~/assets/font/inter.css',
    '@unocss/reset/tailwind.css',
  ],
  colorMode: {
    classSuffix: '',
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  app: {
    // pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      viewport: 'width=device-width,initial-scale=1',
      titleTemplate: '%s - playcoloring.com',
      link: [
        { rel: 'icon', href: '/favicon.png', sizes: 'any' },
        // { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/favicon.png' },
      ],
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=6.0, minimum-scale=1.0' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-touch-fullscreen', content: 'yes' },
        // { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      script: [
        {
          hid: 'gtmHead',
          innerHTML: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5PJSPNJ');`,
          //@ts-ignore
          body: true
        },
      ],
    },
  },
  pwa,
  runtimeConfig: {
    public: {
      apiBase: process.env.API
    }
  },
  build: {
    transpile: ['tslib'],
  },
  lazyLoad: {
    images: true,
    videos: true,
    audios: true,
    iframes: true,
    native: false,
    directiveOnly: false,
    //@ts-ignore
    defaultImage: '/loading.svg',
  },
})
