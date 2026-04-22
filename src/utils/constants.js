import { env } from '~/config/environment'

export const API = 'AAAA'
export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
]
export const WEBSITE_DOMAINS = (env.BUILD_MODE === 'production') ? env.WEBSITE_URL_PRODUCTION : env.WEBSITE_URL_DEVELOPMENT
export const BOARD_TYPES = ['private', 'public']