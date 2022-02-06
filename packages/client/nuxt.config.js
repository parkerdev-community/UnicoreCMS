import mainConfig from 'zirconia-admin/main.config'
import { envConfig } from 'zirconia-common'

export default mainConfig({
  server: {
    port: envConfig.frontendPort,
  },

  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],
})