import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

export default defineNuxtConfig({
  appConfig: {
    version: pkg.version,
  },
  compatibilityDate: '2026-04-06',
  ssr: false,
  devtools: { enabled: true },

  runtimeConfig: {
    oreApiUrl: 'http://localhost:8080',
    oreToken: '',
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        '@vueuse/core',
        'lucide-vue-next',
        'vue-sonner',
        'reka-ui',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        '@oreforge/sdk',
        '@xterm/addon-fit',
        '@xterm/xterm',
      ],
    },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },
  imports: {
    dirs: ['types'],
  },
  modules: ['shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
})
