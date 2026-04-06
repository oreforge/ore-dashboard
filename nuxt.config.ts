// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-06',
  devtools: { enabled: true },
  runtimeConfig: {
    oreApiUrl: 'http://localhost:8080',
    oreToken: '',
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})
