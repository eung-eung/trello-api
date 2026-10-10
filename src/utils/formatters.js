import { pick } from 'lodash'
import slugify from 'slugify'

export const formatFromStringtoSlug = (str) => {
  return slugify(str, { lower: true, strict: false, locale: 'vi' })
}

export const pickUser = (user) => {
  if (!user) return { }
  return pick(user, ['_id', 'email', 'username', 'displayName', 'avatar',
    'role', 'isActive', 'createdAt', 'updatedAt'])
}